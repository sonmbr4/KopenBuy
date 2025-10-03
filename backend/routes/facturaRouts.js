const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');

// Middleware para verificar APIKEY
const APIKEY = 'APIKEY_FACTURA_789';
function checkApiKey(req, res, next) {
	if (req.headers['x-api-key'] === APIKEY) {
		next();
	} else {
		res.status(401).json({ error: 'APIKEY inválida' });
	}
}

router.get('/', checkApiKey, facturaController.getFacturas);
router.get('/:id', checkApiKey, facturaController.getFacturaById);
router.post('/', checkApiKey, facturaController.createFactura);
router.put('/:id', checkApiKey, facturaController.updateFactura);
router.delete('/:id', checkApiKey, facturaController.deleteFactura);

module.exports = router;
