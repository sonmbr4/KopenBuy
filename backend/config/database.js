/**
 * Configuración: Conexión a MongoDB
 * Propósito: Establece la conexión con la base de datos usando Mongoose.
 * Variables: `MONGO_URI` desde el entorno.
 */
const mongoose = require('mongoose');
require('dotenv').config(); //con esto se leera el .env

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Conectado a la base de datos :)");
    } catch(error){
        console.error("❌ Error de conexión a MongoDB:", error.message);
        process.exit(1)
    }
}

module.exports = connectDB;
