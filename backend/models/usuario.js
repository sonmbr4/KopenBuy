// Modelo de Usuario
// Define la estructura de la colección de usuarios en MongoDB
const mongoose = require('mongoose');

// Esquema del usuario
const usuarioSchema = new mongoose.Schema({
  // Nombre del usuario (obligatorio)
  nombre: { type: String, required: true },
  // Email único y obligatorio
  email: { type: String, required: true, unique: true },
  // Contraseña del usuario
  password: { type: String, required: true },
  // Dirección del usuario (opcional)
  direccion: { type: String },
  // Teléfono del usuario (opcional)
  telefono: { type: String }
});

// Exporta el modelo para usarlo en controladores y rutas
module.exports = mongoose.model('Usuario', usuarioSchema);
