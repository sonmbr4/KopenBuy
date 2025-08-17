// filepath: /nodejs-categories-crud/nodejs-categories-crud/routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Get all categories
router.get('/', categoriaController.getCategorias);

// Add a new category
router.post('/', categoriaController.addCategoria);

// Update a category by ID
router.put('/:id', categoriaController.updateCategoria);

// Delete a category by ID
router.delete('/:id', categoriaController.deleteCategoria);

module.exports = router;