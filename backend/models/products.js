// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: Number,
  category: String,
  price: { type: Number, required: true },
  image: { type: String },
  createdAt : { type: Date, default: Date.now},
  description: String,
});

module.exports = mongoose.model('Product', ProductSchema);