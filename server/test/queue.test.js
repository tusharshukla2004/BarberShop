import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { QueueEntry } from '../src/models/QueueEntry.js';
import { Booking } from '../src/models/Booking.js';
import { Barber } from '../src/models/Barber.js';
import { Service } from '../src/models/Service.js';
import { Customer } from '../src/models/Customer.js';
import { Settings } from '../src/models/Settings.js';

describe('Queue Endpoints & Walk-in System Integration Tests', () => {
  const token = jwt.sign(
    { id: 'admin-1', role: 'owner', email: 'owner@vintageblade.in' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const authCookie = `${env.COOKIE_NAME}=${token}`;

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(Barber, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        {
          id: 'barb-1',
          name: 'Alex Vance',
          isActive: true,
          schedule: {
            monday: { start: '09:00 AM', end: '08:00 PM', isOff: false, breaks: [] },
            tuesday: { start: '09:00 AM', end: '08:00 PM', isOff: false, breaks: [] },
            wednesday: { start: '09:00 AM', end: '08:00 PM', isOff: false, breaks: [] },
            thursday: { start: '09:00 AM', end: '08:00 PM', isOff: false, breaks: [] },
            friday: { start: '09:00 AM', end: '08:00 PM', isOff: false, breaks: [] },
            saturday: { start: '09:00 AM', end: '08:00 PM', isOff: false, breaks: [] },
            sunday: { start: '09:00 AM', end: '08:00 PM', isOff: false, breaks: [] },
          },
        },
      ]),
    });

    vi.spyOn(Service, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        { id: 'srv-1', name: 'Classic Fade', durationMinutes: 30, price: 500, isActive: true },
      ]),
    });

    vi.spyOn(Service, 'findOne').mockResolvedValue({
      id: 'srv-1',
      name: 'Classic Fade',
      durationMinutes: 30,
      price: 500,
      isActive: true,
    });

    vi.spyOn(Settings, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        queueSettings: {
          walkInsEnabled: true,
          maxQueueLength: 20,
          publicQueueEnabled: true,
          bufferMinutes: 5,
          stopAcceptingBeforeClosingMinutes: 45,
        },
        holidays: [],
      }),
    });

    vi.spyOn(Booking, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    });
  });

  describe('Public Queue Status (Zero PII Privacy Check)', () => {
    it('GET /api/queue/status returns anonymous data and never leaks customer names or phones', async () => {
      vi.spyOn(QueueEntry, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              id: 'q-1',
              customerName: 'Top Secret VIP Customer',
              phone: '919876543210',
              status: 'waiting',
              tokenNumber: 1,
              serviceId: 'srv-1',
            },
          ]),
        }),
      });

      const res = await request(app).get('/api/queue/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data).toHaveProperty('isOpen');
      expect(data).toHaveProperty('walkInsEnabled');
      expect(data).toHaveProperty('peopleWaiting');
      expect(data).toHaveProperty('estimatedWaitMinutes');

      // Crucial privacy requirement: NO customer names or phones exposed
      const jsonString = JSON.stringify(res.body);
      expect(jsonString).not.toContain('Top Secret VIP Customer');
      expect(jsonString).not.toContain('919876543210');
      expect(jsonString).not.toContain('customerName');
      expect(jsonString).not.toContain('phone');
    });

    it('POST /api/queue/join rejects spam bots with honeypot field', async () => {
      const res = await request(app)
        .post('/api/queue/join')
        .send({
          customerName: 'Spam Bot',
          phone: '+919876543210',
          serviceId: 'srv-1',
          hp_field: 'I am a spambot filling every field',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin Queue Operations', () => {
    it('GET /api/admin/queue requires authentication', async () => {
      const res = await request(app).get('/api/admin/queue');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/queue returns queue entries and estimations with valid token', async () => {
      vi.spyOn(QueueEntry, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              id: 'q-1',
              _id: '60c72b2f9b1d8b2bad123450',
              tokenNumber: 1,
              customerName: 'Vikram',
              phone: '9876543210',
              serviceId: 'srv-1',
              status: 'waiting',
              date: '2026-11-02',
            },
          ]),
        }),
      });

      const res = await request(app)
        .get('/api/admin/queue?date=2026-11-02')
        .set('Cookie', [authCookie]);

      if (res.status !== 200) {
        console.error('GET /api/admin/queue error:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.entries).toHaveLength(1);
      expect(res.body.data.entries[0].customerName).toBe('Vikram');
    });

    it('POST /api/admin/queue generates sequential token and saves new walk-in', async () => {
      vi.spyOn(QueueEntry, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      vi.spyOn(QueueEntry, 'findOne').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue({ tokenNumber: 5 }),
          }),
        }),
      });

      vi.spyOn(QueueEntry, 'create').mockImplementation(async (doc) => ({
        id: 'q-new',
        _id: '60c72b2f9b1d8b2bad123499',
        ...doc,
      }));

      const res = await request(app)
        .post('/api/admin/queue')
        .set('Cookie', [authCookie])
        .send({
          customerName: 'Arjun Das',
          phone: '+91 98765 43210',
          serviceId: 'srv-1',
          notes: 'Wants trim only',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokenNumber).toBe(6); // Incremented from 5
      expect(res.body.data.customerName).toBe('Arjun Das');
    });

    it('PATCH /api/admin/queue/:id completing walk-in creates a completed booking of type walk_in', async () => {
      const mockEntry = {
        _id: '60c72b2f9b1d8b2bad123488',
        id: 'q-88',
        customerName: 'Karan Mehra',
        phone: '9876543210',
        serviceId: 'srv-1',
        barberId: 'barb-1',
        status: 'in_service',
        date: '2026-11-02',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(QueueEntry, 'findById').mockResolvedValue(mockEntry);
      vi.spyOn(QueueEntry, 'findOne').mockResolvedValue(mockEntry);

      let createdBookingDoc = null;
      vi.spyOn(Booking, 'create').mockImplementation(async (doc) => {
        createdBookingDoc = { _id: '60c72b2f9b1d8b2bad123477', ...doc };
        return createdBookingDoc;
      });

      vi.spyOn(Customer, 'findOne').mockResolvedValue(null);
      vi.spyOn(Customer, 'create').mockResolvedValue({
        _id: '60c72b2f9b1d8b2bad123466',
        name: 'Karan Mehra',
        phone: '919876543210',
      });

      const res = await request(app)
        .patch('/api/admin/queue/q-88')
        .set('Cookie', [authCookie])
        .send({
          status: 'done',
        });

      expect(res.status).toBe(200);
      expect(mockEntry.status).toBe('done');
      expect(mockEntry.completedAt).toBeInstanceOf(Date);
      expect(createdBookingDoc).not.toBeNull();
      expect(createdBookingDoc.source).toBe('walk_in');
      expect(createdBookingDoc.status).toBe('completed');
      expect(createdBookingDoc.priceAtBooking).toBe(500);
    });
  });
});
