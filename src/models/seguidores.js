const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Seguidores = sequelize.define("Seguidores", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    seguidor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    seguido_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    creado_en: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},{
    tableName: 'seguidores',  // Especificar el nombre exacto de la tabla si es diferente
    timestamps: false,  // Si no usas las columnas 'createdAt' y 'updatedAt'
});

module.exports = Seguidores;
