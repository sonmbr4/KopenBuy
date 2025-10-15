/**
 * Controlador: Usuarios
 * Propósito: Registro, login, verificación de token, gestión CRUD de usuarios y logout.
 * Seguridad: Maneja JWT en cookies y encabezados.
 * Rutas relacionadas: ver `backend/routes/usuarioRouts.js`.
 */
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

//Generar jwt
const generateToken = (usuarioId) => {
  return jwt.sign({ usuarioId }, JWT_SECRET, { expiresIn: '7d' });
};


//Registro de usuario
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, direccion, telefono, cfTurnstileToken } = req.body;

    // Verificar CAPTCHA de Cloudflare Turnstile
    try {
      const secret = process.env.CF_TURNSTILE_SECRET;
      if (!secret) {
        return res.status(500).json({ success: false, message: 'Falta configuración del CAPTCHA en el servidor' });
      }

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret,
          response: cfTurnstileToken || '',
          remoteip: req.ip || ''
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return res.status(400).json({ success: false, message: 'Verificación de seguridad fallida' });
      }
    } catch (capErr) {
      console.error('Error verificando Turnstile:', capErr);
      return res.status(400).json({ success: false, message: 'No se pudo verificar el CAPTCHA' });
    }

    //Verifica si el ususario existe
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    //Crear el nuevo usuario
    const user = await Usuario.create({
      nombre,
      email,
      password,
      direccion,
      telefono
    });

    // Generar token
    const token = generateToken(user._id);

    // Configurar la cookie con el token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      sameSite: 'lax',
      path: '/',
      // domain: 'tudominio.com', // Descomenta y configura en producción
    };
    
    res.cookie('token', token, cookieOptions);
    
    // Para compatibilidad con algunos navegadores
    res.cookie('auth_token', token, {
      ...cookieOptions,
      httpOnly: false // Permitir acceso desde JavaScript en el frontend
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);

    // Errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    // Email duplicado (clave única)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
}


//Login de usuario
exports.login = async (req, res) =>{
  try{
    const {email, password} = req.body

    //verificar si el usuario existe
    const user = await Usuario.findOne({email});
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales Invalidas'
      });
    }

    //verificar contrasena
    const isMatch = await user.comparePassword(password);
    if (!isMatch){
      return res.status(400).json({
        success: false,
        message: 'Credenciales invalidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    // Configurar la cookie con el token (igual que en register)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      sameSite: 'lax',
      path: '/',
    };

    res.cookie('token', token, cookieOptions);

    // Cookie accesible desde JS si el frontend la necesita (opcional)
    res.cookie('auth_token', token, {
      ...cookieOptions,
      httpOnly: false,
    });

    // Responde con éxito
    res.json({
      success: true,
      message: 'Inicio de sesion exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error){
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

//Verificar token (opcional, para mantener sesion)
exports.verifyToken=async(req, res) => {
  try{
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token){
      return res.status(401).json({ success: false, message: 'Token no proporcionado'})
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    const user = await Usuario.findById(decoded.usuarioId).select('-password');

    if(!user){
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json ({ success: true, user })
  } catch(error){
    res.status(401).json({ success: false, message: 'Token inválido'})
  }
}




exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};



exports.updateUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cerrar sesión
exports.logout = (req, res) => {
  try {
    // Eliminar la cookie de autenticación
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Eliminar también la cookie accesible por JS si existe
    res.clearCookie('auth_token', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión'
    });
  }
};
