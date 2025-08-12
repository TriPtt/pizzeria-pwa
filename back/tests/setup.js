const { Pool } = require('pg');

// Mock de la base de données
const mockPool = {
  query: jest.fn(),
  connect: jest.fn().mockReturnValue({
    query: jest.fn(),
    release: jest.fn()
  }),
  on: jest.fn()
};

// Mock du module db
jest.mock('../src/db', () => mockPool);

// Mock de Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: 'session_test_123' })
      }
    }
  }));
});

// Variables d'environnement pour les tests
process.env.JWT_SECRET = 'test_secret_key';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Nettoyer les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

global.mockPool = mockPool;