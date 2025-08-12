const express = require('express');
const { createCheckoutSession } = require('../controllers/stripeController.js');

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);

module.exports = router;