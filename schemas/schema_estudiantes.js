const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema_estudiantes = new Schema(
    { 
        nombre: String, 
        usuario: {type: String, unique: true },
        codigo: String,
        correo: String,
        celular: Number,
        fecha: Date,
        estado: Number,
    });

module.exports=schema_estudiantes