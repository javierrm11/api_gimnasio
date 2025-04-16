const User = require("./user");
const Rutina = require("./rutina");

// Definir asociaciones
User.hasMany(Rutina, { foreignKey: "Usuario_id", as: "Rutinas" });
Rutina.belongsTo(User, { foreignKey: "Usuario_id", as: "Usuario" });

module.exports = { User, Rutina };