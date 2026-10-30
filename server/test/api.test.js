import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { Booking } from '../src/models/Booking.js';
import { Barber } from '../src/models/Barber.js';
import { Admin } from '../src/models/Admin.js';
import { Service } from '../src/models/Service.js';

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Public & Health Endpoints', () => {
    it('GET /api/health returns service status and env', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('barbershop-server');
    });

    it('GET /api/unknown-endpoint returns 404 with error payload', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Validation & Error Handling Middleware', () => {
    it('POST /api/bookings returns 400 VALIDATION_ERROR on invalid phone number', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          customerName: 'Test Customer',
          phone: '123', // Invalid phone
          serviceId: 'srv-1',
          barberId: 'barb-1',
          date: '2026-11-01',
          startTime: '10:00 AM',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/bookings returns 400 on invalid date format', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          customerName: 'Test Customer',
          phone: '9876543210',
          serviceId: 'srv-1',
          barberId: 'barb-1',
          date: '01-11-2026', // Wrong format
          startTime: '10:00 AM',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Auth & RBAC Middleware', () => {
    it('GET /api/admin/bookings returns 401 when no token is provided', async () => {
      const res = await request(app).get('/api/admin/bookings');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/admin/bookings returns 403 when user role is not permitted', async () => {
      const clientToken = jwt.sign(
        { id: 'usr-1', name: 'Client User', email: 'user@test.com', role: 'client' },
        env.JWT_SECRET
      );

      const res = await request(app)
        .get('/api/admin/bookings')
        .set('Cookie', [`${env.COOKIE_NAME}=${clientToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('GET /api/admin/bookings succeeds when valid owner token is provided', async () => {
      const ownerToken = jwt.sign(
        { id: 'admin-1', name: 'Master Owner', email: 'owner@test.com', role: 'owner' },
        env.JWT_SECRET
      );

      vi.spyOn(Booking, 'countDocuments').mockResolvedValue(0);
      vi.spyOn(Booking, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const res = await request(app)
        .get('/api/admin/bookings')
        .set('Cookie', [`${env.COOKIE_NAME}=${ownerToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Double-Booking Prevention & Concurrency Protection', () => {
    it('returns 409 CONFLICT when booking an already occupied slot', async () => {
      vi.spyOn(Barber, 'findOne').mockResolvedValue({
        id: 'barb-1',
        _id: '60c72b2f9b1d8b2bad123456',
        name: 'Devraj Saxena',
      });

      vi.spyOn(Booking, 'findOne').mockResolvedValue({
        id: 'existing-booking-1',
        barberId: 'barb-1',
        date: '2026-11-01',
        startTime: '10:00 AM',
        status: 'confirmed',
      });

      const res = await request(app)
        .post('/api/bookings')
        .send({
          customerName: 'Second Client',
          phone: '9876543210',
          serviceId: 'srv-1',
          barberId: 'barb-1',
          date: '2026-11-01',
          startTime: '10:00 AM',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('already booked');
    });

    it('translates MongoDB duplicate key error (code 11000) to 409 CONFLICT', async () => {
      vi.spyOn(Barber, 'findOne').mockResolvedValue({
        id: 'barb-1',
        _id: '60c72b2f9b1d8b2bad123456',
        name: 'Devraj Saxena',
      });

      // No conflict detected on initial read (race condition window)
      vi.spyOn(Booking, 'findOne').mockResolvedValue(null);

      // Unique compound index fires on insert
      const mongo11000Error = new Error('E11000 duplicate key error');
      mongo11000Error.code = 11000;
      mongo11000Error.keyPattern = { barberId: 1, date: 1, startTime: 1 };
      mongo11000Error.keyValue = { barberId: 'barb-1', date: '2026-11-01', startTime: '10:00 AM' };

      vi.spyOn(Booking, 'create').mockRejectedValue(mongo11000Error);

      const res = await request(app)
        .post('/api/bookings')
        .send({
          customerName: 'Concurrent Client',
          phone: '9876543210',
          serviceId: 'srv-1',
          barberId: 'barb-1',
          date: '2026-11-01',
          startTime: '10:00 AM',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('already booked');
    });

    it('handles concurrent booking requests: exactly one succeeds and one receives 409', async () => {
      let bookingCreated = false;

      vi.spyOn(Barber, 'findOne').mockResolvedValue({
        id: 'barb-1',
        _id: '60c72b2f9b1d8b2bad123456',
        name: 'Devraj Saxena',
      });

      vi.spyOn(Booking, 'findOne').mockImplementation(async () => {
        return bookingCreated ? { id: 'bk-first' } : null;
      });

      vi.spyOn(Booking, 'create').mockImplementation(async (payload) => {
        if (bookingCreated) {
          const err = new Error('E11000 duplicate key');
          err.code = 11000;
          err.keyPattern = { barberId: 1, date: 1, startTime: 1 };
          throw err;
        }
        bookingCreated = true;
        return {
          id: 'bk-first',
          ...payload,
        };
      });

      const payload = {
        customerName: 'Customer',
        phone: '9876543210',
        serviceId: 'srv-1',
        barberId: 'barb-1',
        date: '2026-11-01',
        startTime: '10:00 AM',
      };

      const [res1, res2] = await Promise.all([
        request(app).post('/api/bookings').send(payload),
        request(app).post('/api/bookings').send(payload),
      ]);

      const statuses = [res1.status, res2.status].sort();
      expect(statuses).toEqual([201, 409]);

      const successRes = res1.status === 201 ? res1 : res2;
      const conflictRes = res1.status === 409 ? res1 : res2;

      expect(successRes.body.success).toBe(true);
      expect(conflictRes.body.success).toBe(false);
      expect(conflictRes.body.error.code).toBe('CONFLICT');
    });
  });

  describe('Auth Controller Flow', () => {
    it('POST /api/auth/login sets httpOnly cookie on successful authentication', async () => {
      const mockAdmin = {
        id: 'admin-1',
        name: 'Master Owner',
        email: 'owner@barbershop.com',
        role: 'owner',
        comparePassword: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Admin, 'findOne').mockResolvedValue(mockAdmin);

      const res = await request(app).post('/api/auth/login').send({
        email: 'owner@barbershop.com',
        password: 'Admin@123456',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('owner@barbershop.com');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
    });

    it('POST /api/auth/logout clears auth cookie', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie'][0]).toContain(`${env.COOKIE_NAME}=;`);
    });
  });
});
