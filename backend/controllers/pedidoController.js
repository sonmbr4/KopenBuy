const Pedido = require('../models/pedidos');
const Factura = require('../models/factura');
const Cart = require('../models/cart');
const Product = require('../models/products');
const mongoose = require('mongoose');

exports.createPedido = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const usuarioId = req.user._id;

    // 1. Obtener carrito del usuario
    const cart = await Cart.findOne({ user: usuarioId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'El carrito está vacío.' });
    }

    // 2. Verificar stock y preparar productos para el pedido
    const productosPedido = [];
    
    // Primero verificar que todo el stock esté disponible
    for (const item of cart.items) {
      if (!item.product) {
        throw new Error('Uno o más productos no tienen información válida');
      }
      
      const product = await Product.findById(item.product._id);
      if (!product) {
        throw new Error(`Producto ${item.product._id} no encontrado`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto: ${product.name}. Stock disponible: ${product.stock}`);
      }
    }
    
    // Luego, actualizar el stock y preparar los productos del pedido
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const nombre = item.product.name || 'Producto sin nombre';
      const precio = item.price || 0;
      const cantidad = item.quantity || 1;
      
      // Actualizar el stock
      product.stock -= cantidad;
      await product.save();
      
      // Agregar al array de productos del pedido
      productosPedido.push({
        producto: item.product._id,
        nombre: nombre,
        precio: precio,
        cantidad: cantidad,
        subtotal: precio * cantidad
      });
    }

    // 3. Crear el pedido
    const nuevoPedido = new Pedido({
      usuario: usuarioId,
      productos: productosPedido,
      direccionEnvio: shippingAddress,
      metodoPago: paymentMethod,
      total: cart.total
    });

    const pedidoGuardado = await nuevoPedido.save();

    // 4. Generar número de factura único
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear().toString().slice(-2);
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const contador = await Factura.countDocuments();
    const numeroFactura = `FACT-${anio}${mes}-${(contador + 1).toString().padStart(6, '0')}`;

    // 5. Crear factura automáticamente
    const nuevaFactura = new Factura({
      numeroFactura: numeroFactura,
      pedido: pedidoGuardado._id,
      usuario: usuarioId,
      total: cart.total,
      estado: 'pagada',
      detallesPago: {
        metodo: paymentMethod,
        fechaPago: new Date()
      },
      productos: productosPedido
    });

    const facturaGuardada = await nuevaFactura.save();
    
    // 6. Asociar la factura al pedido
    pedidoGuardado.factura = facturaGuardada._id;
    await pedidoGuardado.save();

    // 5. Vaciar el carrito
    cart.items = [];
    await cart.save();

    res.status(201).json({ 
      success: true, 
      message: 'Pedido y factura creados exitosamente.',
      pedido:pedidoGuardado,
      factura: facturaGuardada
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ success: false, message: 'Error al crear el pedido.' });
  }
};

// Obtener todos los pedidos (solo administradores)
exports.getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('usuario', 'nombre email')
      .sort({ fecha: -1 });
    res.json({ success: true, pedidos });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los pedidos.' });
  }
};

// Obtener pedidos del usuario actual
exports.getPedidosUsuario = async (req, res) => {
  try {
    console.log('Obteniendo pedidos para el usuario:', req.user._id);
    
    const pedidos = await Pedido.find({ usuario: req.user._id })
      .sort({ fecha: -1 })
      .populate({
        path: 'productos.producto',
        select: 'name imagen codigo', // Usar 'name' en lugar de 'nombre'
        model: 'Product'
      })
      .populate('factura', 'numeroFactura');

    console.log('Pedidos encontrados:', pedidos.length);
    
    // Asegurarse de que los nombres de los productos estén disponibles
    const pedidosFormateados = pedidos.map(pedido => {
      const productos = pedido.productos.map(item => {
        // Usar item.nombre si existe, si no, intentar con item.producto?.name
        const nombre = item.nombre || (item.producto?.name || 'Producto sin nombre');
        
        console.log('Producto en pedido:', {
          id: item.producto?._id,
          nombreGuardado: item.nombre,
          nombreProducto: item.producto?.name,
          nombreFinal: nombre
        });
        
        return {
          ...item.toObject(),
          nombre: nombre
        };
      });
      
      return {
        ...pedido.toObject(),
        productos
      };
    });

    res.json({ success: true, pedidos: pedidosFormateados });
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los pedidos del usuario.' });
  }
};

// Obtener un pedido por ID
exports.getPedidoById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID de pedido no válido' });
    }

    const pedido = await Pedido.findById(req.params.id)
      .populate('usuario', 'nombre email')
      .populate('productos.producto');

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // Verificar que el usuario sea el propietario o un administrador
    if (pedido.usuario._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'No autorizado para ver este pedido' });
    }

    res.json({ success: true, pedido });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el pedido.' });
  }
};

// Actualizar estado de un pedido
exports.updatePedido = async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID de pedido no válido' });
    }

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // Actualizar solo el estado
    pedido.estado = estado || pedido.estado;
    const pedidoActualizado = await pedido.save();

    res.json({ 
      success: true, 
      message: 'Pedido actualizado correctamente',
      pedido:pedidoActualizado 
    });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el pedido.' });
  }
};

// Eliminar un pedido
exports.deletePedido = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID de pedido no válido' });
    }

    const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);
    
    if (!pedidoEliminado) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Pedido eliminado correctamente',
      pedido:pedidoEliminado 
    });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el pedido.' });
  }
};