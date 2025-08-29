require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database')
const path = require('path');
const adminRoutes = require('./routes/adminRouts')

const categoriaRoutes = require('./routes/categoriaRouts');
const pedidoRoutes = require('./routes/pedidoRouts');
const facturaRoutes = require('./routes/facturaRouts');
const envioRoutes = require('./routes/envioRouts');
const usuarioRoutes = require('./routes/usuarioRouts');

const cors = require('cors');
const app = express();

//conexcion a mongoDB
connectDB()


//Middleware 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Configuracion EJS como motor
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'))

app.use(express.static(path.join(__dirname, '../frontend/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




app.use('/admin', adminRoutes)
app.use('/categorias', categoriaRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/facturas', facturaRoutes);
app.use('/envios', envioRoutes);
app.use('/usuario', usuarioRoutes);

app.get('/', (req, res) => {
  res.render('index', {title:'Tienda Tecno'});
});

app.get('/tabletas', (req, res) =>{
  res.render('sections/laptops', {title: 'Tabletas'})
})

app.get('/telefonos', (req, res) =>{
  res.render('sections/smartphones', {title: 'telefonos'})
})

app.get('/audio', (req, res) =>{
  res.render('sections/audio', {title: 'audio'})
})

app.get('/gamer', (req, res) => {
  res.render('sections/gaming', {title: 'Gamer'})
})










//Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));


module.exports = app;