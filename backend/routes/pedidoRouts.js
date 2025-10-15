/**
 * Rutas: Pedidos (API)
 * Propósito: Endpoints para crear pedidos del usuario autenticado y administración
 *            (listar, ver por ID y actualizar) protegidos por API Key o rol admin.
 * Controlador: `pedidoController`.
 * Middlewares: `authMiddleware` para rutas de usuario.
 */
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/userMiddleware');

// Rutas de usuario autenticado
router.post('/', authMiddleware, pedidoController.createPedido);
router.get('/usuario', authMiddleware, pedidoController.getPedidosUsuario);
router.put('/usuario/:id', authMiddleware, pedidoController.updatePedidoUsuario);

// Mantener APIKEY solo para administradores
const APIKEY = 'APIKEY_PEDIDO_456';
function checkApiKey(req, res, next) {
  if (req.headers['x-api-key'] === APIKEY || req.user?.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
}

router.get('/', checkApiKey, pedidoController.getPedidos);
router.get('/:id', checkApiKey, pedidoController.getPedidoById);
router.put('/:id', checkApiKey, pedidoController.updatePedido);

module.exports = router;