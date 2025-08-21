const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const api = process.env.VITE_API_URL || 'http://localhost:5173';

const createCheckoutSession = async (req, res) => {
  const startTime = Date.now();
  console.log(`[STRIPE] Creating session - ${new Date().toISOString()}`);
  console.log("BODY REÇU :", req.body);
  const { products } = req.body;
  
  if (!products) {
    return res.status(400).json({ error: "Missing 'products' in request body" });
  }
  
  try {
    const lineItems = products.map(product => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: product.name,
        },
        unit_amount: product.price * 100, // Stripe prend les centimes
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${api}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${api}/payment-cancel`,
    });

    console.log(`[STRIPE SUCCESS] Session created: ${session.id} in ${Date.now() - startTime}ms`);
    res.json({ id: session.id });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[STRIPE ERROR] Failed after ${duration}ms:`, {
      error: error.message,
      type: error.type,
      code: error.code,
      timestamp: new Date().toISOString(),
      products: req.body.products?.length || 0
    });
    
    res.status(500).json({ error: 'Stripe session creation failed.' });
  }
};

module.exports = {
  createCheckoutSession
};
