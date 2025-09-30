const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    cantidad: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  estado: { 
    type: String, 
    enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente' 
  },
  direccionEnvio: {
    fullName: String,
    direccion: String,
  },
  metodoPago: {
    type: String,
    enum: ['visa', 'mastercard', 'efectivo']
  },
  total: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  numeroPedido: { type: String, unique: true },
  factura: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Factura' 
  }
});

// Generar número de pedido único
pedidoSchema.pre('save', async function(next) {
  if (!this.numeroPedido) {
    const count = await mongoose.model('Pedido').countDocuments();
    this.numeroPedido = `PED-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);