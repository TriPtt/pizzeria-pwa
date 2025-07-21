const pool = require("../db");

// Créer une réservation
exports.createReservation = async (req, res) => {
  const { reservation_date, number_of_guests } = req.body;
  if (!reservation_date || !number_of_guests) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservations (user_id, reservation_date, number_of_guests)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, reservation_date, number_of_guests]
    );
    res.status(201).json({ message: "Reservation created", reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

// Récupérer toutes les réservations (admin)
exports.getAllReservations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.email FROM reservations r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.reservation_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
};

// Récupérer une réservation par ID
exports.getReservationById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, u.email FROM reservations r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Optionnel : vérifier que l'utilisateur est soit admin, soit propriétaire
    if (req.user.role !== "admin" && result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reservation" });
  }
};
