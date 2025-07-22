const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


exports.createCheckoutSession = async (req, res) => {
  console.log("BODY REÇU :", req.body); // 👈 voir ce qui arrive réellement
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
      success_url: 'http://localhost:5000/success',
      cancel_url: 'http://localhost:5000/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Stripe session creation failed.' });
  }
};

