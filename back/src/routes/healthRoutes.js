const express = require('express');
const router = express.Router();
const pool = require("../db");

router.get('/', async (req, res) => {
  try {
    // Vérifier la DB
    const result = await pool.query('SELECT NOW() AS timestamp');
    if (result.rows.length === 0) {
      return res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Database query failed'
      });
    }
    
    // Vérifier Stripe 
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    await stripe.accounts.retrieve();
    
    // Stripe OK, api OK, DB OK
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        api: 'UP',
        database: 'UP'
      }
    });

  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        api: 'DOWN',
        database: 'DOWN'
      }
    });
  }
});

module.exports = router;