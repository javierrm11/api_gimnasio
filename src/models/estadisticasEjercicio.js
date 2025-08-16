const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EstadisticasEjercicio = sequelize.define("EstadisticasEjercicio", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_serie: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    RutinaEjercicio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Serie: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Peso: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Repeticiones: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Fecha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},{
    tableName: 'estadisticas_ejercicios',  // Especificar el nombre exacto de la tabla si es diferente
    timestamps: false,  // Si no usas las columnas 'createdAt' y 'updatedAt'
});

module.exports = EstadisticasEjercicio;
