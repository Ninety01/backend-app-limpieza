const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log("CONECTADO AL PUERTO:" + PORT);
});

const bbdd = "app-limpieza";

const url =
  "mongodb+srv://Ninety01:roblox123@cluster0.mccz4pa.mongodb.net/" +
  bbdd +
  "?retryWrites=true&w=majority&appName=Cluster0";

const connection = mongoose.connect(url);

connection
  .then(function () {
    console.log("CONECTADO A LA BASE DE DATOS");
  })
  .catch(function (error) {
    console.log("Error en la conexión " + error);
  });

require("./assets/models/empleadas.js");
const Empleadas = mongoose.model("empleadas");

const JWT_SECRET = "clave_super_secreta_cambiala_luego";

app.get("/", function (req, res) {
  res.send("API de backend funcionando");
});

app.post("/registro", async function (req, res) {
  try {
    const {
      nombre,
      apellido,
      documento,
      tipoDocumento,
      telefono,
      correo,
      contrasena,
    } = req.body;

    const existe = await Empleadas.findOne({ correo });
    if (existe) {
      return res.send({
        status: false,
        message: "El correo ya está registrado",
      });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const nueva = await Empleadas.create({
      nombre,
      apellido,
      documento,
      tipoDocumento,
      telefono,
      correo,
      contrasena: hash,
    });

    const token = jwt.sign(
      { id: nueva._id, correo: nueva.correo },
      JWT_SECRET
    );

    res.send({
      status: true,
      message: "Registro exitoso",
      token,
      datos: nueva,
    });
  } catch (error) {
    res.send({
      status: false,
      message: "Error en el registro",
      error: error.message,
    });
  }
});

app.post("/login", async function (req, res) {
  try {
    const { correo, contrasena } = req.body;

    const empleada = await Empleadas.findOne({ correo });

    if (!empleada) {
      return res.send({
        status: false,
        message: "Correo no registrado",
      });
    }

    const ok = await bcrypt.compare(contrasena, empleada.contrasena);
    if (!ok) {
      return res.send({
        status: false,
        message: "Contraseña incorrecta",
      });
    }

    const token = jwt.sign(
      { id: empleada._id, correo: empleada.correo },
      JWT_SECRET
    );

    res.send({
      status: true,
      message: "Inicio de sesión exitoso",
      token,
      datos: empleada,
    });
  } catch (error) {
    res.send({
      status: false,
      message: "Error en el inicio de sesión",
      error: error.message,
    });
  }
});

app.put("/perfil/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const { nombre, correo, telefono, localidad, direccion } = req.body;

    const datosActualizados = {
      nombre,
      correo,
      telefono,
      zona: localidad, 
      notas: direccion, 
    };

    const empleada = await Empleadas.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true }
    );

    if (!empleada) {
      return res.send({
        status: false,
        message: "No se encontró la empleada",
      });
    }

    res.send({
      status: true,
      message: "Perfil actualizado correctamente",
      datos: empleada,
    });
  } catch (error) {
    res.send({
      status: false,
      message: "Error al actualizar el perfil",
      error: error.message,
    });
  }
});
