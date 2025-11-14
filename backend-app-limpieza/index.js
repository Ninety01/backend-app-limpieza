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
  console.log("CONECTADO AL PUERTO: " + PORT);
});

const bbdd = "app-limpieza";

const url =
  "mongodb+srv://Ninety01:roblox123@cluster0.mccz4pa.mongodb.net/" +
  bbdd +
  "?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(url)
  .then(() => console.log("CONECTADO A LA BASE DE DATOS"))
  .catch((err) => console.log("Error en la conexión " + err));

require("./assets/models/empleadas.js");
const Empleadas = mongoose.model("empleadas");

const JWT_SECRET = "mi_clave_super_secreta";

app.get("/", (req, res) => {
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
      contrasena
    } = req.body;

    const existente = await Empleadas.findOne({ correo });
    if (existente) {
      return res.send({
        status: false,
        message: "Ya existe una cuenta registrada con este correo"
      });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const empleada = await Empleadas.create({
      nombre,
      apellido,
      documento,
      tipoDocumento,
      telefono,
      correo,
      contrasena: hash
    });

    const token = jwt.sign(
      { id: empleada._id, correo: empleada.correo },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      status: true,
      message: "Registro exitoso",
      token,
      datos: {
        id: empleada._id,
        nombre: empleada.nombre,
        apellido: empleada.apellido,
        correo: empleada.correo,
        telefono: empleada.telefono
      }
    });
  } catch (error) {
    res.send({
      status: false,
      message: "No se pudo completar el registro",
      error: error.message
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
        message: "Correo o contraseña incorrectos"
      });
    }

    const coincide = await bcrypt.compare(contrasena, empleada.contrasena);
    if (!coincide) {
      return res.send({
        status: false,
        message: "Correo o contraseña incorrectos"
      });
    }

    const token = jwt.sign(
      { id: empleada._id, correo: empleada.correo },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      status: true,
      message: "Inicio de sesión exitoso",
      token,
      datos: {
        id: empleada._id,
        nombre: empleada.nombre,
        apellido: empleada.apellido,
        correo: empleada.correo,
        telefono: empleada.telefono
      }
    });
  } catch (error) {
    res.send({
      status: false,
      message: "No se pudo iniciar sesión",
      error: error.message
    });
  }
});

app.post("/subir", function (req, res) {
  const datos = req.body;

  try {
    Empleadas.create(datos);

    res.send({
      status: true,
      message: "Datos de la empleada enviados correctamente"
    });
  } catch (error) {
    res.send({
      status: false,
      message: "No se logró enviar los datos de la empleada",
      error: error.message
    });
  }
});

app.get("/recibir", async function (req, res) {
  try {
    const empleada = await Empleadas.find({}).sort({ _id: -1 });

    res.send({
      status: true,
      message: "Datos de la empleada recibidos correctamente",
      datos: empleada
    });
  } catch (error) {
    res.send({
      status: false,
      message: "No se logró recibir los datos de la empleada",
      error: error.message
    });
  }
});
