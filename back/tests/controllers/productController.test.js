const request = require('supertest');
const express = require('express');
const productRoutes = require('../../src/routes/productsRoutes');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

// Mock du middleware auth pour les tests nécessitant une authentification
jest.mock('../../src/middlewares/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  };
});

describe('Product Controller', () => {
  beforeEach(() => {
    global.mockPool.query.mockClear();
  });

  describe('GET /api/products', () => {
    test('should return all products', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Margherita',
          description: 'Pizza classique',
          price: 12.50,
          type: 'pizza',
          available: true,
          vegetarian: true
        },
        {
          id: 2,
          name: 'Coca-Cola',
          description: 'Boisson gazeuse',
          price: 2.50,
          type: 'boisson',
          available: true,
          vegetarian: true
        }
      ];

      global.mockPool.query.mockResolvedValue({ rows: mockProducts });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(global.mockPool.query).toHaveBeenCalledWith('SELECT * FROM products ORDER BY created_at DESC');
    });

    test('should handle database errors', async () => {
      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erreur serveur.');
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return product by id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Margherita',
        description: 'Pizza classique',
        price: 12.50,
        type: 'pizza'
      };

      global.mockPool.query.mockResolvedValue({ rows: [mockProduct] });

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    test('should return 404 if product not found', async () => {
      global.mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Produit non trouvé.');
    });
  });

  describe('GET /api/products/type/:type', () => {
    test('should return products by type', async () => {
      const mockPizzas = [
        {
          id: 1,
          name: 'Margherita',
          type: 'pizza',
          price: 12.50
        },
        {
          id: 2,
          name: 'Regina',
          type: 'pizza',
          price: 14.00
        }
      ];

      global.mockPool.query.mockResolvedValue({ rows: mockPizzas });

      const response = await request(app).get('/api/products/type/pizza');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPizzas);
      expect(global.mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE type = $1 ORDER BY created_at DESC',
        ['pizza']
      );
    });
  });

  describe('POST /api/products', () => {
    test('should create a new product', async () => {
      const newProduct = {
        name: 'Nouvelle Pizza',
        description: 'Description test',
        price: 15.00,
        type: 'pizza',
        image: 'test.jpg',
        available: true,
        vegetarian: false
      };

      const createdProduct = { id: 1, ...newProduct };

      global.mockPool.query.mockResolvedValue({ rows: [createdProduct] });

      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Produit créé avec succès.');
      expect(response.body.product).toEqual(createdProduct);
    });

    test('should return 400 if required fields are missing', async () => {
      const invalidProduct = {
        description: 'Description sans nom'
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Champs requis manquants.');
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update a product', async () => {
      const updateData = {
        name: 'Pizza Mise à Jour',
        description: 'Nouvelle description',
        price: 16.00,
        type: 'pizza',
        available: true,
        vegetarian: true
      };

      const updatedProduct = { id: 1, ...updateData };

      global.mockPool.query.mockResolvedValue({ rows: [updatedProduct] });

      const response = await request(app)
        .put('/api/products/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Produit mis à jour avec succès.');
      expect(response.body.product).toEqual(updatedProduct);
    });

    test('should return 404 if product not found for update', async () => {
      const updateData = {
        name: 'Pizza Inexistante',
        price: 10.00,
        type: 'pizza'
      };

      global.mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .put('/api/products/999')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Produit non trouvé.');
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete a product', async () => {
      const deletedProduct = { id: 1, name: 'Produit Supprimé' };

      global.mockPool.query.mockResolvedValue({ rows: [deletedProduct] });

      const response = await request(app).delete('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Produit supprimé.');
    });

    test('should return 404 if product not found for deletion', async () => {
      global.mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).delete('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Produit non trouvé.');
    });
  });

  describe('GET /api/products/:id/ingredients', () => {
    test('should return product ingredients', async () => {
      const mockBaseIngredients = [
        { id: 1, name: 'Sauce tomate', type: 'base', price: 0, removable: false },
        { id: 2, name: 'Mozzarella', type: 'base', price: 0, removable: true }
      ];

      const mockSupplements = [
        { id: 3, name: 'Champignons', type: 'supplement', price: 1.00 },
        { id: 4, name: 'Jambon', type: 'supplement', price: 1.00 }
      ];

      global.mockPool.query
        .mockResolvedValueOnce({ rows: mockBaseIngredients })
        .mockResolvedValueOnce({ rows: mockSupplements });

      const response = await request(app).get('/api/products/1/ingredients');

      expect(response.status).toBe(200);
      expect(response.body.baseIngredients).toEqual(mockBaseIngredients);
      expect(response.body.supplements).toEqual(mockSupplements);
      expect(response.body.removableIngredients).toEqual([mockBaseIngredients[1]]);
    });

    test('should handle errors when fetching ingredients', async () => {
      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/products/1/ingredients');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erreur lors de la récupération des ingrédients');
    });
  });

  describe('GET /api/products/:id/full', () => {
    test('should return product with ingredients for pizza', async () => {
      const mockProduct = {
        id: 1,
        name: 'Margherita',
        type: 'pizza',
        price: 12.50
      };

      const mockBaseIngredients = [
        { id: 1, name: 'Sauce tomate', removable: false }
      ];

      const mockSupplements = [
        { id: 2, name: 'Champignons', price: 1.00 }
      ];

      global.mockPool.query
        .mockResolvedValueOnce({ rows: [mockProduct] })
        .mockResolvedValueOnce({ rows: mockBaseIngredients })
        .mockResolvedValueOnce({ rows: mockSupplements });

      const response = await request(app).get('/api/products/1/full');

      expect(response.status).toBe(200);
      expect(response.body.product).toEqual(mockProduct);
      expect(response.body.baseIngredients).toEqual(mockBaseIngredients);
      expect(response.body.supplements).toEqual(mockSupplements);
    });

    test('should return only product for non-pizza items', async () => {
      const mockProduct = {
        id: 2,
        name: 'Coca-Cola',
        type: 'boisson',
        price: 2.50
      };

      global.mockPool.query.mockResolvedValueOnce({ rows: [mockProduct] });

      const response = await request(app).get('/api/products/2/full');

      expect(response.status).toBe(200);
      expect(response.body.product).toEqual(mockProduct);
      expect(response.body.baseIngredients).toEqual([]);
      expect(response.body.supplements).toEqual([]);
    });

    test('should return 404 if product not found', async () => {
      global.mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/products/999/full');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Produit non trouvé');
    });
  });
});