const express = require('express')
const router = express.Router();
const productController = require('../controllers/productsController');
const upload = require('../config/multer');

//Ruta produtos
// /admin/productos
router.get('/productos', productController.getProducts);

// /admin/productos/add
router.get('/productos/add', productController.showAddForm)

//Ver detalles del producto
router.get('/productos/:id', productController.getProductById);

//Editar productos
router.put('/productos/:id', upload.single('image'), productController.updateProduct);

// /admin/productos
router.post('/productos', upload.single('image'), productController.addProduct);

// Eliminar producto
router.delete('/productos/:id', productController.deleteProduct);



module.exports = router;