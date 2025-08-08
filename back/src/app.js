import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

// Routes imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

// Configure dotenv et EventEmitter
dotenv.config();
EventEmitter.defaultMaxListeners = 15;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use('/api/checkout', stripeRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/stripe', stripeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
