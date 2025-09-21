// Modelo de Pedido
// Define la estructura de la colección de pedidos en MongoDB
const mongoose = require('mongoose');

// Esquema del pedido
const pedidoSchema = new mongoose.Schema({
  // Referencia al usuario que realiza el pedido
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  // Lista de productos y cantidades
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true }
  }],
  // Estado del pedido (pendiente, enviado, etc.)
  estado: { type: String, default: 'pendiente' },
  // Fecha de creación del pedido
  fecha: { type: Date, default: Date.now }
});

// Exporta el modelo para usarlo en controladores y rutas
module.exports = mongoose.model('Pedido', pedidoSchema);
