const express = require("express");
const Rutina = require("../models/rutina");
const RutinaEjercicio = require("../models/rutinaEjercicio");
const Ejercicio = require("../models/ejercicio");
const authenticateJWT = require("../middleware/auth");
const sequelize = require("../config/database");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Obtener todas las rutinas
router.get("/", (req, res) => {    
    Rutina.findAll({
        attributes: [
            'nombre',
            [sequelize.fn('COUNT', sequelize.col('nombre')), 'count']
        ],
        group: ['nombre'],
        order: [[sequelize.fn('COUNT', sequelize.col('nombre')), 'DESC']],
        limit: 5
    })
        .then((rutinas) => {
            res.json(rutinas);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error del servidor" });
        });
});

// Obtener rutinas por id de usuario
router.get("/:id", (req, res) => {
    const { id } = req.params;
    let response = [];
    Rutina.findAll({
        where: { Usuario_id: id }
    })
        .then((rutina) => {
            // coger las rutinas con sus ejercicios
            let rutinas = rutina;

            rutinas.forEach(rutina => {
                let ejercicios = [];
                
                let Rutina_id = rutina.id;
                RutinaEjercicio.findAll({
                    where: { Rutina_id }
                })
                    .then((rutinaEjercicio) => {
                        rutinaEjercicio.forEach(ejercicio => {
                            Ejercicio.findByPk(ejercicio.Ejercicio_id)
                                .then((ejercicio) => {
                                    ejercicios.push(ejercicio);
                                })
                                .catch((error) => {
                                    console.error(error);
                                    res.status(500).json({ message: "Error del servidor" });
                                });
                        });
                        rutina.dataValues.ejercicios = ejercicios;
                        response.push(rutina);
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).json({ message: "Error del servidor" });
                    });
            });
            setTimeout(() => {
                res.json(response);
            }, 1000);

        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error del servidor", error: error });
        });
});

// Crear rutina
router.post("/", authenticateJWT, async (req, res) => {
    const { Nombre } = req.body;
    const { id } = req.user;
    Usuario_id = id;

    try {
        const rutina = await Rutina.create({ Nombre, Usuario_id });
        res.json(rutina);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

// Editar rutina
router.put("/:id", authenticateJWT, async (req, res) => {
    const { Nombre } = req.body;
    const { id } = req.params;

    try {
        const rutina = await Rutina.findByPk(id);
        if (!rutina) {
            return res.status(404).json({ message: "Rutina no encontrada" });
        }
        rutina.Nombre = Nombre || rutina.Nombre;

        await rutina.save();

        res.json({ message: "Rutina actualizada", rutina });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

// Eliminar rutina
router.delete("/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params;

    try {
        const rutina = await Rutina.findByPk(id);
        if (!rutina) {
            return res.status(404).json({ message: "Rutina no encontrada" });
        }

        await rutina.destroy();

        res.json({ message: "Rutina eliminada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

// Obtener id rutina por el nombre y el id del usuario
router.get("/:nombre/:id", (req, res) => {
    const { nombre, id } = req.params;

    Rutina.findOne({
        where: { Nombre: nombre, Usuario_id: id }
    })
        .then((rutina) => {
            res.json(rutina);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error del servidor" });
        });
});


module.exports = router;
