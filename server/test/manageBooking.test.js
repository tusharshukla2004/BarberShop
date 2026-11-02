import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { app } from '../src/app.js';
import { Booking } from '../src/models/Booking.js';
import { Service } from '../src/models/Service.js';
import { Barber } from '../src/models/Barber.js';
import { Settings } from '../src/models/Settings.js';

describe('Customer Self-Service Manage Booking Link', () => {
  const rawToken = 'sample_32_bytes_random_token_base64url_xyz';
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const refCode = 'MM-XYZ123';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/bookings/manage', () => {
    it('returns masked customer phone, service, barber, date, time and shop info for valid ref & token', async () => {
      const mockBooking = {
        bookingRef: refCode,
        customerName: 'Aarav Patel',
        phone: '919876543210',
        serviceId: 'srv-1',
        barberId: 'barb-1',
        date: '2026-11-20',
        startTime: '10:00 AM',
        endTime: '10:45 AM',
        status: 'confirmed',
        priceAtBooking: 650,
        rescheduleCount: 0,
        manageTokenHash: hashedToken,
        manageTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      vi.spyOn(Booking, 'findOne').mockResolvedValue(mockBooking);
      vi.spyOn(Service, 'findById').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ name: 'Royal Haircut' }),
      });
      vi.spyOn(Barber, 'findById').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ name: 'Vikram Singh' }),
      });
      vi.spyOn(Settings, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          shopName: 'Sovereign Barbershop',
          phone: '+91 98765 00000',
          address: 'Indiranagar 100ft Road',
          policies: { cancellationNoticeHours: 2 },
        }),
      });

      // Guest request without any cookies
      const res = await request(app)
        .get(`/api/bookings/manage?ref=${refCode}&token=${rawToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toBe('Aarav Patel');
      // Phone must be masked
      expect(res.body.data.phone).toBe('91******3210');
      // Email should NOT be returned
      expect(res.body.data.email).toBeUndefined();
      expect(res.body.data.serviceName).toBe('Royal Haircut');
      expect(res.body.data.barberName).toBe('Vikram Singh');
      expect(res.body.data.cancellationPolicyHours).toBe(2);
    });

    it('returns 404 for wrong token', async () => {
      const mockBooking = {
        bookingRef: refCode,
        manageTokenHash: hashedToken,
        manageTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      vi.spyOn(Booking, 'findOne').mockResolvedValue(mockBooking);

      const res = await request(app)
        .get(`/api/bookings/manage?ref=${refCode}&token=wrong_token_value`);

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/Booking not found or link has expired/i);
    });

    it('returns 404 for unknown ref', async () => {
      vi.spyOn(Booking, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/bookings/manage?ref=NONEXISTENT&token=${rawToken}`);

      expect(res.status).toBe(404);
    });

    it('returns 404 for expired manage link', async () => {
      const mockBooking = {
        bookingRef: refCode,
        manageTokenHash: hashedToken,
        // Expired 1 hour ago
        manageTokenExpiresAt: new Date(Date.now() - 60 * 60 * 1000),
      };

      vi.spyOn(Booking, 'findOne').mockResolvedValue(mockBooking);

      const res = await request(app)
        .get(`/api/bookings/manage?ref=${refCode}&token=${rawToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('LINK_EXPIRED');
    });
  });

  describe('POST /api/bookings/manage/cancel', () => {
    it('cancels appointment and records notification in booking document', async () => {
      // Future appointment (more than 2 hours away)
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const dateStr = futureDate.toISOString().split('T')[0];

      const mockBooking = {
        bookingRef: refCode,
        manageTokenHash: hashedToken,
        manageTokenExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        status: 'confirmed',
        date: dateStr,
        startTime: '10:00 AM',
        notifications: [],
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Booking, 'findOne').mockResolvedValue(mockBooking);
      vi.spyOn(Settings, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ policies: { cancellationNoticeHours: 2 } }),
      });

      const res = await request(app)
        .post('/api/bookings/manage/cancel')
        .send({ ref: refCode, token: rawToken, reason: 'Travel plans changed' });

      expect(res.status).toBe(200);
      expect(mockBooking.status).toBe('cancelled');
      expect(mockBooking.notifications.some((n) => n.channel === 'manage_link')).toBe(true);
      expect(mockBooking.notes).toContain('Customer Cancellation Reason: Travel plans changed');
      expect(mockBooking.save).toHaveBeenCalled();
    });

    it('enforces cancellation notice policy (rejects within notice window)', async () => {
      // Appointment in 30 minutes
      const soonDate = new Date(Date.now() + 30 * 60 * 1000);
      const dateStr = soonDate.toISOString().split('T')[0];
      const hours = String(soonDate.getHours()).padStart(2, '0');
      const mins = String(soonDate.getMinutes()).padStart(2, '0');

      const mockBooking = {
        bookingRef: refCode,
        manageTokenHash: hashedToken,
        manageTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'confirmed',
        date: dateStr,
        startTime: `${hours}:${mins}`,
      };

      vi.spyOn(Booking, 'findOne').mockResolvedValue(mockBooking);
      vi.spyOn(Settings, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ policies: { cancellationNoticeHours: 2 } }),
      });

      const res = await request(app)
        .post('/api/bookings/manage/cancel')
        .send({ ref: refCode, token: rawToken });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CANCELLATION_POLICY_LIMIT');
    });
  });

  describe('POST /api/bookings/manage/reschedule', () => {
    it('enforces maximum 2 reschedules limit', async () => {
      const mockBooking = {
        bookingRef: refCode,
        manageTokenHash: hashedToken,
        manageTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'confirmed',
        rescheduleCount: 2, // Already at maximum!
      };

      vi.spyOn(Booking, 'findOne').mockResolvedValue(mockBooking);

      const res = await request(app)
        .post('/api/bookings/manage/reschedule')
        .send({
          ref: refCode,
          token: rawToken,
          newDate: '2026-11-25',
          newStartTime: '02:00 PM',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('RESCHEDULE_LIMIT_REACHED');
    });

    it('rejects reschedule when desired slot has a conflict', async () => {
      const mockBooking = {
        _id: 'booking-1',
        bookingRef: refCode,
        manageTokenHash: hashedToken,
        manageTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'confirmed',
        rescheduleCount: 0,
        barberId: 'barb-1',
        date: '2026-11-20',
        startTime: '10:00 AM',
      };

      vi.spyOn(Booking, 'findOne')
        .mockResolvedValueOnce(mockBooking) // First lookup by ref
        .mockResolvedValueOnce({ _id: 'other-booking' }); // Slot conflict check returns another booking

      vi.spyOn(Settings, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ policies: { cancellationNoticeHours: 2 } }),
      });

      const res = await request(app)
        .post('/api/bookings/manage/reschedule')
        .send({
          ref: refCode,
          token: rawToken,
          newDate: '2026-11-25',
          newStartTime: '02:00 PM',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('SLOT_CONFLICT');
    });
  });
});
