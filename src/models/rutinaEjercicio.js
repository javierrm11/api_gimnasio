const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RutinaEjercicio = sequelize.define("RutinaEjercicio", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Rutina_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Ejercicio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
},{
    tableName: 'rutinaejercicios',  // Especificar el nombre exacto de la tabla si es diferente
    timestamps: false,  // Si no usas las columnas 'createdAt' y 'updatedAt'
});

module.exports = RutinaEjercicio;
