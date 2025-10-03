// backend/controllers/productsController.js
const Product = require('../models/products');
const Categoria = require('../models/categoria');
const path = require('path');
const fs = require('fs');

// Obtener productos por categoría (los más recientes primero)
exports.getProductsByCategory = async (category, limit = 4) => {
  try {
    return await Product.find({ category: new RegExp(category, 'i') })
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
    return await Product.find()
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
      .limit(limit) // Limitar a 4 productos
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
      categorias // Enviamos las categorías a la vista
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
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
  const { name, price, category, description, stock } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, category, description, stock },
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
  console.log('Cuerpo de la solicitud:', req.body); // Verificar los datos del formulario
  console.log('Archivo recibido:', req.file); // Verificar el archivo subido
  
  const { name, price, description, category, stock } = req.body;
  
  try {
    // Verificar si se subió un archivo
    if (!req.file) {
      console.log('No se recibió ningún archivo');
      return res.status(400).json({ 
        success: false, 
        message: "Por favor, seleccione una imagen para el producto" 
      });
    }

    // Construir la ruta de la imagen
    const imagePath = '/Imagenes/' + req.file.filename;
    console.log('Ruta de imagen a guardar:', imagePath);

    // Crear el producto en la base de datos
    const newProduct = await Product.create({
      name,
      price,
      description,
      category,
      stock,
      image: imagePath
    });

    console.log('Producto creado:', newProduct);
    res.status(201).json({ 
      success: true, 
      message: "Producto creado exitosamente",
      product: newProduct
    });
    
  } catch (error) {
    console.error('Error al agregar el producto:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error al agregar el producto",
      error: error.message 
    });
  }
};



//Mostrar imagen del producto
exports.getProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.image) {
      return res.status(404).send('Imagen no Encontrada');
    }
    // Servir el archivo estático desde /uploads
    const imagePath = product.image;
    const path = require('path');
    const fs = require('fs');
    const fullPath = path.join(__dirname, '../uploads', path.basename(imagePath));
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      res.status(404).send('Imagen no encontrada');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}





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