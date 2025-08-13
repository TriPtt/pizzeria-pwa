const authMiddleware = require('../../src/middlewares/authMiddleware');
const authorizeRole = require('../../src/middlewares/authorizeRole');
const jwt = require('jsonwebtoken');

// Mock JWT
jest.mock('jsonwebtoken');

describe('Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    test('should authenticate user with valid token', () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'client'
      };

      req.headers.authorization = 'Bearer valid_token';
      jwt.verify.mockReturnValue(mockUser);

      authMiddleware(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 401 if no authorization header', () => {
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token manquant ou invalide.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if authorization header is malformed', () => {
      req.headers.authorization = 'Invalid header format';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token manquant ou invalide.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if authorization header does not start with Bearer', () => {
      req.headers.authorization = 'Basic token123';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token manquant ou invalide.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 if token is invalid', () => {
      req.headers.authorization = 'Bearer invalid_token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token invalide ou expiré.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 if token is expired', () => {
      req.headers.authorization = 'Bearer expired_token';
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token invalide ou expiré.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRole', () => {
    beforeEach(() => {
      req.user = {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'client'
      };
    });

    test('should allow access for authorized role', () => {
      const middleware = authorizeRole(['client', 'admin']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny access for unauthorized role', () => {
      const middleware = authorizeRole(['admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Accès refusé : rôle insuffisant. Le role actuel est : client'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny access if user is not authenticated', () => {
      req.user = null;
      const middleware = authorizeRole(['client']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Accès refusé : rôle insuffisant. Le role actuel est : non authentifié'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny access if user has no role', () => {
      req.user = {
        id: 1,
        name: 'John Doe'
        // no role property
      };
      const middleware = authorizeRole(['admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should allow admin access to admin-only resources', () => {
      req.user.role = 'admin';
      const middleware = authorizeRole(['admin']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow multiple roles', () => {
      req.user.role = 'staff';
      const middleware = authorizeRole(['admin', 'staff', 'manager']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should be case sensitive for role matching', () => {
      req.user.role = 'Admin'; // uppercase A
      const middleware = authorizeRole(['admin']); // lowercase

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle empty allowed roles array', () => {
      const middleware = authorizeRole([]);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});