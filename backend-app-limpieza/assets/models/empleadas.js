const mongoose = require("mongoose");

const EmpleadaSchema = new mongoose.Schema(
  {
    nombre: String,
    apellido: String,
    documento: String,
    tipoDocumento: String,
    telefono: String,
    correo: String,
    contrasena: String
  },
  { collection: "empleadas" }
);

mongoose.model("empleadas", EmpleadaSchema);
