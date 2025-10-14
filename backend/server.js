
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


// SDK de Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-1340642060434040-101214-8c63c12c3da94056bdfaa84d8d36369f-2921654273' });




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




// OPCIÓN 1: SIN AUTO_RETURN (MÁS SIMPLE Y ESTABLE)
// Reemplaza el endpoint /crear-preferencia en server.js con este código

app.post("/crear-preferencia", async (req, res) => {
  try {
    // Validar que se reciban items
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: "Debe proporcionar items para crear la preferencia" 
      });
    }

    // Validar estructura de items
    const validItems = items.map(item => {
      if (!item.title || !item.quantity || !item.unit_price) {
        throw new Error('Cada item debe tener title, quantity y unit_price');
      }
      
      return {
        title: String(item.title),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: "COP" // Moneda colombiana
      };
    });

    // Crear la preferencia con los datos recibidos
    const preference = new Preference(client);
    const preferenceData = await preference.create({
      body: {
        items: validItems,
        back_urls: {
          success: `${req.protocol}://${req.get('host')}/pedidos`,
          failure: `${req.protocol}://${req.get('host')}/carrito`,
          pending: `${req.protocol}://${req.get('host')}/carrito`
        },
        // NO usar auto_return - el usuario hará clic en "Volver al sitio"
        statement_descriptor: "KOPENBUY",
        external_reference: `ORDER-${Date.now()}` // Referencia única
      }
    });

    console.log('Preferencia creada exitosamente:');

    res.status(200).json({
      preferenceId: preferenceData.id,
      preference_url: preferenceData.init_point,
      sandbox_url: preferenceData.sandbox_init_point
    });

  } catch (error) {
    console.error('Error al crear la preferencia:', error);
    res.status(500).json({ 
      error: "Error al crear la preferencia",
      details: error.message 
    });
  }
});




// Ruta para mostrar el catálogo de productos
app.get("/productos", async (req, res) => {
  try {
    const productos = await Product.find({}).lean();
    res.render('sections/catalogo', { 
      productosCatalogo: productos,
      user: res.locals.user || { isAuthenticated: false }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).render('error', { 
      message: 'Error al cargar el catálogo',
      user: res.locals.user || { isAuthenticated: false }
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

    // Extraer campos permitidos para actualizar
    const { nombre, telefono, direccion } = req.body;

    // Construir objeto de actualización solo con campos proporcionados
    const updateFields = {};
    if (nombre !== undefined) updateFields.nombre = nombre.trim();
    if (telefono !== undefined) updateFields.telefono = telefono.trim();
    if (direccion !== undefined) updateFields.direccion = direccion.trim();

    // Verificar que al menos un campo esté presente
    if (Object.keys(updateFields).length === 0) {
      console.log('Error: No se proporcionaron campos válidos para actualizar');
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    try {
      const usuario = await Usuario.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('nombre email telefono direccion').lean();

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
          telefono: usuario.telefono,
          direccion: usuario.direccion
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
    const usuario = await Usuario.findById(req.user._id).select('nombre email telefono direccion');

    if (!usuario) {
      console.log('Usuario no encontrado en la base de datos');
      return res.redirect('/login');
    }

    // Renderizar la plantilla con los datos del usuario
    res.render('configuracion', {
      user: {
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion
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
        formatDate: function (date) {
          return date ? new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Fecha no disponible';
        },
        formatCurrency: function (amount) {
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

app.get('/carrito', (req, res) => {
  res.render('carrito', { title: 'Carrito' })
})


app.get('/tabletas', async (req, res) => {
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
