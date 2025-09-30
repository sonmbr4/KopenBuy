const express = require('express')
const router = express.Router();
const productController = require('../controllers/productsController');
const upload = require('../config/multer');
const Pedido = require('../models/pedidos');
const Usuario = require('../models/usuario');
const estadisticasController = require('../controllers/estadisticasController');

//Ruta productos
// /admin/productos
router.get('/productos', productController.getProducts);

// /admin/productos/add
router.get('/productos/add', productController.showAddForm)

//Ver detalles del producto
router.get('/productos/:id', productController.getProductById);

//Editar productos
router.put('/productos/:id', upload.single('image'), productController.updateProduct);

// /admin/productos
router.post('/productos', upload.single('image'), productController.addProduct);

// Eliminar producto
router.delete('/productos/:id', productController.deleteProduct);

// Ruta para pedidos
router.get('/pedidos', async (req, res) => {
    try {
        const pedidos = await Pedido.find()
            .populate('usuario')
            .populate('productos.producto');

        // Transformar los datos al formato que espera la vista
        const allOrders = pedidos.map(pedido => {
            const products = pedido.productos.map(item => ({
                name: item.nombre || item.producto?.name || 'Producto no disponible',
                quantity: item.cantidad,
                price: typeof item.precio === 'number' ? item.precio : (item.producto?.price || 0)
            }));

            const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

            return {
                id: pedido._id,
                status: (pedido.estado === 'entregado') ? 'delivered' : (pedido.estado === 'enviado') ? 'shipped' : 'pending',
                customer: pedido.usuario?.nombre || 'Cliente desconocido',
                date: pedido.fecha ? new Date(pedido.fecha).toLocaleDateString() : 'Fecha no disponible',
                products,
                total
            };
        });

        res.render('admin/adminPedidos', { 
            title: 'Pedidos',
            allOrders 
        });

    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
        res.status(500).render('error', { 
            message: 'Error al cargar los pedidos',
            error
        });
    }
});

//Ruta para clientes
router.get('/clientes', async (req, res) => {
    try {
        const usuarios = await Usuario.find().lean();
        
        // Obtener el conteo de pedidos por usuario
        const pedidosPorUsuario = await Pedido.aggregate([
            {
                $group: {
                    _id: '$usuario',
                    totalCompras: { $sum: 1 }
                }
            }
        ]);

        // Convertir a un objeto para búsqueda más rápida
        const comprasPorUsuario = {};
        pedidosPorUsuario.forEach(item => {
            comprasPorUsuario[item._id.toString()] = item.totalCompras;
        });

        const clientes = usuarios.map(u => ({
            _id: u._id,
            nombre: u.nombre,
            apellido: u.apellido || '',
            email: u.email,
            direccion: u.direccion,
            telefono: u.telefono,
            activo: u.activo,
            compras: comprasPorUsuario[u._id.toString()] || 0,
            fechaRegistro: u.createdAt,
            createdAt: u.createdAt
        }));

        res.render('admin/adminClientes', { clientes });
    } catch (error) {
        console.error('Error al cargar los clientes:', error);
        res.render('admin/adminClientes', { clientes: [] });
    }
});

// Ruta para obtener estadísticas
router.get('/estadisticas', estadisticasController.obtenerEstadisticas);

module.exports = router;