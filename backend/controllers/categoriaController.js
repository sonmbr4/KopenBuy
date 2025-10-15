/**
 * Controlador: Categoría
 * Responsabilidades: Gestiona las operaciones CRUD para las categorías.
 * Rutas relacionadas: ver `backend/routes/categoriaRouts.js`.
 */
 const Categoria = require('../models/categoria');

/**
 * Obtiene todas las categorías.
 * Parámetros: ninguno en ruta.
 * Respuesta: 200 con arreglo de categorías | 500 en error.
 */
 exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
};

/**
 * Obtiene una categoría por ID.
 * Parámetros: req.params.id (string ObjectId)
 * Respuesta: 200 con la categoría | 404 si no existe | 500 en error.
 */
 exports.getCategoriaById = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
};

/**
 * Crea una nueva categoría.
 * Body esperado: { nombre: string, ... }
 * Respuesta: 201 con la categoría creada | 500 en error.
 */
 exports.createCategoria = async (req, res) => {
  try {
    const nuevaCategoria = await Categoria.create(req.body);
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

/**
 * Actualiza una categoría existente por ID.
 * Parámetros: req.params.id
 * Body: campos a actualizar.
 * Respuesta: 200 con la categoría actualizada | 404 si no existe | 500 en error.
 */
 exports.updateCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

/**
 * Elimina una categoría por ID.
 * Parámetros: req.params.id
 * Respuesta: 200 { success: true } | 404 si no existe | 500 en error.
 */
 exports.deleteCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};
