/**
 * Modelo: Estadísticas
 * Propósito: Agrega métricas agregadas para panel admin (usuarios, productos, ventas, ingresos, etc.).
 */
const mongoose = require('mongoose');

//Esquema de estadisticas
const EstadisticasSchema = new mongoose.Schema({
    totalUsuarios: { type: Number, default: 0 },
    totalProductos: { type: Number, default: 0 },
    totalVentas: { type: Number, default: 0 },
    ingresosTotales: { type: Number, default: 0 },
    productosMasVendidos: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
        cantidadVendida: { type: Number, default: 0 }
    }],
    usuariosRecientes: [{
        usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
        fechaRegistro: { type: Date }
    }],
    ventasPorMes: [{
        mes: { type: String },
        total: { type: Number, default: 0 }
    }],
    fechaActualizacion: { type: Date, default: Date.now }
});

//Exporta el modelo para usarlo en controladores y rutas
module.exports = mongoose.model('Estadisticas', EstadisticasSchema);
