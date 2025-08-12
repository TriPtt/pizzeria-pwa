const request = require('supertest');
const express = require('express');

// Import du contrôleur directement pour les tests
const reservationController = require('../../src/controllers/reservationController');

const app = express();
app.use(express.json());

// Mock du middleware auth
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1, role: 'client' };
  next();
};

// Mock du middleware authorizeRole
const mockAuthorizeRole = (roles) => (req, res, next) => {
  if (roles.includes('admin')) {
    req.user.role = 'admin';
  }
  next();
};

// Configuration des routes manuellement car le fichier utilise ES modules
app.post('/api/reservations', mockAuthMiddleware, reservationController.createReservation);
app.get('/api/reservations', mockAuthMiddleware, mockAuthorizeRole(['admin']), reservationController.getAllReservations);
app.get('/api/reservations/:id', mockAuthMiddleware, reservationController.getReservationById);
app.get('/api/reservations/user/me', mockAuthMiddleware, reservationController.getUserReservations);
app.put('/api/reservations/:id', mockAuthMiddleware, reservationController.updateReservation);
app.delete('/api/reservations/:id', mockAuthMiddleware, reservationController.cancelReservation);
app.get('/api/reservations/check/availability', reservationController.checkAvailability);
app.get('/api/reservations/slots/available', reservationController.getAvailableSlots);

