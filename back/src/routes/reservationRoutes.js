import express from 'express';
import * as reservationController from '../controllers/reservationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRole from '../middlewares/authorizeRole.js';

const router = express.Router();

router.post("/", authMiddleware, reservationController.createReservation);
router.get("/", authMiddleware, authorizeRole(['admin']), reservationController.getAllReservations);
router.get("/:id", authMiddleware, reservationController.getReservationById);
router.get("/user/me", authMiddleware, reservationController.getUserReservations);
router.put("/:id", authMiddleware, reservationController.updateReservation);
router.delete("/:id", authMiddleware, reservationController.cancelReservation);
router.get("/check/availability", reservationController.checkAvailability);
router.get("/slots/available", reservationController.getAvailableSlots);

export default router;
