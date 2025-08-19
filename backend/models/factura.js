// Modelo de Factura
// Define la estructura de la colección de facturas en MongoDB
const mongoose = require('mongoose');

// Esquema de la factura
const facturaSchema = new mongoose.Schema({
  // Referencia al pedido asociado
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
  // Fecha de emisión de la factura
  fecha: { type: Date, default: Date.now },
  // Total de la factura
  total: { type: Number, required: true }
});

// Exporta el modelo para usarlo en controladores y rutas
module.exports = mongoose.model('Factura', facturaSchema);
