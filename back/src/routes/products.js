const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

// CRUD
router.post('/', authMiddleware, authorizeRole(['admin']), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', authMiddleware, authorizeRole(['admin']), productController.updateProduct);
router.delete('/:id', authMiddleware, authorizeRole(['admin']), productController.deleteProduct);

module.exports = router;
