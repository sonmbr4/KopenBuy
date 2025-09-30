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
    const { nombre, email, password, direccion, telefono } = req.body;


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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'error en el servidor'
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

    // Responde con Exito
    res.json({
      success: true,
      message: 'Inicio de sesion exitoso',
      token,
      user:{
        id:user._id,
        nombre:user.nombre,
        email:user.email,
        role:user.role,
        phone:user.phone
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
      return res.status(401).json({ success: fasle, message: 'Token no proporcionado'})
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    const user = await Usuario.findById(decoded.usuarioId).select('-password');

    if(!user){
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json ({ success: true, user })
  } catch(error){
    res.satus(401).json({ success: false, message: 'Token invalido'})
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
