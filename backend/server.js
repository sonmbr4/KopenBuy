require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database')
const path = require('path');
const adminRoutes = require('./routes/adminRouts')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const Product = require('./models/products');
// const backup = require('./config/backup');
// const cron = require('node-cron');




const categoriaRoutes = require('./routes/categoriaRouts');
const pedidoRoutes = require('./routes/pedidoRouts');
const facturaRoutes = require('./routes/facturaRouts');
const envioRoutes = require('./routes/envioRouts');
const usuarioRoutes = require('./routes/usuarioRouts');
const carritoRoutes = require('./routes/carritoRouts');

const cors = require('cors');
const app = express();

//conexcion a mongoDB
connectDB()


// Middleware 
// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
  origin: 'http://localhost:3000', // Ajusta según tu configuración
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());

// Middleware para pasar el usuario autenticado a las vistas
app.use((req, res, next) => {
  // Verificar el token de autenticación
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.usuarioId };
      res.locals.user = { isAuthenticated: true };
    } catch (error) {
      // Token inválido o expirado
      res.locals.user = { isAuthenticated: false };
    }
  } else {
    res.locals.user = { isAuthenticated: false };
  }
  next();
});


//Configuracion EJS como motor
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'))

app.use(express.static(path.join(__dirname, '../frontend/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// Importar el controlador de productos
const { getFeaturedProducts, getProductsByCategory, getAllProducts } = require('./controllers/productsController');

// Ruta principal
app.get('/', async (req, res) => {
  try {
    const productosDestacados = await getFeaturedProducts(4);
    const computerProducts = await getProductsByCategory('computadora', 4);
    const phoneProducts = await getProductsByCategory('telefono', 4);
    const audioProducts = await getProductsByCategory('audio', 4);
    const gamingProducts = await getProductsByCategory('gaming', 4);

    res.render('index', {
      title: 'Tienda Tecno',
      productosDestacados: productosDestacados || [],
      computerProducts: computerProducts || [],
      phoneProducts: phoneProducts || [],
      audioProducts: audioProducts || [],
      gamingProducts: gamingProducts || [],
      user: res.locals.user || { isAuthenticated: false }
    });
  } catch (error) {
    console.error('Error al cargar la página de inicio:', error);
    res.status(500).render('index', {
      title: 'Tienda Tecno',
      productosDestacados: [],
      computerProducts: [],
      phoneProducts: [],
      audioProducts: [],
      gamingProducts: [],
      user: res.locals.user || { isAuthenticated: false }
    });
  }
});


// Ruta para mostrar el catálogo de productos
app.get('/productos', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('sections/catalogo', { 
      title: 'Todos los Productos',
      productosCatalogo: products || []
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
    res.status(500).render('sections/catalogo', { 
      title: 'Todos los Productos',
      productosCatalogo: []
    });
  }
});


app.get('/carrito', (req, res) =>{
  res.render('sections/carrito', {title: 'Tabletas'})
})


// Rutas de la API
app.use('/admin', adminRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/facturas', facturaRoutes);
app.use('/envios', envioRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/api/carrito', carritoRoutes);

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

// cron.schedule('* * * * * *', async () => {
//   console.log('Realizando Backup de la Base de datos');
//   backup.backupDatabase();
// });




module.exports = app;