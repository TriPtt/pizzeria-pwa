const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { EventEmitter } = require('events');

// Routes imports
const authRoutes = require('./routes/authRoutes.js');
const productRoutes = require('./routes/productsRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const reservationRoutes = require('./routes/reservationRoutes.js');
const stripeRoutes = require('./routes/stripeRoutes.js');
const wishlistRoutes = require('./routes/wishlistRoutes.js');

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

// Export pour les tests
module.exports = app;

// Démarrage serveur seulement si pas en mode test
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}
