const { hashPassword, comparePasswords } = require('../../src/utils/hash');
const { generateToken, verifyToken } = require('../../src/utils/jwt');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock bcrypt et jwt
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Utils Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hash Utils', () => {
    describe('hashPassword', () => {
      test('should hash password successfully', async () => {
        const password = 'testPassword123';
        const hashedPassword = 'hashed_password_string';

        bcrypt.hash.mockResolvedValue(hashedPassword);

        const result = await hashPassword(password);

        expect(result).toBe(hashedPassword);
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      });

      test('should handle bcrypt errors', async () => {
        const password = 'testPassword123';
        const error = new Error('Bcrypt error');

        bcrypt.hash.mockRejectedValue(error);

        await expect(hashPassword(password)).rejects.toThrow('Bcrypt error');
      });
    });

    describe('comparePasswords', () => {
      test('should return true for matching passwords', async () => {
        const password = 'testPassword123';
        const hashedPassword = 'hashed_password_string';

        bcrypt.compare.mockResolvedValue(true);

        const result = await comparePasswords(password, hashedPassword);

        expect(result).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      });

      test('should return false for non-matching passwords', async () => {
        const password = 'testPassword123';
        const hashedPassword = 'different_hashed_password';

        bcrypt.compare.mockResolvedValue(false);

        const result = await comparePasswords(password, hashedPassword);

        expect(result).toBe(false);
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      });

      test('should handle bcrypt compare errors', async () => {
        const password = 'testPassword123';
        const hashedPassword = 'hashed_password_string';
        const error = new Error('Compare error');

        bcrypt.compare.mockRejectedValue(error);

        await expect(comparePasswords(password, hashedPassword)).rejects.toThrow('Compare error');
      });
    });
  });

  describe('JWT Utils', () => {
    describe('generateToken', () => {
      test('should generate JWT token successfully', () => {
        const user = {
          id: 1,
          nom: 'John Doe',
          email: 'john@test.com',
          role: 'client'
        };

        const mockToken = 'jwt_token_string';
        jwt.sign.mockReturnValue(mockToken);

        const result = generateToken(user);

        expect(result).toBe(mockToken);
        expect(jwt.sign).toHaveBeenCalledWith(
          {
            id: user.id,
            nom: user.nom,
            email: user.email,
            rôle: user.role
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
      });

      test('should handle missing user properties', () => {
        const user = {
          id: 1,
          email: 'john@test.com'
          // manque nom et role
        };

        const mockToken = 'jwt_token_string';
        jwt.sign.mockReturnValue(mockToken);

        const result = generateToken(user);

        expect(result).toBe(mockToken);
        expect(jwt.sign).toHaveBeenCalledWith(
          {
            id: 1,
            nom: undefined,
            email: 'john@test.com',
            rôle: undefined
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
      });

      test('should use correct secret and expiration', () => {
        const user = { id: 1, email: 'test@test.com' };
        jwt.sign.mockReturnValue('token');

        generateToken(user);

        expect(jwt.sign).toHaveBeenCalledWith(
          expect.any(Object),
          'test_secret_key', // défini dans setup.js
          { expiresIn: "7d" }
        );
      });
    });

    describe('verifyToken', () => {
      test('should verify JWT token successfully', () => {
        const token = 'valid_jwt_token';
        const decodedUser = {
          id: 1,
          nom: 'John Doe',
          email: 'john@test.com',
          rôle: 'client'
        };

        jwt.verify.mockReturnValue(decodedUser);

        const result = verifyToken(token);

        expect(result).toEqual(decodedUser);
        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      });

      test('should throw error for invalid token', () => {
        const token = 'invalid_jwt_token';
        const error = new Error('Invalid token');

        jwt.verify.mockImplementation(() => {
          throw error;
        });

        expect(() => verifyToken(token)).toThrow('Invalid token');
        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      });

      test('should throw error for expired token', () => {
        const token = 'expired_jwt_token';
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';

        jwt.verify.mockImplementation(() => {
          throw error;
        });

        expect(() => verifyToken(token)).toThrow('Token expired');
      });

      test('should throw error for malformed token', () => {
        const token = 'malformed.jwt.token';
        const error = new Error('Malformed token');
        error.name = 'JsonWebTokenError';

        jwt.verify.mockImplementation(() => {
          throw error;
        });

        expect(() => verifyToken(token)).toThrow('Malformed token');
      });

      test('should use correct secret for verification', () => {
        const token = 'test_token';
        jwt.verify.mockReturnValue({ id: 1 });

        verifyToken(token);

        expect(jwt.verify).toHaveBeenCalledWith(token, 'test_secret_key');
      });
    });
  });
});