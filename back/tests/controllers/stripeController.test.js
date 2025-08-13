const request = require('supertest');
const express = require('express');
const stripeRoutes = require('../../src/routes/stripeRoutes');

const app = express();
app.use(express.json());
app.use('/api/checkout', stripeRoutes);

describe('Stripe Controller', () => {
  beforeEach(() => {
    // Reset tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('POST /api/checkout/create-checkout-session', () => {
    test('should create checkout session successfully', async () => {
      const products = [
        {
          name: 'Margherita',
          price: 12.50,
          quantity: 2
        },
        {
          name: 'Coca-Cola',
          price: 2.50,
          quantity: 1
        }
      ];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe('session_test_123'); // ID du mock global
    });

    test('should return 400 if products are missing', async () => {
      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({}); // pas de products

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing 'products' in request body");
    });

    test('should return 400 if products is null', async () => {
      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products: null });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing 'products' in request body");
    });

    test('should handle empty products array', async () => {
      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products: [] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe('session_test_123');
    });

    test('should handle products with decimal prices correctly', async () => {
      const products = [
        {
          name: 'Pizza Spéciale',
          price: 15.99,
          quantity: 1
        }
      ];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    test('should handle products with zero price', async () => {
      const products = [
        {
          name: 'Échantillon gratuit',
          price: 0,
          quantity: 1
        }
      ];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    test('should handle multiple products with different quantities', async () => {
      const products = [
        { name: 'Pizza A', price: 10.00, quantity: 2 },
        { name: 'Pizza B', price: 12.50, quantity: 1 },
        { name: 'Boisson', price: 2.50, quantity: 3 }
      ];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    test('should handle products with negative prices', async () => {
      const products = [
        {
          name: 'Discount Product',
          price: -5.00,
          quantity: 1
        }
      ];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    test('should handle products with very large prices', async () => {
      const products = [
        {
          name: 'Expensive Product',
          price: 999999.99,
          quantity: 1
        }
      ];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    test('should handle malformed product data gracefully', async () => {
      const products = [
        {
          name: 'Product without price',
          quantity: 1
          // price manquant
        },
        {
          name: 'Product with string price',
          price: 'invalid',
          quantity: 1
        }
      ];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    test('should convert prices to cents correctly', async () => {
      const products = [
        { name: 'Pizza', price: 15.99, quantity: 1 }
      ];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      const callArgs = mockStripe.checkout.sessions.create.mock.calls[0];
      
      if (callArgs && callArgs[0]) {
        const sessionConfig = callArgs[0];
        expect(sessionConfig.line_items[0].price_data.unit_amount).toBe(1599); // 15.99 * 100
      }
    });

    test('should include correct redirect URLs', async () => {
      const products = [{ name: 'Test', price: 10, quantity: 1 }];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      const callArgs = mockStripe.checkout.sessions.create.mock.calls[0];
      
      if (callArgs && callArgs[0]) {
        const sessionConfig = callArgs[0];
        expect(sessionConfig.success_url).toContain('payment-success');
        expect(sessionConfig.cancel_url).toContain('payment-cancel');
        expect(sessionConfig.success_url).toContain('{CHECKOUT_SESSION_ID}');
      }
    });

    test('should use default localhost URL when VITE_API_URL is not set', async () => {
      // Sauvegarder la valeur originale
      const originalApiUrl = process.env.VITE_API_URL;
      delete process.env.VITE_API_URL;

      const products = [{ name: 'Test', price: 10, quantity: 1 }];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      const callArgs = mockStripe.checkout.sessions.create.mock.calls[0];
      
      if (callArgs && callArgs[0]) {
        const sessionConfig = callArgs[0];
        expect(sessionConfig.success_url).toBe('http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}');
        expect(sessionConfig.cancel_url).toBe('http://localhost:5173/payment-cancel');
      }

      // Restaurer la valeur originale
      if (originalApiUrl) {
        process.env.VITE_API_URL = originalApiUrl;
      }
    });

    test('should use custom VITE_API_URL when set', async () => {
      // Sauvegarder et définir une nouvelle valeur
      const originalApiUrl = process.env.VITE_API_URL;
      process.env.VITE_API_URL = 'https://myapp.com';

      const products = [{ name: 'Test', price: 10, quantity: 1 }];

      const response = await request(app)
        .post('/api/checkout/create-checkout-session')
        .send({ products });

      expect(response.status).toBe(200);
      
      const Stripe = require('stripe');
      const mockStripe = new Stripe();
      const callArgs = mockStripe.checkout.sessions.create.mock.calls[0];
      
      if (callArgs && callArgs[0]) {
        const sessionConfig = callArgs[0];
        expect(sessionConfig.success_url).toBe('https://myapp.com/payment-success?session_id={CHECKOUT_SESSION_ID}');
        expect(sessionConfig.cancel_url).toBe('https://myapp.com/payment-cancel');
      }

      // Restaurer la valeur originale
      if (originalApiUrl) {
        process.env.VITE_API_URL = originalApiUrl;
      } else {
        delete process.env.VITE_API_URL;
      }
    });
  });
});