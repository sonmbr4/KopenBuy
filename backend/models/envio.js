/**
 * Modelo: Envío
 * Propósito: Define la estructura de la colección de envíos en MongoDB.
 */
const mongoose = require('mongoose');

// Esquema del envío
const envioSchema = new mongoose.Schema({
  // Referencia al pedido asociado
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
  // Dirección de envío
  direccion: { type: String, required: true },
  // Estado del envío (pendiente, entregado, etc.)
  estado: { type: String, default: 'pendiente' },
  // Fecha en que se realizó el envío
  fechaEnvio: { type: Date }
});

// Exporta el modelo para usarlo en controladores y rutas
module.exports = mongoose.model('Envio', envioSchema);
