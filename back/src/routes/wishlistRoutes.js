const express = require('express')
const router = express.Router()
const authMiddleware = require("../middlewares/authMiddleware");
const wishlistController = require('../controllers/wishlistController')

// 🎯 Routes avec leurs controllers
router.get('/', authMiddleware, wishlistController.getWishlist)
router.post('/add', authMiddleware, wishlistController.addToWishlist)
router.delete('/remove/:productId', authMiddleware, wishlistController.removeFromWishlist)
router.delete('/clear', authMiddleware, wishlistController.clearWishlist)
router.get('/check/:productId', authMiddleware, wishlistController.checkInWishlist)
router.get('/stats', authMiddleware, wishlistController.getWishlistStats)

module.exports = router
