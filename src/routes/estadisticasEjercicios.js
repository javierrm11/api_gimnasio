const express = require("express");
const {EstadisticasEjercicio, DuracionEntrenamiento, RutinaEjercicio } = require("../models/association");
const authenticateJWT = require("../middleware/auth");

const router = express.Router();

// Obtener las estadisticas de un ejercicio
router.get("/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params;
    EstadisticasEjercicio.findAll({
        where: { RutinaEjercicio_id: id }
    })
        .then((estadisticas) => {
            let response = [];
            let series = []
            estadisticas.forEach((estadistica) =>{
                if(!series.includes(estadistica.id_serie)){
                    series.push(estadistica.id_serie)
                }
            })
            series.forEach((serie) => {
                let serieData = []
                estadisticas.forEach((estadistica) => {
                    if(estadistica.id_serie == serie){
                        serieData.push(estadistica)
                    }
                })
                response.push(serieData)
            })
            res.json(response);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error del servidor" });
        });
});

// obtner el id_serie de la ultima estadistica de un ejercicio
router.get("/getIdSerie/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params;
    EstadisticasEjercicio.findOne({
        where: { RutinaEjercicio_id: id },
        order: [["id_serie", "DESC"]],
    })
        .then((estadistica) => {
            if (!estadistica) {
                return res.json({}); // No hay estadísticas disponibles
            }
            res.json({ id_serie: estadistica.id_serie });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error del servidor" });
        });
});


// Obtener estadísticas de un ejercicio por fecha, incluyendo la duración del entrenamiento
router.post("/getByDate", authenticateJWT, async (req, res) => {
    const { id, fecha, Rutina_id } = req.body;

    try {
        let fechaBusqueda = fecha;

        // Si la fecha es null, buscar la última disponible
        if (!fechaBusqueda) {
            const ultimaEstadistica = await EstadisticasEjercicio.findOne({
                where: { RutinaEjercicio_id: id },
                order: [["Fecha", "DESC"]],
            });

            if (!ultimaEstadistica) {
                return res.json({}); // No hay estadísticas disponibles
            }

            fechaBusqueda = ultimaEstadistica.Fecha;
        }

        // Obtener estadísticas del ejercicio para la fecha
        const estadisticas = await EstadisticasEjercicio.findAll({
            where: {
                RutinaEjercicio_id: id,
                Fecha: fechaBusqueda
            },
            order: [["id_serie", "ASC"]]
        });

        // Agrupar por id_serie
        const estadisticasPorSerie = {};
        estadisticas.forEach(est => {
            const serieId = est.id_serie;
            if (!estadisticasPorSerie[serieId]) {
                estadisticasPorSerie[serieId] = [];
            }
            estadisticasPorSerie[serieId].push(est);
        });

        // Obtener duración del entrenamiento
        const duracion = await DuracionEntrenamiento.findOne({
            where: {
                Rutina_id: Rutina_id,
                Fecha: fechaBusqueda
            },
            attributes: ["Duracion"]
        });

        if (!duracion) {
            return res.json({});
        }

        res.json({
            fecha: fechaBusqueda,
            estadisticas: estadisticasPorSerie,
            duracion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});


// Obtener estadisticas de un ejercicio por Num_Series de EjercicioRutina cogera las estadisticas de la ultim serie pero pondra solo las series de Num_Series
router.post("/getByNumSeries", authenticateJWT, async (req, res) => {
    const { id } = req.body;

    try {
        // obtener el numSeries de  el rutinaEjercicio
        const rutinaEjercicio = await RutinaEjercicio.findOne({
            where: {
                id: id
            }
        });
        console.log("RutinaEjercicio:", rutinaEjercicio);
        if (!rutinaEjercicio) {
            return res.status(404).json({ message: "RutinaEjercicio no encontrada" });
        }

        // Obtener estadísticas del ejercicio para la fecha
        const estadisticas = await EstadisticasEjercicio.findAll({
            where: {
                RutinaEjercicio_id: id,
            },
            order: [["id_serie", "DESC"]],
            limit: rutinaEjercicio.Num_Series
        });

        // Filtrar las estadísticas por Num_Series
        const estadisticasFiltradas = estadisticas.filter(estadistica => {
            return estadistica.Serie <= rutinaEjercicio.Num_Series;
        });

        res.json(estadisticasFiltradas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});


// agregar estadisticas de una rutina
router.post("/agregar/:idRutina", authenticateJWT, async (req, res) => {
    const { ejercicios, fecha, duracion } = req.body;  // Se asume que 'ejercicios' es un array
    const { idRutina } = req.params;
    console.log("Ejercicios:", ejercicios);
    console.log("Fecha:", fecha);
    console.log("Duracion:", duracion);
    console.log("ID Rutina:", idRutina);
    try {
        // insertar la duración del entrenamiento
        const nuevaDuracion = await DuracionEntrenamiento.create({
            Rutina_id: idRutina,
            Fecha: fecha,
            Duracion: duracion
        });


        if (!nuevaDuracion) {
            return res.status(404).json({ message: "No se encontró la duración del entrenamiento para la fecha especificada.", duracionEntrenamiento });
        }

        // Insertar múltiples estadísticas de ejercicio
        const nuevasEstadisticas = [];

        for (const ejercicio of ejercicios) {
            const { RutinaEjercicio_id, id_serie, serie, peso, repeticiones } = ejercicio;

            // Crear nuevas estadísticas de ejercicio
            const nuevaEstadistica = await EstadisticasEjercicio.create({
                RutinaEjercicio_id,
                id_serie,
                Serie: serie,
                Peso: peso,
                Repeticiones: repeticiones,
                Fecha: fecha
            });

            nuevasEstadisticas.push(nuevaEstadistica);  // Agregar al array de estadísticas creadas
        }

        // si el numero de series es diferente a la actual de num_series se actualiza
        const rutinaEjercicio = await RutinaEjercicio.findOne({
            where: {
                id: ejercicios[0].RutinaEjercicio_id
            }
        });
        if(rutinaEjercicio.Num_Series != ejercicios.length){
            await RutinaEjercicio.update({
                Num_Series: ejercicios.length
            }, {
                where: {
                    id: ejercicios[0].RutinaEjercicio_id
                }
            });
        }
        // Responder con todas las estadísticas creadas
        res.status(201).json(nuevasEstadisticas);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor", error });
    }
});





module.exports = router;
