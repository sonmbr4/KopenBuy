// backend/controllers/adminController.js
const Product = require('../models/products');
const path = require('path');
const fs = require('fs');

// Ver todos los productos (READ)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/adminProductos', { products });
  } catch (error) {
    res.status(500).send("Error al cargar los productos");
  }
};

//Ver producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product); // Devuelve los datos en JSON
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};


// Mostrar formulario para agregar (CREATE - Form)
exports.showAddForm = (req, res) => {
  res.render('add');
};

//Editar Productos
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, category, description },
      { new: true } // Devuelve el producto actualizado
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};


// Guardar un nuevo producto (CREATE - Action)
exports.addProduct = async (req, res) => {
  console.log('Archivo recibido:', req.file); // Agrega este log
  const { name, price, description, category, stock } = req.body;
  let imagePath = '';
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
    console.log('Ruta de imagen a guardar:', imagePath); // Agrega este log
  }
  try {
    await Product.create({
      name,
      price,
      description,
      category,
      stock,
      image: imagePath
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al agregar el producto" });
  }
};


// Eliminar un producto (DELETE)
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};