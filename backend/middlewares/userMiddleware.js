const jwt = require('jsonwebtoken');
const User = require('../models/usuario');

const userMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if(!token){
            return res.status(401).json({ message: 'Acceso denegado. Token requerido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
        // Usar usuarioId para ser consistente con el resto del código
        const userId = decoded.userId || decoded.usuarioId;
        const user = await User.findById(userId).select('-password');

        if(!user){
            return res.status(401).json({ message: 'Token Invalido.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token Invalido.' });
    }
};

module.exports = userMiddleware;