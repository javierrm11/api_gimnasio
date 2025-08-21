const express = require("express");
const User = require("../models/User");
const Seguidores = require("../models/seguidores");
const authenticateJWT = require("../middleware/auth");
const sequelize = require("../config/database");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");

const router = express.Router();

// coger todas los seguidores de un usuario
router.get("/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params;

    try {
        const seguidores = await Seguidores.findAll({
            where: { seguidor_id: id },
            include: [{
                model: User,
                as: "seguido",
                attributes: ["id", "username"]
            }]
        });
        res.json(seguidores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

// seguir a un usuario
router.post("/", authenticateJWT, async (req, res) => {
    const { seguido_id } = req.body;
    const seguidor_id = req.user.id;

    try {
        // Verificar si ya se sigue al usuario
        const existingFollow = await Seguidores.findOne({
            where: { seguidor_id, seguido_id }
        });

        if (existingFollow) {
            return res.status(400).json({ message: "Ya sigues a este usuario" });
        }

        // Crear el seguimiento
        const nuevoSeguidor = await Seguidores.create({
            seguidor_id,
            seguido_id
        });

        res.status(201).json(nuevoSeguidor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});
// dejar de seguir a un usuario
router.delete("/:seguido_id", authenticateJWT, async (req, res) => {
    const { seguido_id } = req.params;
    const seguidor_id = req.user.id;

    try {
        // Buscar el seguimiento
        const seguimiento = await Seguidores.findOne({
            where: { seguidor_id, seguido_id }
        });

        if (!seguimiento) {
            return res.status(404).json({ message: "No sigues a este usuario" });
        }

        // Eliminar el seguimiento
        await Seguidores.destroy({
            where: { seguidor_id, seguido_id }
        });

        res.status(200).json({ message: "Dejaste de seguir al usuario" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});



module.exports = router;
