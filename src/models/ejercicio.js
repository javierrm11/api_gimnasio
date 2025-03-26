const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ejercicio = sequelize.define("Ejercicio", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    Updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},{
    tableName: 'ejercicios',  // Especificar el nombre exacto de la tabla si es diferente
    timestamps: false,  // Si no usas las columnas 'createdAt' y 'updatedAt'
});

module.exports = Ejercicio;
