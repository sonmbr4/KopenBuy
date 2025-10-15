# KopenBuy - Plataforma de E-commerce Completa

## 📝 Descripción
KopenBuy es una plataforma de comercio electrónico moderna, escalable y de diseño simple para ofrecer una experiencia de compra excepcional. Desarrollada con tecnologías de vanguardia, proporciona una solución completa para la gestión de productos, carritos de compra, pagos y más.

## 🚀 Características Principales
- Catálogo de productos con búsqueda y filtrado avanzado
- Sistema de autenticación y perfiles de usuario
- Carrito de compras persistente
- Pasarela de pagos referencial
- Panel de administración
- Sistema de seguimiento de pedidos
- Diseño responsive y accesible

## 🛠️ Requisitos Técnicos
- Node.js 16.x o superior
- MongoDB 5.0+
- npm 8.x+
- Git

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/sonmbr4/KopenBuy.git
cd KopenBuy
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del backend
cd backend
npm install
```

### 3. Configuración
Crear archivo `.env` en la carpeta backend:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:2701/KopenBuy
JWT_SECRET=tu_clave_secreta_aqui
NODE_ENV=development
```

## 🏗️ Estructura del Proyecto
```
KopenBuy/
├── backend/                # API y lógica del servidor
│   ├── config/             # Configuraciones
│   ├── controllers/        # Controladores
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de la API
│   └── middlewares/        # Middlewares
├── frontend/               # Interfaz de usuario
│   ├── assets/             # Recursos estáticos
│   │   ├── CSS/           # Hojas de estilo
│   │   ├── JS/            # Scripts del cliente
│   │   └── imagenes/      # Imágenes y recursos gráficos
│   └── views/             # Vistas de la aplicación
│       ├── admin/         # Panel de administración
│       ├── partials/      # Componentes reutilizables
│       └── sections/      # Secciones de la aplicación
└── README.md              # Este archivo
```

## 💻 Tecnologías Utilizadas
- **Backend**: Node.js, Express.js
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: JWT
- **Pagos**: Stripe/PayPal (referencial)

## 🚀 Despliegue
### Desarrollo
```bash
# Iniciar servidor backend
cd backend
npm run dev
```

### Producción
```bash
# Iniciar servidor en producción
cd backend
npm start
```

## 📚 Documentación de la API
La documentación completa de la API está disponible en `/api-docs` cuando el servidor está en ejecución.

## 🤝 Contribución
¡Las contribuciones son bienvenidas!

1. Haz un Fork del proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
