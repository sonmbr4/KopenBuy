const Factura = require('../models/factura');

exports.getFacturas = async (req, res) => {
  try {
    const facturas = await Factura.find().populate('pedido');
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las facturas' });
  }
};

exports.getFacturaById = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id).populate('pedido');
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(factura);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la factura' });
  }
};

exports.createFactura = async (req, res) => {
  try {
    const nuevaFactura = await Factura.create(req.body);
    res.status(201).json(nuevaFactura);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la factura' });
  }
};

exports.updateFactura = async (req, res) => {
  try {
    const factura = await Factura.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(factura);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la factura' });
  }
};

exports.deleteFactura = async (req, res) => {
  try {
    const factura = await Factura.findByIdAndDelete(req.params.id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la factura' });
  }
};
