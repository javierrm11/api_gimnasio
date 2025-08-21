const User = require("./User");
const Rutina = require("./Rutina");
const DuracionEntrenamiento = require("./duracionEntrenamiento");
const RutinaEjercicio = require("./rutinaEjercicio");
const EstadisticasEjercicio = require("./estadisticasEjercicio");
const Ejercicio = require("./ejercicio");
const Seguidores = require("./seguidores");
// Definir asociaciones

// Usuario tiene muchas rutinas y una rutina pertenece a un usuario
User.hasMany(Rutina, { foreignKey: "Usuario_id", as: "rutinas" });
Rutina.belongsTo(User, { foreignKey: "Usuario_id", as: "usuario" });

// RutinaEjercicio tiene muchas estadísticas de ejercicio y una estadística de ejercicio pertenece a un RutinaEjercicio
RutinaEjercicio.hasMany(EstadisticasEjercicio, { foreignKey: "RutinaEjercicio_id", as: "estadisticas" });
EstadisticasEjercicio.belongsTo(RutinaEjercicio, { foreignKey: "RutinaEjercicio_id", as: "rutinaEjercicio" });

// Rutina tiene muchas DuracionEntrenamiento y una DuracionEntrenamiento pertenece a una Rutina
Rutina.hasMany(DuracionEntrenamiento, { foreignKey: "Rutina_id", as: "duracionEntrenamiento" });
DuracionEntrenamiento.belongsTo(Rutina, { foreignKey: "Rutina_id", as: "rutina" });

// RutinaEjercicio tiene un ejercicio y un ejercicio puede tener muchas RutinaEjercicio
RutinaEjercicio.belongsTo(Ejercicio, { foreignKey: "Ejercicio_id", as: "ejercicio" });
Ejercicio.hasMany(RutinaEjercicio, { foreignKey: "Ejercicio_id", as: "rutinaEjercicio" });

// RutinaEjercicio tiene una rutina y una rutina puede tener muchas RutinaEjercicio
RutinaEjercicio.belongsTo(Rutina, { foreignKey: "Rutina_id", as: "rutina" });
Rutina.hasMany(RutinaEjercicio, { foreignKey: "Rutina_id", as: "rutinaEjercicio" });

// Usuario tiene muchos seguidores y un usuario puede seguir a muchos usuarios
User.hasMany(Seguidores, { foreignKey: "seguido_id", as: "seguidores" });
User.hasMany(Seguidores, { foreignKey: "seguidor_id", as: "seguidos" });
Seguidores.belongsTo(User, { foreignKey: "seguido_id", as: "seguidor" });
Seguidores.belongsTo(User, { foreignKey: "seguidor_id", as: "seguido" });



module.exports = { User, Rutina, DuracionEntrenamiento, RutinaEjercicio, EstadisticasEjercicio, Ejercicio, Seguidores };
