const express = require("express");
const { User, Rutina, RutinaEjercicio, EstadisticasEjercicio, Ejercicio, DuracionEntrenamiento } = require("../models/association");
const authenticateJWT = require("../middleware/auth");
const { where } = require("sequelize");
const router = express.Router();




// Obtener el usuario autenticado
router.get("/", authenticateJWT, (req, res) => {
    const id = req.user.id;
    User.findByPk(id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.json(user);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error del servidor" });
        });
});

//obtener usuario
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id, {
            include: [
                {
                    model: Rutina,
                    as: "rutinas",
                    include: [
                        {
                            model: RutinaEjercicio,
                            as: "rutinaEjercicio",
                            include: [
                                {
                                    model: Ejercicio,
                                    as: "ejercicio",
                                },
                            ],
                        }
                    ],
                },
            ],
        });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

// editar usuario
router.put("/", authenticateJWT, async (req, res) => {
    const { Nombre_Usuario, Nombre, Email, Descripcion, Foto } = req.body;
    const { id } = req.user;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        user.Nombre_Usuario = Nombre_Usuario || user.Nombre_Usuario;
        user.Nombre = Nombre || user.Nombre;
        user.Email = Email || user.Email;
        user.Descripcion = Descripcion || user.Descripcion;
        user.Foto = Foto || user.Foto;

        await user.save();

        res.json({ message: "Usuario actualizado", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.delete("/", authenticateJWT, async (req, res) => {
    const { id } = req.user;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        await user.destroy();

        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});



module.exports = router;
