const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Middleware para verificar APIKEY
const APIKEY = 'APIKEY_USUARIO_654';
function checkApiKey(req, res, next) {
	if (req.headers['x-api-key'] === APIKEY) {
		next();
	} else {
		res.status(401).json({ error: 'APIKEY inválida' });
	}
}

router.get('/', checkApiKey, usuarioController.getUsuarios);
router.get('/:id', checkApiKey, usuarioController.getUsuarioById);
router.post('/', checkApiKey, usuarioController.createUsuario);
router.put('/:id', checkApiKey, usuarioController.updateUsuario);
router.delete('/:id', checkApiKey, usuarioController.deleteUsuario);

module.exports = router;
