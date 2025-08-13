const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const api = process.env.VITE_API_URL || 'http://localhost:5173';

const createCheckoutSession = async (req, res) => {
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

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Stripe session creation failed.' });
  }
};

module.exports = {
  createCheckoutSession
};
