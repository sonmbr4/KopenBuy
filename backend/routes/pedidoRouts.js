const express = require('express');
const router = express.Router();
const userMiddleware = require('../middlewares/userMiddleware')
const Pedido = require('../models/pedido');
const Carrito = require('../models/cart');
const Producto = require('../models/products');


//Crear nuevo pedido
router.post('/create', userMiddleware, async (req, res) => {
    try{
        const { shippingAddress, paymentMethod } = req.body;

        //obtener carrito del usuario
        const cart = await Carrito.findOne({ user: req.user._id }).populate('items.product');

        if(!cart || cart.items.length === 0){
            return res.status(400).json({
                success:false,
                message: 'El carrito esta vacio'
            });
        }

        //Preparar items del pedido
        const pedidoItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
            name: item.product.name
        }));

        //Crear pedido
        const pedido = new Pedido({
            user: req.user._id,
            items: pedidoItems,
            total: cart.total,
            shippingAddress,
            paymentMethod,
            status: 'pendiente'
        });

        await pedido.save();

        //Vaciar carrito
        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            message: 'Pedido creado exitosamente',
            pedido:{
                id: pedido._id,
                pedidoNumber: pedido.pedidoNumber,
                total: pedido.total,
                status: pedido.status
            }
        });
    } catch (error){
        console.error('Error al crear pedido:', error);
        res.status(500).json({
            success: flase,
            message: 'Error interno del servidor'
        });
    }
});


//obtener todos los pedidos del usuario
router.get('/', userMiddleware, async (req, res) => {
    try{
        const pedido = await Pedido.find({ user: req.user._id })
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            pedido
        });

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

//Obtener pedido especifico
router.get('/:pedidoId', userMiddleware, async (req, res) => {
    try{
        const pedido = await Pedido.findOne({
            _id: req.params.pedidoId,
            user: req.user._id
        }).populate('items.product', 'name image description');

        if(!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.json({
            success: true,
            pedido
        });

    } catch (error){
        console.error('error al obtener pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

//Cancelar pedido (Solo si esta pendiente)
router.put('/:pedidoId/cancel', userMiddleware, async (req, res) => {
    try{
        const pedido = await Pedido.findOne({
            _id: req.params.pedidoId,
            user: req.user._id
        });

        if(!pedido){
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        pedido.status = 'cancelado';
        await pedido.save();

        res.json({
            success: true,
            message: 'Pedido cancelado exitosamente'
        });

    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;