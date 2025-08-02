const pool = require("../db");

// Créer une réservation
exports.createReservation = async (req, res) => {
  const { reservation_date, number_of_guests } = req.body;
  
  if (!reservation_date || !number_of_guests) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (number_of_guests < 1 || number_of_guests > 8) {
    return res.status(400).json({ 
      error: "Number of guests must be between 1 and 8" 
    });
  }

  try {
    // Vérifier la disponibilité
    const isAvailable = await checkAvailability(reservation_date, number_of_guests);
    
    if (!isAvailable) {
      return res.status(400).json({ error: "Time slot not available" });
    }

    const result = await pool.query(
      `INSERT INTO reservations (user_id, reservation_date, number_of_guests)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, reservation_date, number_of_guests]
    );
    
    res.status(201).json({ 
      message: "Reservation created", 
      reservation: result.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reservations 
       WHERE user_id = $1 
       ORDER BY reservation_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user reservations" });
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

exports.updateReservation = async (req, res) => {
  const { id } = req.params;
  const { reservation_date, number_of_guests } = req.body;

  try {
    // Vérifier que la réservation existe et appartient à l'utilisateur
    const checkResult = await pool.query(
      'SELECT * FROM reservations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = checkResult.rows[0];
    
    // Vérifier qu'on peut encore modifier (2h avant)
    const reservationTime = new Date(reservation.reservation_date);
    const now = new Date();
    const timeDiff = (reservationTime - now) / (1000 * 60 * 60); // en heures

    if (timeDiff < 2) {
      return res.status(400).json({ 
        error: "Cannot modify reservation less than 2 hours before" 
      });
    }

    // Vérifier la disponibilité si on change la date/heure
    if (reservation_date && reservation_date !== reservation.reservation_date) {
      const isAvailable = await checkAvailability(reservation_date, number_of_guests || reservation.number_of_guests);
      if (!isAvailable) {
        return res.status(400).json({ error: "Time slot not available" });
      }
    }

    // Mettre à jour
    const result = await pool.query(
      `UPDATE reservations 
       SET reservation_date = COALESCE($1, reservation_date),
           number_of_guests = COALESCE($2, number_of_guests),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [reservation_date, number_of_guests, id, req.user.id]
    );

    res.json({ message: "Reservation updated", reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update reservation" });
  }
};

exports.cancelReservation = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier que la réservation existe et appartient à l'utilisateur
    const checkResult = await pool.query(
      'SELECT * FROM reservations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = checkResult.rows[0];
    
    // Vérifier qu'on peut encore annuler (2h avant)
    const reservationTime = new Date(reservation.reservation_date);
    const now = new Date();
    const timeDiff = (reservationTime - now) / (1000 * 60 * 60); // en heures

    if (timeDiff < 2) {
      return res.status(400).json({ 
        error: "Cannot cancel reservation less than 2 hours before" 
      });
    }

    // Annuler
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    res.json({ message: "Reservation cancelled", reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
};

exports.checkAvailability = async (req, res) => {
  const { date, guests } = req.query;

  if (!date || !guests) {
    return res.status(400).json({ error: "Date and guests required" });
  }

  try {
    const available = await checkAvailability(date, parseInt(guests));
    res.json({ available });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check availability" });
  }
};

// Obtenir les créneaux disponibles pour une date
exports.getAvailableSlots = async (req, res) => {
  const { date, guests } = req.query;

  if (!date || !guests) {
    return res.status(400).json({ error: "Date and guests required" });
  }

  try {
    const slots = await getAvailableSlotsForDate(date, parseInt(guests));
    res.json({ slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get available slots" });
  }
};

async function checkAvailability(reservationDate, guests) {
  // Récupérer toutes les réservations confirmées pour ce créneau (durée 1h30)
  const startTime = new Date(reservationDate);
  const endTime = new Date(startTime.getTime() + 90 * 60 * 1000); // +1h30

  const result = await pool.query(
    `SELECT SUM(number_of_guests) as total_guests
     FROM reservations 
     WHERE status IN ('pending', 'confirmed')
     AND (
       (reservation_date <= $1 AND reservation_date + INTERVAL '90 minutes' > $1)
       OR 
       (reservation_date < $2 AND reservation_date + INTERVAL '90 minutes' >= $2)
       OR
       (reservation_date >= $1 AND reservation_date < $2)
     )`,
    [startTime, endTime]
  );

  const currentGuests = parseInt(result.rows[0].total_guests) || 0;
  const maxCapacity = 16; // 8 tables de 2 personnes
  
  return (currentGuests + guests) <= maxCapacity;
}


async function getAvailableSlotsForDate(dateStr, guests) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = dimanche, 1 = lundi...
  
  // Définir les horaires selon le jour
  const schedules = {
    0: [{ start: '11:30', end: '22:00' }], // Dimanche
    1: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '22:30' }], // Lundi
    2: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '22:30' }], // Mardi
    3: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '22:30' }], // Mercredi
    4: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '22:30' }], // Jeudi
    5: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '23:00' }], // Vendredi
    6: [{ start: '11:30', end: '23:00' }], // Samedi
  };

  const todaySchedule = schedules[dayOfWeek];
  const availableSlots = [];

  for (const period of todaySchedule) {
    let currentTime = new Date(`${dateStr}T${period.start}:00`);
    const endTime = new Date(`${dateStr}T${period.end}:00`);
    
    // Soustraire 1h30 pour la dernière réservation possible
    endTime.setMinutes(endTime.getMinutes() - 90);

    while (currentTime <= endTime) {
      const isAvailable = await checkAvailability(currentTime, guests);
      
      if (isAvailable) {
        availableSlots.push({
          time: currentTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          datetime: currentTime.toISOString()
        });
      }
      
      // Passer au créneau suivant (+30 min)
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
  }

  return availableSlots;
}

