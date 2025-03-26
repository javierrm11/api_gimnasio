require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sequelize = require("./config/database");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const rutinasRoutes = require("./routes/rutinas");
const ejercicio = require("./routes/ejercicio");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rutinas", rutinasRoutes);
app.use("/api/ejercicio", ejercicio);


// Conectar a la base de datos y ejecutar el servidor
sequelize
   .sync({ force: false, alter: false }) // Cambiar a `alter: false` si no deseas modificar las tablas existentes.
   .then(() => {
       console.log("Base de datos sincronizada");
       app.listen(PORT, () => {
           console.log(`Servidor corriendo en http://localhost:${PORT}`);
       });
   })
   .catch((err) => console.error("Error al sincronizar la BD:", err));