describe('Reservation Controller', () => {
  beforeEach(() => {
    global.mockPool.query.mockClear();
    jest.clearAllMocks();
  });

  describe('POST /api/reservations', () => {
    test('should create reservation successfully', async () => {
      const reservationData = {
        reservation_date: '2024-02-01T19:00:00.000Z',
        number_of_guests: 4
      };

      const mockReservation = {
        id: 1,
        user_id: 1,
        reservation_date: '2024-02-01T19:00:00.000Z',
        number_of_guests: 4,
        status: 'pending'
      };

      // Mock de checkAvailability (retourne true)
      global.mockPool.query.mockResolvedValueOnce({ rows: [{ total_guests: '8' }] });
      
      // Mock de l'insertion
      global.mockPool.query.mockResolvedValueOnce({ rows: [mockReservation] });

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Reservation created');
      expect(response.body.reservation).toEqual(mockReservation);
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .send({ number_of_guests: 4 }); // manque reservation_date

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });

    test('should return 400 if number of guests is invalid', async () => {
      const reservationData = {
        reservation_date: '2024-02-01T19:00:00.000Z',
        number_of_guests: 10 // trop de personnes (max 8)
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Number of guests must be between 1 and 8');
    });

    test('should return 400 if time slot not available', async () => {
      const reservationData = {
        reservation_date: '2024-02-01T19:00:00.000Z',
        number_of_guests: 4
      };

      // Mock de checkAvailability (retourne false - pas disponible)
      global.mockPool.query.mockResolvedValueOnce({ rows: [{ total_guests: '14' }] }); // 14 + 4 > 16

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Time slot not available');
    });
  });

  describe('GET /api/reservations/user/me', () => {
    test('should return user reservations', async () => {
      const mockReservations = [
        {
          id: 1,
          user_id: 1,
          reservation_date: '2024-02-01T19:00:00.000Z',
          number_of_guests: 4,
          status: 'pending'
        },
        {
          id: 2,
          user_id: 1,
          reservation_date: '2024-02-05T20:00:00.000Z',
          number_of_guests: 2,
          status: 'confirmed'
        }
      ];

      global.mockPool.query.mockResolvedValue({ rows: mockReservations });

      const response = await request(app)
        .get('/api/reservations/user/me');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReservations);
      expect(global.mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        [1]
      );
    });

    test('should handle database errors', async () => {
      global.mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/reservations/user/me');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch user reservations');
    });
  });

  describe('GET /api/reservations', () => {
    test('should return all reservations for admin', async () => {
      const mockReservations = [
        {
          id: 1,
          user_id: 1,
          reservation_date: '2024-02-01T19:00:00.000Z',
          number_of_guests: 4,
          status: 'pending',
          email: 'user1@test.com'
        },
        {
          id: 2,
          user_id: 2,
          reservation_date: '2024-02-05T20:00:00.000Z',
          number_of_guests: 2,
          status: 'confirmed',
          email: 'user2@test.com'
        }
      ];

      global.mockPool.query.mockResolvedValue({ rows: mockReservations });

      const response = await request(app)
        .get('/api/reservations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReservations);
    });
  });

  describe('GET /api/reservations/:id', () => {
    test('should return reservation by id', async () => {
      const mockReservation = {
        id: 1,
        user_id: 1,
        reservation_date: '2024-02-01T19:00:00.000Z',
        number_of_guests: 4,
        status: 'pending',
        email: 'user@test.com'
      };

      global.mockPool.query.mockResolvedValue({ rows: [mockReservation] });

      const response = await request(app)
        .get('/api/reservations/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReservation);
    });

    test('should return 404 if reservation not found', async () => {
      global.mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/reservations/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Reservation not found');
    });
  });

  describe('PUT /api/reservations/:id', () => {
    test('should update reservation successfully', async () => {
      const updateData = {
        reservation_date: '2024-02-02T19:00:00.000Z',
        number_of_guests: 6
      };

      const mockExistingReservation = {
        id: 1,
        user_id: 1,
        reservation_date: '2024-02-10T19:00:00.000Z', // future date
        number_of_guests: 4,
        status: 'pending'
      };

      const mockUpdatedReservation = {
        ...mockExistingReservation,
        ...updateData
      };

      // Mock: vérification que la réservation existe
      global.mockPool.query.mockResolvedValueOnce({ rows: [mockExistingReservation] });
      
      // Mock: vérification disponibilité
      global.mockPool.query.mockResolvedValueOnce({ rows: [{ total_guests: '8' }] });
      
      // Mock: mise à jour
      global.mockPool.query.mockResolvedValueOnce({ rows: [mockUpdatedReservation] });

      const response = await request(app)
        .put('/api/reservations/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reservation updated');
      expect(response.body.reservation).toEqual(mockUpdatedReservation);
    });

    test('should return 404 if reservation not found', async () => {
      global.mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .put('/api/reservations/999')
        .send({ number_of_guests: 4 });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Reservation not found');
    });

    test('should return 400 if trying to modify reservation less than 2 hours before', async () => {
      const updateData = {
        number_of_guests: 6
      };

      // Réservation dans 1 heure (moins de 2 heures)
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 1);

      const mockExistingReservation = {
        id: 1,
        user_id: 1,
        reservation_date: soonDate.toISOString(),
        number_of_guests: 4,
        status: 'pending'
      };

      global.mockPool.query.mockResolvedValueOnce({ rows: [mockExistingReservation] });

      const response = await request(app)
        .put('/api/reservations/1')
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot modify reservation less than 2 hours before');
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    test('should cancel reservation successfully', async () => {
      // Réservation dans le futur (plus de 2 heures)
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 5);

      const mockExistingReservation = {
        id: 1,
        user_id: 1,
        reservation_date: futureDate.toISOString(),
        number_of_guests: 4,
        status: 'pending'
      };

      const mockCancelledReservation = {
        ...mockExistingReservation,
        status: 'cancelled'
      };

      // Mock: vérification que la réservation existe
      global.mockPool.query.mockResolvedValueOnce({ rows: [mockExistingReservation] });
      
      // Mock: annulation
      global.mockPool.query.mockResolvedValueOnce({ rows: [mockCancelledReservation] });

      const response = await request(app)
        .delete('/api/reservations/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reservation cancelled');
      expect(response.body.reservation.status).toBe('cancelled');
    });

    test('should return 400 if trying to cancel reservation less than 2 hours before', async () => {
      // Réservation dans 1 heure
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 1);

      const mockExistingReservation = {
        id: 1,
        user_id: 1,
        reservation_date: soonDate.toISOString(),
        number_of_guests: 4,
        status: 'pending'
      };

      global.mockPool.query.mockResolvedValueOnce({ rows: [mockExistingReservation] });

      const response = await request(app)
        .delete('/api/reservations/1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot cancel reservation less than 2 hours before');
    });
  });

  describe('GET /api/reservations/check/availability', () => {
    test('should check availability successfully', async () => {
      // Mock de checkAvailability qui retourne disponible
      global.mockPool.query.mockResolvedValue({ rows: [{ total_guests: '8' }] });

      const response = await request(app)
        .get('/api/reservations/check/availability')
        .query({ date: '2024-02-01T19:00:00.000Z', guests: '4' });

      expect(response.status).toBe(200);
      expect(response.body.available).toBe(true);
    });

    test('should return 400 if date or guests missing', async () => {
      const response = await request(app)
        .get('/api/reservations/check/availability')
        .query({ date: '2024-02-01T19:00:00.000Z' }); // manque guests

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Date and guests required');
    });
  });

  describe('GET /api/reservations/slots/available', () => {
    test('should return available slots', async () => {
      // Mock pour plusieurs créneaux disponibles
      global.mockPool.query
        .mockResolvedValueOnce({ rows: [{ total_guests: '4' }] }) // 19:00 disponible
        .mockResolvedValueOnce({ rows: [{ total_guests: '6' }] }) // 19:30 disponible
        .mockResolvedValueOnce({ rows: [{ total_guests: '16' }] }); // 20:00 non disponible

      const response = await request(app)
        .get('/api/reservations/slots/available')
        .query({ date: '2024-02-01', guests: '4' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slots');
      expect(Array.isArray(response.body.slots)).toBe(true);
    });

    test('should return 400 if date or guests missing', async () => {
      const response = await request(app)
        .get('/api/reservations/slots/available')
        .query({ guests: '4' }); // manque date

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Date and guests required');
    });
  });
});