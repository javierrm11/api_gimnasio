const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const { enviarCorreoVerificacion } = require("../services/emailService"); // Importamos el servicio de email

const router = express.Router();

// Ruta de login
router.post("/login", async (req, res) => {
    const { nombreUsuario, email, password } = req.body;

    try {
        // Verificar si se pasa el nombre de usuario o el email
        let user;
        if (nombreUsuario) {
            user = await User.findOne({ where: { Nombre_Usuario: nombreUsuario, Cuenta_activa: 1 } });
        } else if (email) {
            user = await User.findOne({ where: { Email: email, Cuenta_activa: 1 } });
        }

        // Si no se encuentra el usuario
        if (!user) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        // Comparar la contraseña directamente (sin hash)
        if (password !== user.Password) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Crear el token JWT
        const token = jwt.sign(
            { id: user.id, Nombre_Usuario: user.Nombre_Usuario, Email: user.Email }, // Payload del token
            process.env.JWT_SECRET,              // Clave secreta
            { expiresIn: "1h", algorithm: 'HS256'}                 // Expiración del token
        );

        // Responder con el token
        res.json({ message: "Login exitoso", token, idUser: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});



// Genera una clave secreta segura de 128 caracteres
let JWT_SECRET = crypto.randomBytes(64).toString("hex"); 

// Función para generar el token
const generarToken = (nombreUsuario) => {
    return jwt.sign(
        { usuario: nombreUsuario },  // Payload con el nombre de usuario
        JWT_SECRET,                  // Clave secreta generada
        { expiresIn: "1h", algorithm: "HS256" }
    );
};

// Agregar un usuario
router.post("/register", async (req, res) => {
    try {
        let token = generarToken(req.body.Nombre_Usuario);
        const newUser = await User.create({ 
            Nombre_Usuario: req.body.Nombre_Usuario,
            Nombre: req.body.Nombre,
            Email: req.body.Email,
            Foto: req.body.Foto,
            Descripcion: req.body.Descripcion,
            Password: req.body.Password,
            Token: token,
            FechaCreacionToken: new Date(),
            Cuenta_activa: 0
        });
        // Enviar correo de verificación
        await enviarCorreoVerificacion(req.body.Email, token);

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ruta para verificar la cuenta
router.get("/verify?:token", async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.decode(token);


        const user = await User.findOne({ where: { Nombre_Usuario: decoded.usuario } });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Activar la cuenta
        user.Cuenta_activa = 1;
        user.Token = null; // Eliminamos el token ya usado
        await user.save();

        res.status(200).json({ message: "Cuenta activada correctamente" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Token inválido o expirado"});
    }
});


module.exports = router;
