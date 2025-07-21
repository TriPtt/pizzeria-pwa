const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

router.post("/", authMiddleware, reservationController.createReservation);
router.get("/", authMiddleware, authorizeRole(['admin']), reservationController.getAllReservations);
router.get("/:id", authMiddleware, reservationController.getReservationById);

module.exports = router;
