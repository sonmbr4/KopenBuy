const Envio = require('../models/envio');

exports.getEnvios = async (req, res) => {
  try {
    const envios = await Envio.find().populate('pedido');
    res.json(envios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los envíos' });
  }
};

exports.getEnvioById = async (req, res) => {
  try {
    const envio = await Envio.findById(req.params.id).populate('pedido');
    if (!envio) return res.status(404).json({ error: 'Envío no encontrado' });
    res.json(envio);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el envío' });
  }
};

exports.createEnvio = async (req, res) => {
  try {
    const nuevoEnvio = await Envio.create(req.body);
    res.status(201).json(nuevoEnvio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el envío' });
  }
};

exports.updateEnvio = async (req, res) => {
  try {
    const envio = await Envio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!envio) return res.status(404).json({ error: 'Envío no encontrado' });
    res.json(envio);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el envío' });
  }
};

exports.deleteEnvio = async (req, res) => {
  try {
    const envio = await Envio.findByIdAndDelete(req.params.id);
    if (!envio) return res.status(404).json({ error: 'Envío no encontrado' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el envío' });
  }
};
