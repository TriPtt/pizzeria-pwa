const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, authorizeRole(["admin"]), orderController.getAllOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);
router.get('/user/my-orders', authMiddleware, orderController.getUserOrders);

module.exports = router;
