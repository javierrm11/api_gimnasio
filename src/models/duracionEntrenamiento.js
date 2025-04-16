const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DuracionEntrenamiento = sequelize.define("DuracionEntrenamiento", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Rutina_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Fecha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Duracion: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
},{
    tableName: 'duraciones_entrenamientos',  // Especificar el nombre exacto de la tabla si es diferente
    timestamps: false,  // Si no usas las columnas 'createdAt' y 'updatedAt'
});

module.exports = DuracionEntrenamiento;
