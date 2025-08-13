const express = require('express');
const reservationController = require('../controllers/reservationController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const authorizeRole = require('../middlewares/authorizeRole.js');

const router = express.Router();

router.post("/", authMiddleware, reservationController.createReservation);
router.get("/", authMiddleware, authorizeRole(['admin']), reservationController.getAllReservations);
router.get("/user/me", authMiddleware, reservationController.getUserReservations);
router.get("/check/availability", reservationController.checkAvailability);
router.get("/slots/available", reservationController.getAvailableSlots);
router.get("/:id", authMiddleware, reservationController.getReservationById);
router.put("/:id", authMiddleware, reservationController.updateReservation);
router.delete("/:id", authMiddleware, reservationController.cancelReservation);

module.exports = router;