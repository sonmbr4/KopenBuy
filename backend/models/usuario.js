// Modelo de Usuario
// Define la estructura de la colección de usuarios en MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


// Esquema del usuario
const usuarioSchema = new mongoose.Schema({
  // Nombre del usuario (obligatorio)
  nombre: { type: String, required: true, trim: true },
  // Email único y obligatorio
  email: { type: String, required: true, unique: true, lowercase: true, math:[/^\S+@\S+\.\S+$/, 'Porfavor ingrese un email valido']},
  // Contraseña del usuario
  password: { type: String, required: true, minlength: 6 },
  role:{type: String, enum: ['admin', 'user'], default: 'user'},
  // Dirección del usuario (opcional)
  direccion: { type: String },
    // Teléfono del usuario (opcional)
  telefono: { type: String },
  createdAt : { type: Date, default: Date.now}
});



//Encriptar contrasema antes de guardar
usuarioSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
})

//comprarar contrasenas
usuarioSchema.methods.comparePassword = async function(cantidatePassword){
  return await bcrypt.compare(cantidatePassword, this.password);
};




// Exporta el modelo para usarlo en controladores y rutas
module.exports = mongoose.model('Usuario', usuarioSchema);
