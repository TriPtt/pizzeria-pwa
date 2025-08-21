const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    console.log('[STRIPE SUCCESS]', event.data.object.id);
  } else if (event.type === 'payment_intent.payment_failed') {
    console.error('[STRIPE PAYMENT FAILED]', {
      session_id: event.data.object.id,
      failure_code: event.data.object.last_payment_error?.code,
      failure_message: event.data.object.last_payment_error?.message,
      timestamp: new Date().toISOString()
    });
  }

  res.json({received: true});
});