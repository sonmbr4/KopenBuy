
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database')
const path = require('path');
const adminRoutes = require('./routes/adminRouts')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const Product = require('./models/products');
const authMiddleware = require('./middlewares/userMiddleware');
// const backup = require('./config/backup');
// const cron = require('node-cron');



//Rutas requeridas
const categoriaRoutes = require('./routes/categoriaRouts');
const facturaRoutes = require('./routes/facturaRouts');
const envioRoutes = require('./routes/envioRouts');
const usuarioRoutes = require('./routes/usuarioRouts');
const cartRoutes = require('./routes/cartRouts');
const checkoutRoutes = require('./routes/checkoutRouts');
const pedidoRoutes = require('./routes/pedidoRouts');


const cors = require('cors');
const app = express();

//conexcion a mongoDB
connectDB()


// Middleware 
// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




app.use(cors({
  origin: 'http://localhost:7070', // Ajusta según tu configuración
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

// Ruta para cambiar la contraseña del usuario
// (movido más abajo, después de importar Usuario)


//Configuracion EJS como motor
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'))

app.use(express.static(path.join(__dirname, '../frontend/assets')));




// Importar el controlador de productos
const { getFeaturedProducts, getProductsByCategory, getAllProducts } = require('./controllers/productsController');

//Rutas Admin
app.use('/admin', adminRoutes);

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


// Ruta para mostrar el catálogo de productos con búsqueda
app.get('/productos', async (req, res) => {
  try {
    const searchQuery = req.query.search;
    let query = {};
    
    if (searchQuery) {
      // Buscar productos que comiencen con el término de búsqueda (insensible a mayúsculas/minúsculas)
      query.name = { $regex: new RegExp('^' + searchQuery, 'i') };
    }
    
    const products = await Product.find(query);
    res.render('sections/catalogo', { 
      title: searchQuery ? `Búsqueda: ${searchQuery}` : 'Todos los Productos',
      productosCatalogo: products || [],
      searchQuery: searchQuery || ''
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
    res.status(500).render('sections/catalogo', { 
      title: 'Error al cargar productos',
      productosCatalogo: [],
      searchQuery: req.query.search || ''
    });
  }
});


// Ruta para ver detalles de producto
app.get('/productos/:id', async (req, res) => {
  try {
    const Product = require('./models/products');
    const producto = await Product.findById(req.params.id);
    // Aquí puedes obtener comentarios si tienes ese modelo
    const comentarios = [];
    if (!producto) {
      return res.status(404).render('error', { message: 'Producto no encontrado' });
    }
    res.render('VerDetalle', {
      producto,
      comentarios
    });
  } catch (error) {
    console.error('Error al mostrar detalles del producto:', error);
    res.status(500).render('error', { message: 'Error al mostrar detalles del producto' });
  }
});





app.use('/categorias', categoriaRoutes);
app.use('/facturas', facturaRoutes);
app.use('/envios', envioRoutes);
app.use('/usuario', usuarioRoutes);



// Rutas de la API
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/pedido', pedidoRoutes);





// Importar el modelo de Usuario al inicio del archivo
const Usuario = require('./models/usuario');

// Ruta para cambiar la contraseña del usuario
app.post('/api/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña y su confirmación no coinciden.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    // Cargar usuario con contraseña
    const usuario = await Usuario.findById(req.user._id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const isMatch = await usuario.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta.' });
    }

    const isSameAsCurrent = await usuario.comparePassword(newPassword);
    if (isSameAsCurrent) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña no puede ser igual a la actual.' });
    }

    usuario.password = newPassword; // pre-save hook encripta
    await usuario.save();

    return res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    return res.status(500).json({ success: false, message: 'Error al cambiar la contraseña.' });
  }
});

// Ruta para actualizar el perfil del usuario
app.post('/api/update-profile', authMiddleware, async (req, res) => {
    
    try {
        // Verificar si el cuerpo de la solicitud está vacío
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('Error: Cuerpo de la solicitud vacío');
            return res.status(400).json({ 
                success: false, 
                message: 'El cuerpo de la solicitud no puede estar vacío' 
            });
        }
        
        const { nombre } = req.body;
        
        if (!nombre || nombre.trim() === '') {
            console.log('Error: Nombre vacío o no proporcionado');
            return res.status(400).json({ 
                success: false, 
                message: 'El nombre es requerido' 
            });
        }

        try {
            const usuario = await Usuario.findByIdAndUpdate(
                req.user._id,
                { nombre: nombre.trim() },
                { new: true, runValidators: true }
            ).select('nombre email telefono').lean();

            if (!usuario) {
                console.log('Usuario no encontrado con ID:', req.user._id);
                return res.status(404).json({ 
                    success: false, 
                    message: 'Usuario no encontrado' 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Perfil actualizado correctamente',
                user: {
                    nombre: usuario.nombre,
                    email: usuario.email,
                    telefono: usuario.telefono
                }
            });
        } catch (dbError) {
            console.error('Error de base de datos:', dbError);
            throw dbError; // Esto será capturado por el catch externo
        }
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        // Detalles adicionales del error para depuración
        const errorDetails = {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            ...(error.errors && { validationErrors: error.errors })
        };
        
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar el perfil',
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { details: errorDetails })
        });
    }
});

