const usuario = require('../models/usuario');
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

    //Crear el nuevo ususario
    const user = await Usuario.create({
      nombre,
      email,
      password,
      direccion,
      telefono
    });

    //Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user:{
        id: user._id,
        nombre:user.name,
        email:user.email,
        role: user.role
      }
    })

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
    const user = Usuario.findOne({email});
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

    //generar token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user:{
        id: user._id,
        nombre:user.name,
        email:user.email,
        role: user.role
      }
    });
  } catch (error){
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
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
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
