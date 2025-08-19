const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Middleware para verificar APIKEY
const APIKEY = 'APIKEY_PEDIDO_456';
function checkApiKey(req, res, next) {
	if (req.headers['x-api-key'] === APIKEY) {
		next();
	} else {
		res.status(401).json({ error: 'APIKEY inválida' });
	}
}

router.get('/', checkApiKey, pedidoController.getPedidos);
router.get('/:id', checkApiKey, pedidoController.getPedidoById);
router.post('/', checkApiKey, pedidoController.createPedido);
router.put('/:id', checkApiKey, pedidoController.updatePedido);
router.delete('/:id', checkApiKey, pedidoController.deletePedido);

module.exports = router;
