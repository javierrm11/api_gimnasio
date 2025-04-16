const express = require("express");
const authenticateJWT = require("../middleware/auth");
const sequelize = require("../config/database");
const { User, Rutina, RutinaEjercicio, Ejercicio } = require("../models/association");
const { estadisticasEjercicio } = require("../models/estadisticasEjercicio");
const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");

const router = express.Router();

// Obtener todas las rutinas, con el nombre del usuario y con filtro de busqueda por nombre de usuario o nombre de rutina
router.get("/", async (req, res) => {
  const { busqueda } = req.query;

  try {
    let usuarios = [];

    if (busqueda) {
      // Buscar usuarios por nombre, con o sin rutinas
      const usuariosPorNombre = await User.findAll({
        attributes: ["id", "Nombre_Usuario", "Foto"],
        where: {
          Nombre_Usuario: {
            [Op.like]: `${busqueda}%`,
          },
        },
        include: {
          model: Rutina,
          as: "rutinas",
          attributes: ["id", "Nombre", "Descripcion"],
        },
      });

      // Buscar usuarios que tengan rutinas con nombre coincidente
      const usuariosPorRutina = await User.findAll({
        attributes: ["Nombre_Usuario", "Foto", "id"],
        include: {
          model: Rutina,
          as: "rutinas",
          attributes: ["id", "Nombre", "Descripcion"],
          where: {
            Nombre: {
              [Op.like]: `${busqueda}%`,
            },
          },
        },
      });

      // Unir resultados sin duplicar usuarios
      const mapUsuarios = new Map();

      [...usuariosPorNombre, ...usuariosPorRutina].forEach((usuario) => {
        const existente = mapUsuarios.get(usuario.Nombre_Usuario);

        if (existente) {
          // Unir rutinas si ya estaba
          existente.rutinas = [
            ...existente.rutinas,
            ...usuario.rutinas.filter(
              (r) =>
                !existente.rutinas.some(
                  (er) => er.id === r.id
                )
            ),
          ];
        } else {
          mapUsuarios.set(usuario.Nombre_Usuario, {
            ...usuario.toJSON(),
          });
        }
      });

      usuarios = Array.from(mapUsuarios.values());
    } else {
      // Si no hay filtro, traer todos los usuarios con sus rutinas
      usuarios = await User.findAll({
        attributes: ["id","Nombre_Usuario", "Foto"],
        include: {
          model: Rutina,
          as: "rutinas",
          attributes: ["id", "Nombre", "Descripcion"],
        },
      });
    }

    // Filtrar usuarios que tengan al menos una rutina
    const rutinas = usuarios.filter(
      (usuario) => usuario.rutinas && usuario.rutinas.length > 0
    );

    res.json(rutinas);
  } catch (error) {
    console.error("Error al obtener rutinas:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Obtener los 5 grupos mas utilizados con sus ejercicios
router.get("/index", async (req, res) => {
  try {
    // Obtener las rutinas agrupadas y ordenadas
    const gruposEjercicios = await Ejercicio.findAll({
      attributes: [
        "Categoria",
        [sequelize.fn("COUNT", sequelize.col("Categoria")), "count"],
      ],
      group: ["Categoria"],
      order: [[sequelize.fn("COUNT", sequelize.col("Categoria")), "DESC"]],
      limit: 5,
    });

    let grupos = [];

    // Crear un array con los nombres únicos de rutina
    gruposEjercicios.forEach((grupo) => {
      if (!grupos.includes(grupo.Categoria)) {
        grupos.push(grupo.Categoria);
      }
    });

    // Utilizar Promise.all para realizar todas las consultas de ejercicios en paralelo
    const response = await Promise.all(
      grupos.map(async (grupo) => {
        const ejercicios = await Ejercicio.findAll({
          where: { Categoria: grupo },
        });

        return { grupo, ejercicios };
      })
    );

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Obtener rutinas por id de usuario
router.get("/usuario/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const rutinas = await Rutina.findAll({
      where: { Usuario_id: id },
      include: {
        model: RutinaEjercicio,
        as: "rutinaEjercicio",
        include: {
          model: Ejercicio,
          as: "ejercicio",
        },
      },
    });

    const response = rutinas.map((rutina) => {
      const ejercicios = (rutina.rutinaEjercicios || []).map((rutinaEjercicio) => {
        const ejercicioData = rutinaEjercicio.ejercicio;
        return {
          ...ejercicioData?.dataValues,
          Num_Series: rutinaEjercicio.Num_Series,
        };
      });

      return {
        ...rutina.dataValues,
        ejercicios,
      };
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor", error: error });
  }
});

// Obtener rutina por id
router.get("/:id", (req, res) => {
  const { id } = req.params;

  let response = [];
  Rutina.findAll({
    where: { id: id },
  })
    .then((rutina) => {
      // coger las rutinas con sus ejercicios
      let rutinas = rutina;

      rutinas.forEach((rutina) => {
        let ejercicios = [];

        let Rutina_id = rutina.id;
        RutinaEjercicio.findAll({
          where: { Rutina_id },
        })
          .then((rutinaEjercicio) => {
            rutinaEjercicio.forEach((ejercicio) => {
              Ejercicio.findByPk(ejercicio.Ejercicio_id)
                .then((ejercicioData) => {
                  if (ejercicioData) {
                    ejercicios.push({
                      ...ejercicioData.dataValues,
                      Num_Series: ejercicio.Num_Series,
                      ejercicioRutina_id: ejercicio.id,
                    });
                  }
                })
                .catch((error) => {
                  console.error(error);
                  res.status(500).json({ message: "Error del servidor" });
                });
            });
            rutina.dataValues.ejercicios = ejercicios;
            response.push(rutina);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error del servidor" });
          });
      });
      setTimeout(() => {
        res.json(response);
      }, 1000);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Error del servidor", error: error });
    });
});

// Crear rutina
router.post("/", authenticateJWT, async (req, res) => {
  const { Nombre, Descripcion } = req.body;
  const { id } = req.user;
  Usuario_id = id;
  console.log(Usuario_id);

  try {
    const rutina = await Rutina.create({ Nombre, Descripcion, Usuario_id });
    res.json(rutina);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Editar rutina
router.put("/:id", authenticateJWT, async (req, res) => {
  const { Nombre, Descripcion } = req.body;
  const { id } = req.params;

  try {
    const rutina = await Rutina.findByPk(id);
    if (!rutina) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }
    rutina.Nombre = Nombre || rutina.Nombre;
    rutina.Descripcion = Descripcion || rutina.Descripcion;

    await rutina.save();

    res.json({ message: "Rutina actualizada", rutina });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Eliminar rutina
router.delete("/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const rutina = await Rutina.findByPk(id);
    if (!rutina) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    await rutina.destroy();

    res.json({ message: "Rutina eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Obtener id rutina por el nombre y el id del usuario
router.get("/:nombre/:id", (req, res) => {
  const { nombre, id } = req.params;

  Rutina.findOne({
    where: { Nombre: nombre, Usuario_id: id },
  })
    .then((rutina) => {
      res.json(rutina);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Error del servidor" });
    });
});

module.exports = router;
