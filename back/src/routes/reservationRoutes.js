const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

router.post("/", authMiddleware, reservationController.createReservation);
router.get("/", authMiddleware, authorizeRole(['admin']), reservationController.getAllReservations);
router.get("/:id", authMiddleware, reservationController.getReservationById);
router.get("/user/me", authMiddleware, reservationController.getUserReservations);
router.put("/:id", authMiddleware, reservationController.updateReservation);
router.delete("/:id", authMiddleware, reservationController.cancelReservation);
router.get("/check/availability", reservationController.checkAvailability);
router.get("/slots/available", reservationController.getAvailableSlots);

module.exports = router;
