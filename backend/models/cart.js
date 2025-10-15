/**
 * Modelo: Carrito
 * Propósito: Define el esquema del carrito con items, totales y hooks de cálculo.
 */
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calcular totales antes de guardar
CartSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', CartSchema);