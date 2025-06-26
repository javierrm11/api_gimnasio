const express = require("express");
const Ejercicio = require("../models/ejercicio");
const RutinaEjercicio = require("../models/rutinaEjercicio");
const Rutina = require("../models/rutina.js");
const authenticateJWT = require("../middleware/auth");
const sequelize = require("../config/database");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");

const router = express.Router();

// coger todas las categorias
router.get("/categorias", async (req, res) => {
    try {
        const categorias = await Ejercicio.findAll({
            attributes: [
                [sequelize.fn("DISTINCT", sequelize.col("Categoria")), "Categoria"],
            ],
        });
        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//coger todos los ejercicios de una categoria
router.get("/:categoria", async (req, res) => {
    try {
        const ejercicios = await Ejercicio.findAll({
            where: { Categoria: req.params.categoria }
        });
        res.json(ejercicios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

// Añadir un ejercicio a una rutina
router.post("/", authenticateJWT, async (req, res) => {    
    const { Nombre_Rutina, Nombre_Ejercicio, Num_Series } = req.body;
    const Usuario_id = req.user.id;

    try {
        // Find the routine and include the user
        const rutina = await Rutina.findOne({
            where: { Nombre: Nombre_Rutina, Usuario_id },
        });

        if (!rutina) {
            return res.status(404).json({ message: "Rutina no encontrada" });
        }

        // Find the exercise
        const ejercicio = await Ejercicio.findOne({
            where: { Nombre: Nombre_Ejercicio },
        });

        if (!ejercicio) {
            return res.status(404).json({ message: "Ejercicio no encontrado" });
        }

        // Add the exercise to the routine
        const rutinaEjercicio = await RutinaEjercicio.create({
            Rutina_id: rutina.id,
            Ejercicio_id: ejercicio.id,
            Num_Series,
        });

        res.json(rutinaEjercicio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
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
