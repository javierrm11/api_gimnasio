const express = require("express");
const User = require("../models/User");
const authenticateJWT = require("../middleware/auth");

const router = express.Router();




// Obtener el usuario autenticado
router.get("/", authenticateJWT, (req, res) => {
    res.json({ message: "Acceso autorizado", user: req.user });
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
