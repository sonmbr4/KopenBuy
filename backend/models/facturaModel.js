const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema({
    numeroFactura: {
        type: String,
        unique: true
    }
})