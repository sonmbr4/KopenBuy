/**
 * Rutas: Checkout (API)
 * Propósito: Endpoint para finalizar compra (vacía el carrito del usuario).
 * Middleware: `authMiddleware`.
 * Modelo: `Cart`.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userMiddleware');
const Cart = require('../models/cart');

// Finalizar compra: mover carrito a pedidos
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    // Buscar el carrito del usuario
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'El carrito está vacío.' });
    }

    // Vaciar el carrito
    cart.items = [];
    await cart.save();

    res.json({ success: true, message: 'Compra finalizada. ' });
  } catch (error) {
    console.error('Error en checkout:', error);
    res.status(500).json({ success: false, message: 'Error al finalizar la compra.' });
  }
});

module.exports = router;
