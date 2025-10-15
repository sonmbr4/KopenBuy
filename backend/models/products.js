/**
 * Modelo: Producto
 * Propósito: Define el esquema de productos para MongoDB.
 */
// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: Number,
  category: String,
  price: { type: Number, required: true, min: 10},
  image: { type: String, default: '../frontend/assets/imagenes/placeholder.png' },
  createdAt: { type: Date, default: Date.now },
  description: String,
  status: { 
    type: String, 
    enum: ['active', 'inactive'],
    default: 'active' 
  }
});

module.exports = mongoose.model('Product', ProductSchema);