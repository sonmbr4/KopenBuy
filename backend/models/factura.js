const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema({
  numeroFactura: {
    type: String,
    unique: true,
    sparse: true
  },
  pedido: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pedido', 
    required: true 
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  },
  total: { 
    type: Number, 
    required: true 
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagada', 'vencida', 'cancelada'],
    default: 'pendiente'
  },
  detallesPago: {
    metodo: String,
    referencia: String,
    fechaPago: Date
  },
  productos: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    nombre: String,
    precio: Number,
    cantidad: Number,
    subtotal: Number
  }]
});

module.exports = mongoose.model('Factura', facturaSchema);