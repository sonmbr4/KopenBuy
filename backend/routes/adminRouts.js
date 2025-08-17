const express = require('express')
const router = express.Router();
const productController = require('../controllers/productsController');
const multer = require('../config/multer');
const { authenticateApiKey } = require('../middleware/APIKEY');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const API_KEY_FILE = path.join(__dirname, '../api_keys.json');

//Ruta produtos
// /admin/productos
router.get('/productos', productController.getProducts);

// /admin/productos/add
router.get('/productos/add', authenticateApiKey, productController.showAddForm)

//Ver detalles del producto
router.get('/productos/:id', productController.getProductById);

//Editar productos
router.put('/productos/:id', authenticateApiKey, productController.updateProduct);

// /admin/productos
router.post('/productos', authenticateApiKey, multer.single('image'), productController.addProduct);

// Eliminar producto
router.delete('/productos/:id', authenticateApiKey, productController.deleteProduct);

router.post('/apikey/generate', (req, res) => {
  const newKey = crypto.randomBytes(24).toString('hex');
  let apiKeys = {};
  try {
    apiKeys = JSON.parse(fs.readFileSync(API_KEY_FILE, 'utf8'));
  } catch (err) {}
  apiKeys[newKey] = { created: new Date().toISOString() };
  fs.writeFileSync(API_KEY_FILE, JSON.stringify(apiKeys, null, 2));
  res.json({ apikey: newKey });
});

module.exports = router;