// Ruta de configuración de perfil
app.get('/perfil', authMiddleware, async (req, res) => {
  try {
    
    // Obtener los datos actualizados del usuario
    const Usuario = require('./models/usuario');
    const usuario = await Usuario.findById(req.user._id).select('nombre email telefono');
    
    if (!usuario) {
      console.log('Usuario no encontrado en la base de datos');
      return res.redirect('/login');
    }
    
    // Renderizar la plantilla con los datos del usuario
    res.render('configuracion', {
      user: {
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono
      }
    });
  } catch (error) {
    console.error('Error al cargar la página de configuración:', error);
    res.status(500).send('Error al cargar la página de configuración');
  }
});





// Ruta para ver los pedidos del usuario
app.get('/pedidos', authMiddleware, async (req, res) => {
  try {
    
    // Obtener los pedidos del usuario
    const Pedido = require('./models/pedidos');
    const pedidos = await Pedido.find({ usuario: req.user._id })
      .sort({ fecha: -1 })
      .populate('productos.producto')
      .populate('factura');

    res.render('pedidos', { 
      title: 'Mis Pedidos',
      pedidos: pedidos || [],
      user: {
        _id: req.user._id,
        email: req.user.email,
        nombre: req.user.nombre,
        isAuthenticated: true
      },
      helpers: {
        formatDate: function(date) {
          return date ? new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Fecha no disponible';
        },
        formatCurrency: function(amount) {
          return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount || 0);
        }
      }
    });
  } catch (error) {
    console.error('Error al cargar los pedidos:', error);
    res.status(500).render('pedidos', { 
      title: 'Mis Pedidos',
      pedidos: [],
      user: {
        _id: req.user._id,
        email: req.user.email,
        nombre: req.user.nombre,
        isAuthenticated: true
      },
      error: 'Error al cargar los pedidos. Por favor, intente de nuevo.'
    });
  }
});

app.get('/carrito', (req, res) =>{
  res.render('carrito', {title: 'Carrito'})
})


app.get('/tabletas', async (req, res) =>{
  try {
    const productos = await getProductsByCategory('computadora');
  
  res.render('sections/laptops', {
    title: 'Tabletas',
    productosComputadora: productos || [],
    user: res.locals.user || { isAuthenticated: false }
  });
  } catch (error) {
    console.error('Error al cargar la pagina de tabletas:', error);
    res.status(500).render('sections/laptops', {
      title: 'Tabletas',
      productosComputadora: [],
      user: res.locals.user || { isAuthenticated: false }
    });
  }
})

app.get('/telefonos', async (req, res) => {
  try {
    const productos = await getProductsByCategory('telefono');
    
    res.render('sections/smartphones', {
      title: 'Teléfonos',
      productosSmartphones: productos || [],
      user: res.locals.user || { isAuthenticated: false }
    });
  } catch (error) {
    console.error('Error al cargar la página de teléfonos:', error);
    res.status(500).render('sections/smartphones', {
      title: 'Teléfonos',
      productosSmartphones: [],
      user: res.locals.user || { isAuthenticated: false }
    });
  }
})

app.get('/audio', async (req, res) => {
  try {
    const productos = await getProductsByCategory('audio');
    
    res.render('sections/audio', {
      title: 'Audio',
      productosAudio: productos || [],
      user: res.locals.user || { isAuthenticated: false }
    });
  } catch (error) {
    console.error('Error al cargar la página de audio:', error);
    res.status(500).render('sections/audio', {
      title: 'Audio',
      productosAudio: [],
      user: res.locals.user || { isAuthenticated: false }
    });
  }
})

app.get('/gamer', async (req, res) => {
  try {
    const productos = await getProductsByCategory('gaming');
    
    res.render('sections/gaming', {
      title: 'Gaming',
      productosGaming: productos || [],
      user: res.locals.user || { isAuthenticated: false }
    });
  } catch (error) {
    console.error('Error al cargar la página de gaming:', error);
    res.status(500).render('sections/gaming', {
      title: 'Gaming',
      productosGaming: [],
      user: res.locals.user || { isAuthenticated: false }
    });
  }
})




// Manejador para rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).render('error', { 
    title: 'Página no encontrada',
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 7070;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

// cron.schedule('* * * * * *', async () => {
//   console.log('Realizando Backup de la Base de datos');
//   backup.backupDatabase();
// });




module.exports = app;
