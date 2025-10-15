/**
 * Rutas: Envíos (API)
 * Propósito: Endpoints CRUD de envíos protegidos por API Key.
 * Controlador: `envioController`.
 * Seguridad: Header `x-api-key` requerido.
 */
const express = require('express');
const router = express.Router();
const envioController = require('../controllers/envioController');

// Middleware para verificar APIKEY
const APIKEY = 'APIKEY_ENVIO_321';
function checkApiKey(req, res, next) {
	if (req.headers['x-api-key'] === APIKEY) {
		next();
	} else {
		res.status(401).json({ error: 'APIKEY inválida' });
	}
}

router.get('/', checkApiKey, envioController.getEnvios);
router.get('/:id', checkApiKey, envioController.getEnvioById);
router.post('/', checkApiKey, envioController.createEnvio);
router.put('/:id', checkApiKey, envioController.updateEnvio);
router.delete('/:id', checkApiKey, envioController.deleteEnvio);

module.exports = router;
