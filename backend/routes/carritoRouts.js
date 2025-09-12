const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userMiddleware');
const Cart = require('../models/carrito');
const Product = require('../models/products');


//Agregar producto al carrito
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user._id;

        //Obtener infromacion del producto
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' })
        }

        //Buscar o crear carrito
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        //Verificar si el producto esta en el carrito
        const existingItemIndex = cart.items.findIndez(
            item => item.product.toString() === productId
        );

        if (existingItemIndes > -1) {
            //Actualiza cantidad si ya existe
            cart.items[existingItemIndes].quantity += quantity;
        } else {
            //Agregar nuevo item
            cart.item.push({
                product: productId,
                quantity,
                price: product.price,
                name: product.name,
                image: product.image
            });
        }

        await cart.save();
        await cart.populate('items.product', 'name image');

        res.json({
            success: true,
            message: 'Producto agregado al carrito',
            cart: cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al agregar producto al carrito' });
    }
});


//Obtener carrito del usuario
router.get('/', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price image');

        if (!cart) {
            return res.json({ success: true, cart: { items: [], total: 0 } });
        }

        res.json({ success: true, cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: flase, message: 'Error al obtener el carrito' });
    }
});


//Actualizar la cantidad del producto
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;


        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }

        constitemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            if (quantity <= 0) {
                //Eliminar item si la cantidad es 0 o menor
                cart.items.splice(itemIndex, 1);
            } else {
                //Actualizar cantidad
                cart.items[idemIndex].quantity = quantity;
            }

            await cart.save();
            await cart.populate('items.product', 'name price image');

            res.json({ success: true, cart });
        } else {
            res.status(404).json({ success: flase, message: 'Producto no encontrado en el carrito' })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al eliminar producto del carrito' })
    }
});


//Eliminar producto del carrito
router.delete('/remove', authMiddleware, async(req, res) => {
    try{
        const { productId } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOnde({ user: userId });
        if(!cart) {
            return res.status(404).json({ succes: false, message: 'Carrito no encontrado' });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.product', 'name price');
    
        res.json({ success: true, cart });
    
    } catch(error) {
        console.error(error);
        res.status(500).json({ succes: flase, message: 'Error al eliminar producto del carrito'});
    }
});


module.exports = router;