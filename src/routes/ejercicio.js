const express = require("express");
const Ejercicio = require("../models/ejercicio");
const RutinaEjercicio = require("../models/rutinaEjercicio");
const Rutina = require("../models/rutina");
const authenticateJWT = require("../middleware/auth");
const sequelize = require("../config/database");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");

const router = express.Router();

// Añadir un ejercicio a una rutina
router.post("/", authenticateJWT, async (req, res) => {    
    const { Nombre_Rutina } = req.body;
    const { Nombre_Ejercicio } = req.body;
    const Usuario_id = req.user.id;
    // llamar a la ruta de rutina para coger el id de la rutina
    Rutina.findOne({
        where: { Nombre: Nombre_Rutina, Usuario_id: Usuario_id }
    })
        .then((rutina) =>{
            const Rutina_id = rutina.id;
            // llamar a la ruta de ejercicio para coger el id del ejercicio
            Ejercicio.findOne({
                where: { Nombre: Nombre_Ejercicio }
            })
                .then((ejercicio) =>{
                    const Ejercicio_id = ejercicio.id;
                    // añadir el ejercicio a la rutina
                    RutinaEjercicio.create({ Rutina_id, Ejercicio_id })
                        .then((rutinaEjercicio) => {
                            res.json(rutinaEjercicio);
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).json({ message: "Error del servidor" });
                        });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: "Error del servidor" });
                });
        })
   

});

// Eliminar un ejercicio de una rutina
router.delete("/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const Usuario_id = req.user.id;

    try {
        const rutinaEjercicio = await RutinaEjercicio.destroy({
            where: { id },
        });
        res.json({ message: "Ejercicio eliminado de la rutina" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});


module.exports = router;
