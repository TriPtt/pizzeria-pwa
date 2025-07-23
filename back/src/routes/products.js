const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

// CRUD
router.post('/', authMiddleware, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/type/:type', productController.getProductsByType);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);


module.exports = router;
