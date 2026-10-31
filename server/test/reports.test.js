import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { Booking } from '../src/models/Booking.js';
import { Barber } from '../src/models/Barber.js';
import { Service } from '../src/models/Service.js';
import { Customer } from '../src/models/Customer.js';
import { Payment } from '../src/models/Payment.js';
import {
  calculateRevenue,
  calculateNoShowRate,
  calculateRepeatRate,
  calculatePeriodDelta,
} from '../src/reports/definitions.js';

describe('Reports & Analytics Suite', () => {
  const ownerToken = jwt.sign(
    { id: 'admin-1', role: 'owner', email: 'owner@barbershop.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const barberToken = jwt.sign(
    { id: 'barb-1', barberId: 'barb-1', role: 'barber', email: 'barber@barbershop.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const ownerAuthCookie = `${env.COOKIE_NAME}=${ownerToken}`;
  const barberAuthCookie = `${env.COOKIE_NAME}=${barberToken}`;

  describe('Pure Metric Calculation Definitions', () => {
    it('calculates gross realized revenue correctly from completed bookings', () => {
      const sampleBookings = [
        { status: 'completed', priceAtBooking: 650 },
        { status: 'completed', priceAtBooking: 1200 },
        { status: 'no_show', priceAtBooking: 500 },
        { status: 'cancelled', priceAtBooking: 800 },
        { status: 'confirmed', priceAtBooking: 400 },
      ];
      expect(calculateRevenue(sampleBookings)).toBe(1850);
    });

    it('computes no-show rate accurately and handles zero division without NaN', () => {
      // 2 no-shows, 8 completed => 2 / (8 + 2) = 20%
      expect(calculateNoShowRate(2, 8)).toBe(20.0);
      // Zero appointments => 0.0
      expect(calculateNoShowRate(0, 0)).toBe(0);
      // All no-shows => 100%
      expect(calculateNoShowRate(5, 0)).toBe(100.0);
    });

    it('calculates repeat rate properly and handles empty periods', () => {
      expect(calculateRepeatRate(4, 10)).toBe(40.0);
      expect(calculateRepeatRate(0, 0)).toBe(0);
    });

    it('calculates percentage period deltas including zero-boundary edge cases', () => {
      expect(calculatePeriodDelta(120, 100)).toBe(20.0);
      expect(calculatePeriodDelta(80, 100)).toBe(-20.0);
      expect(calculatePeriodDelta(50, 0)).toBe(100);
      expect(calculatePeriodDelta(0, 0)).toBe(0);
    });
  });

  describe('Report Endpoints Integration & Security', () => {
    beforeEach(() => {
      vi.restoreAllMocks();

      vi.spyOn(Barber, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          { id: 'barb-1', name: 'Alex Vance', role: 'Master Barber', isActive: true },
          { id: 'barb-2', name: 'Marcus Bell', role: 'Stylist', isActive: true },
        ]),
      });

      vi.spyOn(Service, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          { id: 'srv-1', name: 'Signature Haircut', category: 'Hair', price: 650, durationMinutes: 30 },
          { id: 'srv-2', name: 'Beard Grooming', category: 'Beard', price: 400, durationMinutes: 20 },
        ]),
      });

      vi.spyOn(Customer, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });

      vi.spyOn(Payment, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });
    });

    it('GET /api/admin/reports/summary returns accurate aggregations and deltas', async () => {
      const mockCurrent = [
        { date: '2026-11-01', status: 'completed', priceAtBooking: 650, phone: '9876543210' },
        { date: '2026-11-02', status: 'completed', priceAtBooking: 400, phone: '9876543210' },
        { date: '2026-11-03', status: 'no_show', priceAtBooking: 650, phone: '9876543211' },
      ];

      const mockPrev = [
        { date: '2026-10-29', status: 'completed', priceAtBooking: 650, phone: '9876543210' },
      ];

      vi.spyOn(Booking, 'find').mockImplementation((query) => {
        const isCurrent = query?.date?.$gte === '2026-11-01';
        return {
          lean: vi.fn().mockResolvedValue(isCurrent ? mockCurrent : mockPrev),
        };
      });

      const res = await request(app)
        .get('/api/admin/reports/summary?from=2026-11-01&to=2026-11-03')
        .set('Cookie', [ownerAuthCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data.totalBookings).toBe(3);
      expect(data.completedBookings).toBe(2);
      expect(data.revenue).toBe(1050); // 650 + 400
      expect(data.noShows).toBe(1);
      expect(data.noShowRate).toBe(33.3); // 1 / (2 + 1)
      expect(data.uniqueCustomers).toBe(2);
      expect(data.repeatRate).toBe(50.0); // 1 out of 2 has 2 bookings
      expect(data).toHaveProperty('deltas');
      expect(data).toHaveProperty('insights');
    });

    it('GET /api/admin/reports/summary returns valid CSV with UTF-8 BOM when format=csv', async () => {
      vi.spyOn(Booking, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          { date: '2026-11-01', status: 'completed', priceAtBooking: 650, phone: '9876543210' },
        ]),
      });

      const res = await request(app)
        .get('/api/admin/reports/summary?from=2026-11-01&to=2026-11-02&format=csv')
        .set('Cookie', [ownerAuthCookie]);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename=');

      // Check for Excel UTF-8 BOM \uFEFF
      expect(res.text.charCodeAt(0)).toBe(0xfeff);
      expect(res.text).toContain('"Metric"');
      expect(res.text).toContain('"Gross Revenue (INR)"');
    });

    it('enforces role restriction: barber token restricts data scope to own appointments', async () => {
      let capturedFilter = null;
      vi.spyOn(Booking, 'find').mockImplementation((filter) => {
        capturedFilter = filter;
        return {
          lean: vi.fn().mockResolvedValue([]),
        };
      });

      const res = await request(app)
        .get('/api/admin/reports/summary?from=2026-11-01&to=2026-11-02&barberId=other-barber')
        .set('Cookie', [barberAuthCookie]);

      expect(res.status).toBe(200);
      // Barber role must be locked to barb-1 regardless of requested query param
      expect(capturedFilter.barberId).toBe('barb-1');
    });

    it('rejects invalid date range exceeding 366 days', async () => {
      const res = await request(app)
        .get('/api/admin/reports/summary?from=2024-01-01&to=2026-01-01')
        .set('Cookie', [ownerAuthCookie]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

