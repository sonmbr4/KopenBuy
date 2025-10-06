// backend/controllers/productsController.js
const Product = require('../models/products');
const Categoria = require('../models/categoria');
const path = require('path');
const fs = require('fs');

// Obtener productos por categoría (los más recientes primero)
exports.getProductsByCategory = async (category, limit = 4) => {
  try {
    return await Product.find({
      category: new RegExp(category, 'i'),
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  } catch (error) {
    console.error(`Error al obtener productos de la categoría ${category}:`, error);
    return [];
  }
};

// Obtener productos destacados (los 4 más recientes)
exports.getFeaturedProducts = async (limit = 4) => {
  try {
    return await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    return [];
  }
};

// Ver todos los productos (READ)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const categorias = await Categoria.find();
    res.render('admin/adminProductos', {
      products,
      categorias
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
    res.status(500).send('Error al cargar los productos');
  }
};

// Ver producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// Actualizar estado del producto
exports.updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado del producto' });
  }
};

// Mostrar formulario para agregar (CREATE - Form)
exports.showAddForm = (req, res) => {
  res.render('add');
};

// Editar Productos
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, stock, status } = req.body;

  const updateData = { 
    name, 
    price, 
    category, 
    description, 
    stock, 
    status: status || 'active' // Default to 'active' if status is not provided
  };
  if (req.file) {
    updateData.image = '/uploads/' + req.file.filename;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
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
  const { name, price, description, category, stock, status = 'active' } = req.body;

  // Validación: no negativos
  const parsedPrice = Number(price);
  const parsedStock = Number(stock);
  if (isNaN(parsedPrice) || parsedPrice < 0 || isNaN(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ success: false, message: "Precio y stock deben ser números no negativos" });
  }

  let imagePath = '';
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  }
  try {
    await Product.create({
      name,
      price: parsedPrice,
      description,
      category,
      stock: parsedStock,
      image: imagePath
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al agregar el producto" });
  }
};

// Mostrar imagen del producto
exports.getProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.image) {
      return res.status(404).send('Imagen no Encontrada');
    }
    const imagePath = product.image;
    const fullPath = path.join(__dirname, '../uploads', path.basename(imagePath));
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      res.status(404).send('Imagen no encontrada');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Mostrar formulario para agregar (CREATE - Form)
exports.showAddForm = (req, res) => {
  res.render('add');
};

// Editar Productos
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, stock, status } = req.body;

  const updateData = { name, category, description };

  // Validación: no negativos
  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: "El precio debe ser un número no negativo" });
    }
    updateData.price = parsedPrice;
  }
  if (stock !== undefined) {
    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: "El stock debe ser un número no negativo" });
    }
    updateData.stock = parsedStock;
  }

  if (req.file) {
    updateData.image = '/uploads/' + req.file.filename;
  }

  if (status === 'active' || status === 'inactive') {
    updateData.status = status;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
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
  const { name, price, description, category, stock } = req.body;
  let imagePath = '';
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
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

// Mostrar imagen del producto
exports.getProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.image) {
      return res.status(404).send('Imagen no Encontrada');
    }
    const imagePath = product.image;
    const fullPath = path.join(__dirname, '../uploads', path.basename(imagePath));
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      res.status(404).send('Imagen no encontrada');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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