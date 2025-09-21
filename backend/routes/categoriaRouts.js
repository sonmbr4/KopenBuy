const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Middleware para verificar APIKEY
const APIKEY = 'APIKEY_CATEGORIA_123';
function checkApiKey(req, res, next) {
	if (req.headers['x-api-key'] === APIKEY) {
		next();
	} else {
		res.status(401).json({ error: 'APIKEY inválida' });
	}
}

router.get('/', checkApiKey, categoriaController.getCategorias);
router.get('/:id', checkApiKey, categoriaController.getCategoriaById);
router.post('/', checkApiKey, categoriaController.createCategoria);
router.put('/:id', checkApiKey, categoriaController.updateCategoria);
router.delete('/:id', checkApiKey, categoriaController.deleteCategoria);

module.exports = router;
