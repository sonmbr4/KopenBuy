const Categoria = require('../models/categoriaModel');

// Ver todas las categorías
exports.getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

// Agregar una nueva categoría
exports.addCategoria = async (req, res) => {
    const { nombre } = req.body;
    try {
        const nuevaCategoria = new Categoria({ nombre });
        await nuevaCategoria.save();
        res.status(201).json(nuevaCategoria);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar la categoría' });
    }
};

// Editar una categoría
exports.updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const categoriaActualizada = await Categoria.findByIdAndUpdate(
            id,
            { nombre },
            { new: true }
        );

        if (!categoriaActualizada) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json(categoriaActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
};

// Eliminar una categoría
exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const categoriaEliminada = await Categoria.findByIdAndDelete(id);
        if (!categoriaEliminada) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
};