const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');




// Middleware para verificar APIKEY
// const APIKEY = 'APIKEY_USUARIO_654';
// function checkApiKey(req, res, next) {
// 	if (req.headers['x-api-key'] === APIKEY) {
// 		next();
// 	} else {
// 		res.status(401).json({ error: 'APIKEY inválida' });
// 	}
// }

router.get('/', usuarioController.getUsuarios);
router.get('/:id',  usuarioController.getUsuarioById);

// Rutas de autenticación
router.post('/register', usuarioController.register);
router.post('/login', usuarioController.login);
router.post('/logout', usuarioController.logout);
router.get('/verify', usuarioController.verifyToken);




// Rutas de perfil
router.put('/:id',  usuarioController.updateUsuario);
router.delete('/:id', usuarioController.deleteUsuario);

module.exports = router;
