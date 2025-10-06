const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userMiddleware');
const Cart = require('../models/cart');
const Product = require('../models/products');

// Agregar producto al carrito
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `No hay suficiente stock. Solo quedan ${product.stock} unidades disponibles.`
      });
    }

    // Buscar o crear carrito
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({ 
        user: req.user._id, 
        items: [] 
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Verificar que la cantidad total no exceda el stock
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `No hay suficiente stock. Solo puedes agregar ${product.stock - cart.items[existingItemIndex].quantity} unidades más.`
        });
      }
      // Actualizar cantidad
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Agregar nuevo item
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price
      });
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Producto agregado al carrito',
      cartCount: cart.totalItems
    });

  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener carrito del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image');
    
    if (!cart) {
      return res.json({
        success: true,
        cart: { items: [], total: 0, totalItems: 0 }
      });
    }

    res.json({
      success: true,
      cart: {
        items: cart.items,
        total: cart.total,
        totalItems: cart.totalItems
      }
    });

  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar cantidad de item
router.put('/update/:itemId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser al menos 1'
      });
    }
    
    // Obtener el carrito
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    // Encontrar el item en el carrito
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Ítem no encontrado en el carrito'
      });
    }
    
    // Obtener el producto para verificar el stock
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Verificar que no se exceda el stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `No hay suficiente stock. Solo quedan ${product.stock} unidades disponibles.`
      });
    }

    // Actualizar la cantidad del ítem
    if (quantity <= 0) {
      // Eliminar item si la cantidad es 0 o menor
      cart.items.pull({ _id: itemId });
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Carrito actualizado',
      cartCount: cart.totalItems
    });

  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Eliminar item del carrito
router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    cart.items.pull({ _id: itemId });
    await cart.save();

    res.json({
      success: true,
      message: 'Producto eliminado del carrito',
      cartCount: cart.totalItems
    });

  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Vaciar carrito
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Carrito vaciado',
      cartCount: 0
    });

  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;