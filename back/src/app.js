const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/auth");
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require("./routes/reservationRoutes");
require('dotenv').config();
const stripeRoutes = require('./routes/stripeRoutes');


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use('/api/checkout', stripeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
