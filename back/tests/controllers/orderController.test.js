const request = require('supertest');
const express = require('express');
const orderRoutes = require('../../src/routes/orderRoutes');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

// Mock du middleware auth
jest.mock('../../src/middlewares/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { id: 1, role: 'client' };
    next();
  };
});

// Mock du middleware authorizeRole
jest.mock('../../src/middlewares/authorizeRole', () => {
  return (roles) => (req, res, next) => {
    if (roles.includes('admin') && req.user.role !== 'admin') {
      req.user.role = 'admin'; // Pour les tests admin
    }
    next();
  };
});

describe('Order Controller', () => {
  let mockClient;

  beforeEach(() => {
    global.mockPool.query.mockClear();
    
    // Mock du client de transaction
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    global.mockPool.connect.mockResolvedValue(mockClient);
  });

  describe('POST /api/orders', () => {
    test('should create order successfully', async () => {
      const orderData = {
        items: [
          {
            product_id: 1,
            quantity: 2,
            base_price: 12.50,
            unit_price: 13.50,
            customizations: {}
          }
        ],
        customer_name: 'John Doe',
        customer_phone: '0123456789',
        pickup_date: '2024-01-15',
        pickup_time: '12:00',
        total_amount: 27.00
      };

      const mockProducts = [
        { id: 1, name: 'Margherita', price: 12.50 }
      ];

      const mockOrderResult = {
        rows: [{ id: 1, created_at: '2024-01-01T10:00:00Z' }]
      };

      // Mock des requêtes dans l'ordre
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: mockProducts }) // SELECT products
        .mockResolvedValueOnce(mockOrderResult) // INSERT order
        .mockResolvedValueOnce() // INSERT order_items
        .mockResolvedValueOnce(); // COMMIT

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Commande créée avec succès');
      expect(response.body.order).toHaveProperty('id', 1);
      expect(response.body.order).toHaveProperty('total_price', 27.00);
      expect(response.body.order.items).toHaveLength(1);
    });

    test('should return 400 if no items provided', async () => {
      const orderData = {
        items: [],
        customer_name: 'John Doe',
        customer_phone: '0123456789',
        total_amount: 0
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Aucun article fourni');
    });

    test('should return 400 if customer info is missing', async () => {
      const orderData = {
        items: [{ product_id: 1, quantity: 1 }],
        total_amount: 10
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Nom et téléphone requis');
    });

    test('should return 400 if product not found', async () => {
      const orderData = {
        items: [{ product_id: 999, quantity: 1 }],
        customer_name: 'John Doe',
        customer_phone: '0123456789',
        total_amount: 10
      };

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // SELECT products (empty)
        .mockResolvedValueOnce(); // ROLLBACK

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Produit ID 999 non trouvé');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('should handle database errors', async () => {
      const orderData = {
        items: [{ product_id: 1, quantity: 1 }],
        customer_name: 'John Doe',
        customer_phone: '0123456789',
        total_amount: 10
      };

      mockClient.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erreur lors de la création de la commande');
    });

    test('should normalize customer data from customer object', async () => {
      const orderData = {
        items: [{ id: 1, quantity: 1, price: 12.50 }],
        customer: {
          name: 'Jane Doe',
          phone: '0987654321'
        },
        total_amount: 12.50
      };

      const mockProducts = [
        { id: 1, name: 'Pizza', price: 12.50 }
      ];

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: mockProducts })
        .mockResolvedValueOnce({ rows: [{ id: 1, created_at: new Date() }] })
        .mockResolvedValueOnce() // INSERT items
        .mockResolvedValueOnce(); // COMMIT

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.customer_name).toBe('Jane Doe');
      expect(response.body.order.customer_phone).toBe('0987654321');
    });
  });

  describe('GET /api/orders', () => {
    test('should return all orders for admin', async () => {
      const mockOrders = [
        {
          id: 1,
          user_id: 1,
          total_price: 25.00,
          status: 'pending',
          email: 'user@test.com'
        },
        {
          id: 2,
          user_id: 2,
          total_price: 15.00,
          status: 'confirmed',
          email: 'user2@test.com'
        }
      ];

      global.mockPool.query.mockResolvedValue({ rows: mockOrders });

      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
      expect(global.mockPool.query).toHaveBeenCalledWith(
        `SELECT o.*, u.email 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
      );
    });

    test('should handle database errors', async () => {
      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error fetching orders');
    });
  });

  describe('GET /api/orders/:id', () => {
    test('should return order with items by id', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        total_price: 25.00,
        status: 'pending'
      };

      const mockItems = [
        {
          id: 1,
          product_id: 1,
          quantity: 2,
          name: 'Margherita',
          price: 12.50
        }
      ];

      global.mockPool.query
        .mockResolvedValueOnce({ rows: [mockOrder] })
        .mockResolvedValueOnce({ rows: mockItems });

      const response = await request(app).get('/api/orders/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockOrder,
        items: mockItems
      });
    });

    test('should return 404 if order not found', async () => {
      global.mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/orders/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('GET /api/orders/user/my-orders', () => {
    test('should return user orders with items', async () => {
      const mockOrders = [
        {
          id: 1,
          total_price: 25.00,
          status: 'pending',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          order_number: 'CMD-001',
          items: [
            {
              name: 'Margherita',
              quantity: 2,
              price: 12.50
            }
          ]
        }
      ];

      global.mockPool.query.mockResolvedValue({ rows: mockOrders });

      const response = await request(app).get('/api/orders/user/my-orders');

      expect(response.status).toBe(200);
      expect(response.body.orders).toEqual(mockOrders);
      expect(global.mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE o.user_id = $1'),
        [1]
      );
    });

    test('should handle database errors', async () => {
      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/orders/user/my-orders');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error fetching user orders');
    });
  });
});