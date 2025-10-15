/**
 * Modelo: Categoría
 * Propósito: Define la estructura de la colección de categorías en MongoDB.
 */
const mongoose = require('mongoose');

// Esquema de la categoría
const categoriaSchema = new mongoose.Schema({
  // Nombre de la categoría (obligatorio)
  nombre: { type: String, required: true },
  // Descripción de la categoría (opcional)
  descripcion: { type: String }
});

// Exporta el modelo para usarlo en controladores y rutas
module.exports = mongoose.model('Categoria', categoriaSchema);
