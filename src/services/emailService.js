const nodemailer = require("nodemailer");

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
    service: "gmail", // Puedes usar otro servicio (Outlook, SMTP, etc.)
    auth: {
        user: process.env.EMAIL_USER, // Coloca tu correo
        pass: process.env.EMAIL_PASS, // Usa una contraseña segura o una App Password
    },
});

// Función para enviar el email de verificación
const enviarCorreoVerificacion = async (email, token) => {
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify?token=${token}`;
    const mailOptions = {
        from: '"Gym" <javierrumo2@gmail.com>',
        to: email,
        subject: "Verifica tu cuenta",
        html: `<h1>Bienvenido</h1>
               <p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
               <a href="${verificationLink}">Verificar cuenta</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Correo de verificación enviado a:", email);
    } catch (error) {
        console.error("Error enviando el correo:", error);
    }
};

module.exports = { enviarCorreoVerificacion };
