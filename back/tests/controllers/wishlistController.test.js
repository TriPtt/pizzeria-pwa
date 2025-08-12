const request = require('supertest');
const express = require('express');
const wishlistRoutes = require('../../src/routes/wishlistRoutes');

const app = express();
app.use(express.json());
app.use('/api/wishlist', wishlistRoutes);

// Mock du middleware auth
jest.mock('../../src/middlewares/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { id: 1 };
    next();
  };
});

describe('Wishlist Controller', () => {
  beforeEach(() => {
    global.mockPool.query.mockClear();
  });

  describe('GET /api/wishlist', () => {
    test('should return user wishlist', async () => {
      const mockWishlistItems = [
        {
          wishlist_id: 1,
          product_id: 1,
          created_at: '2024-01-01T10:00:00Z',
          id: 1,
          name: 'Margherita',
          description: 'Pizza classique',
          price: 12.50,
          image: 'pizza.jpg',
          type: 'pizza',
          available: true,
          vegetarian: true
        },
        {
          wishlist_id: 2,
          product_id: 2,
          created_at: '2024-01-01T11:00:00Z',
          id: 2,
          name: 'Tiramisu',
          description: 'Dessert italien',
          price: 5.50,
          image: 'tiramisu.jpg',
          type: 'dessert',
          available: true,
          vegetarian: true
        }
      ];

      global.mockPool.query.mockResolvedValue({ rows: mockWishlistItems });

      const response = await request(app).get('/api/wishlist');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.items).toEqual(mockWishlistItems);
      expect(response.body.count).toBe(2);
    });

    test('should handle database errors', async () => {
      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/wishlist');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Erreur lors de la récupération de la wishlist');
    });
  });

  describe('POST /api/wishlist/add', () => {
    test('should add product to wishlist', async () => {
      const mockResult = { rows: [{ id: 1 }] };
      global.mockPool.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/wishlist/add')
        .send({ product_id: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Produit ajouté à la wishlist');
      expect(response.body.wishlistItemId).toBe(1);
    });

    test('should return 400 for invalid product_id', async () => {
      const response = await request(app)
        .post('/api/wishlist/add')
        .send({ product_id: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product ID invalide');
    });

    test('should return 400 for missing product_id', async () => {
      const response = await request(app)
        .post('/api/wishlist/add')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product ID invalide');
    });

    test('should handle database errors', async () => {
      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/wishlist/add')
        .send({ product_id: 1 });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Erreur lors de l\'ajout à la wishlist');
    });
  });

  describe('DELETE /api/wishlist/remove/:productId', () => {
    test('should remove product from wishlist', async () => {
      const mockProductResult = { rows: [{ name: 'Margherita' }] };
      const mockDeleteResult = { rows: [{ id: 1 }] };

      global.mockPool.query
        .mockResolvedValueOnce(mockProductResult)
        .mockResolvedValueOnce(mockDeleteResult);

      const response = await request(app).delete('/api/wishlist/remove/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('"Margherita" supprimé de la wishlist');
    });

    test('should return 404 if product not in wishlist', async () => {
      const mockProductResult = { rows: [] };
      const mockDeleteResult = { rows: [] };

      global.mockPool.query
        .mockResolvedValueOnce(mockProductResult)
        .mockResolvedValueOnce(mockDeleteResult);

      const response = await request(app).delete('/api/wishlist/remove/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Produit non trouvé dans la wishlist');
    });

    test('should return 400 for invalid product_id', async () => {
      const response = await request(app).delete('/api/wishlist/remove/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product ID invalide');
    });
  });

  describe('DELETE /api/wishlist/clear', () => {
    test('should clear all wishlist items', async () => {
      const mockResult = { rows: [{ id: 1 }, { id: 2 }] };
      global.mockPool.query.mockResolvedValue(mockResult);

      const response = await request(app).delete('/api/wishlist/clear');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('2 produits supprimés de la wishlist');
      expect(response.body.removed_count).toBe(2);
    });

    test('should handle empty wishlist', async () => {
      const mockResult = { rows: [] };
      global.mockPool.query.mockResolvedValue(mockResult);

      const response = await request(app).delete('/api/wishlist/clear');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('La wishlist était déjà vide');
      expect(response.body.removed_count).toBe(0);
    });
  });

  describe('GET /api/wishlist/check/:productId', () => {
    test('should check if product is in wishlist', async () => {
      const mockResult = {
        rows: [{
          id: 1,
          created_at: '2024-01-01T10:00:00Z',
          name: 'Margherita'
        }]
      };
      global.mockPool.query.mockResolvedValue(mockResult);

      const response = await request(app).get('/api/wishlist/check/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.in_wishlist).toBe(true);
      expect(response.body.product_name).toBe('Margherita');
    });

    test('should return false if product not in wishlist', async () => {
      const mockResult = { rows: [] };
      global.mockPool.query.mockResolvedValue(mockResult);

      const response = await request(app).get('/api/wishlist/check/999');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.in_wishlist).toBe(false);
      expect(response.body.product_name).toBe(null);
    });

    test('should return 400 for invalid product_id', async () => {
      const response = await request(app).get('/api/wishlist/check/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product ID invalide');
    });
  });

  describe('GET /api/wishlist/stats', () => {
    test('should return wishlist statistics', async () => {
      const mockStats = {
        total_items: '3',
        available_items: '2',
        vegetarian_items: '2',
        total_value: '30.50',
        first_added: '2024-01-01T10:00:00Z',
        last_added: '2024-01-02T10:00:00Z'
      };

      global.mockPool.query.mockResolvedValue({ rows: [mockStats] });

      const response = await request(app).get('/api/wishlist/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats.total_items).toBe(3);
      expect(response.body.stats.available_items).toBe(2);
      expect(response.body.stats.vegetarian_items).toBe(2);
      expect(response.body.stats.total_value).toBe(30.50);
    });

    test('should handle database errors', async () => {
      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/wishlist/stats');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Erreur lors de la récupération des statistiques');
    });
  });
});