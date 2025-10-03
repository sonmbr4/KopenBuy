const Estadisticas = require('../models/estadisticas');
const Usuario = require('../models/usuario');
const Producto = require('../models/products');
const Pedido = require('../models/pedidos');

// Controlador para obtener las estadísticas
const obtenerEstadisticas = async (req, res) => {
    try {
        // Total de usuarios
        const totalUsuarios = await Usuario.countDocuments();

        // Total de productos
        const totalProductos = await Producto.countDocuments();

        // Total de ventas
        const totalVentas = await Pedido.countDocuments();

        // Ingresos totales
        const ingresosTotales = await Pedido.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const ingresos = ingresosTotales[0]?.total || 0;

        // Productos más vendidos (top 5)
        const productosMasVendidos = await Pedido.aggregate([
            { $unwind: "$productos" },
            { 
                $group: { 
                    _id: "$productos.producto", 
                    cantidadVendida: { $sum: "$productos.cantidad" },
                    nombreProducto: { $first: "$productos.nombre" }
                } 
            },
            { $sort: { cantidadVendida: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productoInfo"
                }
            },
            { $unwind: "$productoInfo" },
            {
                $project: {
                    _id: 0,
                    productoId: "$_id",
                    nombre: { $ifNull: ["$nombreProducto", "$productoInfo.name"] },
                    cantidadVendida: 1
                }
            }
        ]);

        // Usuarios recientes (últimos 5)
        const usuariosRecientes = await Usuario.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id createdAt')
            .lean();

        // Ventas por mes (últimos 6 meses)
        const ventasPorMes = await Pedido.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$fecha" } },
                    total: { $sum: "$total" }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 6 }
        ]).then(result =>
            result.map(item => ({
                mes: item._id,
                total: item.total
            }))
        );

        // Construir objeto de estadísticas
        const estadisticas = {
            totalUsuarios,
            totalProductos,
            totalVentas,
            ingresosTotales: ingresos,
            productosMasVendidos,
            usuariosRecientes: usuariosRecientes.map(u => ({
                usuarioId: u._id,
                fechaRegistro: u.createdAt
            })),
            ventasPorMes,
            fechaActualizacion: new Date()
        };

         // Renderizar la vista con los datos
         res.render('admin/adminEstadisticas', { 
            title: 'Estadísticas',
            estadisticas 
        });
        
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener estadísticas', error });
    }
};

module.exports = {
    obtenerEstadisticas
};