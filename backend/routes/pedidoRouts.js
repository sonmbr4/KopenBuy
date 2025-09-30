const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/userMiddleware');

// Rutas de usuario autenticado
router.post('/', authMiddleware, pedidoController.createPedido);
router.get('/usuario', authMiddleware, pedidoController.getPedidosUsuario);

// Mantener APIKEY solo para administradores
const APIKEY = 'APIKEY_PEDIDO_456';
function checkApiKey(req, res, next) {
  if (req.headers['x-api-key'] === APIKEY || req.user?.isAdmin) {
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
}

router.get('/', checkApiKey, pedidoController.getPedidos);
router.get('/:id', checkApiKey, pedidoController.getPedidoById);
router.put('/:id', checkApiKey, pedidoController.updatePedido);
router.delete('/:id', checkApiKey, pedidoController.deletePedido);

module.exports = router;