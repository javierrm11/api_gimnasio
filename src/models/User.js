const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Nombre_Usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    Foto: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Password: {
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
    Token: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    FechaCreacionToken: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    Cuenta_activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
},{
    tableName: 'usuarios',  // Especificar el nombre exacto de la tabla si es diferente
    timestamps: false,  // Si no usas las columnas 'createdAt' y 'updatedAt'
});

module.exports = User;
