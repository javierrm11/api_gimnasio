const express = require("express");
const { User, Rutina, RutinaEjercicio, EstadisticasEjercicio, Ejercicio, DuracionEntrenamiento } = require("../models/association");
const authenticateJWT = require("../middleware/auth");
const { where } = require("sequelize");
const upload = require("../middleware/upload"); // archivo que configuraste con multer
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
router.put("/", authenticateJWT, upload.single("fotoPerfil"), async (req, res) => {
    const { Nombre_Usuario, Nombre, Email, Descripcion } = req.body;
    const { id } = req.user;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Si hay una nueva imagen, la actualizamos
        const fotoPath = req.file ? `/uploads/profiles/${req.file.filename}` : user.Foto;

        // Actualizamos los campos
        user.Nombre_Usuario = Nombre_Usuario || user.Nombre_Usuario;
        user.Nombre = Nombre || user.Nombre;
        user.Email = Email || user.Email;
        user.Descripcion = Descripcion || user.Descripcion;
        user.Foto = fotoPath;

        await user.save();

        res.json({ message: "Usuario actualizado", user });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ message: "Error del servidor", error: error.message });
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
