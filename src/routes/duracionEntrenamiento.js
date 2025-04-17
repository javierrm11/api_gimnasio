const express = require("express");
const DuracionEntrenamiento = require("../models/duracionEntrenamiento");

const router = express.Router();

// Obtener la duración de un entrenamiento
router.get("/:Rutina_id", async (req, res) => {
    try {
        const { Rutina_id } = req.params;
        const duracion = await DuracionEntrenamiento.findAll({
            where: { Rutina_id: Rutina_id }
        });
        res.json(duracion[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});


module.exports = router;
