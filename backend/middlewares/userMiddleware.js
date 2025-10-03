const jwt = require('jsonwebtoken');
const User = require('../models/usuario');

const userMiddleware = async (req, res, next) => {
    try {
        // Verificar si es una petición de API o de vista
        const isApiRequest = req.originalUrl.startsWith('/api/');
        
        // Obtener el token del header o de las cookies
        let token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token || 
                  req.signedCookies?.token;

        if (!token) {
            if (isApiRequest) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Acceso denegado. Token requerido.' 
                });
            } else {
                // Para rutas de vista, redirigir al login
                return res.redirect('/login');
            }
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
        const userId = decoded.userId || decoded.usuarioId || decoded._id;
        
        if (!userId) {
            throw new Error('Token inválido: ID de usuario no encontrado');
        }

        // Buscar el usuario en la base de datos
        const user = await User.findById(userId).select('-password');

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Añadir el usuario al objeto de solicitud
        req.user = user;
        res.locals.user = {
            _id: user._id,
            email: user.email,
            nombre: user.nombre,
            isAuthenticated: true
        };

        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido o expirado.'
            });
        } else {
            // Para rutas de vista, redirigir al login
            return res.redirect('/login');
        }
    }
};

module.exports = userMiddleware;