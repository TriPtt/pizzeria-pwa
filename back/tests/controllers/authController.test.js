const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/authRoutes');
const { hashPassword } = require('../../src/utils/hash');
const bcrypt = require('bcrypt');

// Mock bcrypt
jest.mock('bcrypt');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller', () => {
  beforeEach(() => {
    global.mockPool.query.mockClear();
    bcrypt.hash.mockClear();
    bcrypt.compare.mockClear();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@test.com',
        password_hash: 'password123',
        phone: '0123456789',
        role: 'client'
      };

      // Mock: email n'existe pas
      global.mockPool.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock: bcrypt hash
      bcrypt.hash.mockResolvedValue('hashed_password');
      
      // Mock: insertion réussie
      global.mockPool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0123456789',
          role: 'client'
        }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Inscription réussie');
      expect(response.body.user).toHaveProperty('id');
      expect(global.mockPool.query).toHaveBeenCalledTimes(2);
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John' }); // manque email et password

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Champs requis manquants.');
    });

    test('should return 400 if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'existing@test.com',
        password_hash: 'password123'
      };

      // Mock: email existe déjà
      global.mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email déjà utilisé.');
    });

    test('should handle database errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@test.com',
        password_hash: 'password123'
      };

      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erreur serveur.');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'john@test.com',
        password_hash: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        password_hash: 'hashed_password',
        phone: '0123456789',
        role: 'client'
      };

      // Mock: utilisateur trouvé
      global.mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });
      
      // Mock: mot de passe correct
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Connexion réussie');
      expect(response.body).toHaveProperty('token');
      expect(response.body.utilisateur).toHaveProperty('id', 1);
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@test.com' }); // manque password

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Champs requis manquants.');
    });

    test('should return 401 if user not found', async () => {
      const loginData = {
        email: 'notfound@test.com',
        password_hash: 'password123'
      };

      global.mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou mot de passe incorrect.');
    });

    test('should return 401 if password is incorrect', async () => {
      const loginData = {
        email: 'john@test.com',
        password_hash: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        password_hash: 'hashed_password',
        role: 'client'
      };

      global.mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou mot de passe incorrect.');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return user info with valid token', async () => {
      const token = 'valid_jwt_token';
      
      // Mock du middleware auth qui ajoute req.user
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'client'
      };

      // On va mocker directement le JWT pour ce test
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual(mockUser);
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token manquant ou invalide.');
    });
  });
});