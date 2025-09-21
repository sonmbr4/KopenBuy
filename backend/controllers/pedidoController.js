const Pedido = require('../models/pedido');

exports.getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate('usuario').populate('productos.producto');
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};

exports.getPedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate('usuario').populate('productos.producto');
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

exports.createPedido = async (req, res) => {
  try {
    const nuevoPedido = await Pedido.create(req.body);
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
};

exports.updatePedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
};

exports.deletePedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
};
