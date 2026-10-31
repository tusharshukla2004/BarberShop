import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { Booking } from '../src/models/Booking.js';
import { Payment } from '../src/models/Payment.js';
import { Service } from '../src/models/Service.js';
import { Barber } from '../src/models/Barber.js';
import { Settings } from '../src/models/Settings.js';
import { Customer } from '../src/models/Customer.js';

describe('Payment & Deposit Integration Suite', () => {
  const ownerToken = jwt.sign(
    { id: 'admin-1', role: 'owner', email: 'owner@barbershop.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const ownerCookie = `${env.COOKIE_NAME}=${ownerToken}`;

  const mockService = {
    id: 'srv-1',
    _id: '507f191e810c19729de860ea',
    name: 'Executive Haircut & Styling',
    price: 1000,
    durationMinutes: 45,
    requiresDeposit: 'inherit',
    isActive: true,
  };

  const mockBarber = {
    id: 'barb-1',
    _id: '507f191e810c19729de860eb',
    name: 'Vikram Singh',
    isActive: true,
  };

  const mockSettings = {
    paymentSettings: {
      paymentsEnabled: true,
      paymentMode: 'deposit',
      depositType: 'percent',
      depositValue: 20, // 20% of 1000 = 200
      minimumServicePrice: 300,
      refundPolicyHours: 2,
      holdTimeoutMinutes: 10,
    },
    holidays: [],
    slotLengthMinutes: 30,
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(Service, 'findById').mockResolvedValue(mockService);
    vi.spyOn(Service, 'findOne').mockResolvedValue(mockService);

    vi.spyOn(Barber, 'findById').mockResolvedValue(mockBarber);
    vi.spyOn(Barber, 'findOne').mockResolvedValue(mockBarber);

    vi.spyOn(Settings, 'findOne').mockResolvedValue(mockSettings);
    vi.spyOn(Customer, 'findOne').mockResolvedValue(null);
    vi.spyOn(Customer, 'create').mockResolvedValue({ _id: '507f191e810c19729de860ec' });
    vi.spyOn(Booking, 'updateMany').mockResolvedValue({ modifiedCount: 0 });
    vi.spyOn(Booking, 'findOne').mockResolvedValue(null);
  });

  describe('POST /api/payments/create-order (Slot Hold & Order Creation)', () => {
    it('creates a pending_payment booking with hold expiry and Razorpay order', async () => {
      vi.spyOn(Booking, 'findOne').mockResolvedValue(null);
      vi.spyOn(Booking, 'updateMany').mockResolvedValue({ modifiedCount: 0 });

      const mockCreatedBooking = {
        _id: '507f191e810c19729de860ed',
        id: '507f191e810c19729de860ed',
        customerName: 'Rahul Verma',
        phone: '9876543210',
        date: '2026-11-15',
        startTime: '11:00 AM',
        priceAtBooking: 1000,
        amountPaid: 0,
        balanceDue: 800,
        status: 'pending_payment',
        paymentStatus: 'pending',
        toJSON: function () {
          return this;
        },
      };
      vi.spyOn(Booking, 'create').mockResolvedValue(mockCreatedBooking);

      const mockPayment = {
        _id: '507f191e810c19729de860ee',
        id: '507f191e810c19729de860ee',
      };
      vi.spyOn(Payment, 'create').mockResolvedValue(mockPayment);

      const res = await request(app)
        .post('/api/payments/create-order')
        .send({
          customerName: 'Rahul Verma',
          phone: '9876543210',
          serviceId: 'srv-1',
          barberId: 'barb-1',
          date: '2026-11-15',
          startTime: '11:00 AM',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentRequired).toBe(true);
      expect(res.body.data.breakdown.depositAmount).toBe(200);
      expect(res.body.data.breakdown.balanceDue).toBe(800);
      expect(res.body.data.order).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('expiresAt');
    });

    it('rejects booking when slot has an active confirmed booking or active hold', async () => {
      // Mock existing conflict
      vi.spyOn(Booking, 'updateMany').mockResolvedValue({ modifiedCount: 0 });
      vi.spyOn(Booking, 'findOne').mockResolvedValue({
        id: 'existing-b1',
        status: 'pending_payment',
        expiresAt: new Date(Date.now() + 500000), // active hold
      });

      const res = await request(app)
        .post('/api/payments/create-order')
        .send({
          customerName: 'Aman Sharma',
          phone: '9876543210',
          serviceId: 'srv-1',
          barberId: 'barb-1',
          date: '2026-11-15',
          startTime: '11:00 AM',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SLOT_CONFLICT');
    });

    it('returns paymentRequired: false when payments are disabled in settings', async () => {
      vi.spyOn(Settings, 'findOne').mockResolvedValue({
        paymentSettings: {
          paymentsEnabled: false,
        },
      });

      const res = await request(app)
        .post('/api/payments/create-order')
        .send({
          customerName: 'Rajesh Kumar',
          phone: '9876543210',
          serviceId: 'srv-1',
          barberId: 'barb-1',
          date: '2026-11-15',
          startTime: '11:00 AM',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentRequired).toBe(false);
    });
  });

  describe('POST /api/payments/verify (HMAC Signature Verification & Confirmation)', () => {
    const bookingId = '507f191e810c19729de860ed';
    const razorpayOrderId = 'order_mock_123456';
    const razorpayPaymentId = 'pay_mock_789012';

    it('successfully confirms booking when signature matches HMAC SHA256', async () => {
      const validSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      const mockPayment = {
        _id: '507f191e810c19729de860ee',
        bookingId,
        razorpayOrderId,
        amount: 20000, // ₹200
        status: 'created',
        save: vi.fn().mockResolvedValue(true),
        toJSON: function () {
          return this;
        },
      };
      vi.spyOn(Payment, 'findOne').mockResolvedValue(mockPayment);

      const mockBooking = {
        _id: bookingId,
        priceAtBooking: 1000,
        status: 'pending_payment',
        paymentStatus: 'pending',
        save: vi.fn().mockResolvedValue(true),
        toJSON: function () {
          return this;
        },
      };
      vi.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      const res = await request(app)
        .post('/api/payments/verify')
        .send({
          bookingId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPayment.status).toBe('captured');
      expect(mockBooking.status).toBe('confirmed');
      expect(mockBooking.paymentStatus).toBe('paid');
      expect(mockBooking.amountPaid).toBe(200);
      expect(mockBooking.balanceDue).toBe(800);
      expect(mockBooking.expiresAt).toBeNull();
    });

    it('rejects tampered signature and records payment failure', async () => {
      const tamperedSignature = 'tampered_signature_hex_1234567890abcdef';
      vi.spyOn(Payment, 'updateOne').mockResolvedValue({ modifiedCount: 1 });

      const res = await request(app)
        .post('/api/payments/verify')
        .send({
          bookingId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: tamperedSignature,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_SIGNATURE');
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('verifies signature and handles payment.captured event idempotently', async () => {
      const rawPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_hook_999',
              order_id: 'order_hook_888',
              amount: 20000,
              method: 'upi',
            },
          },
        },
      });

      const signature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawPayload)
        .digest('hex');

      const mockPayment = {
        _id: '507f191e810c19729de860ee',
        bookingId: '507f191e810c19729de860ed',
        razorpayOrderId: 'order_hook_888',
        rawEvents: [],
        save: vi.fn().mockResolvedValue(true),
      };
      vi.spyOn(Payment, 'findOne').mockResolvedValue(mockPayment);

      const mockBooking = {
        _id: '507f191e810c19729de860ed',
        priceAtBooking: 1000,
        status: 'pending_payment',
        save: vi.fn().mockResolvedValue(true),
      };
      vi.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', signature)
        .set('Content-Type', 'application/json')
        .send(rawPayload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
      expect(mockPayment.status).toBe('captured');
      expect(mockBooking.status).toBe('confirmed');
    });

    it('rejects webhook with invalid signature', async () => {
      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'invalid_signature_hex')
        .send({ event: 'payment.captured' });

      expect(res.status).toBe(400);
    });
  });

  describe('Refund Policy & Admin Management', () => {
    it('allows refund when cancellation is outside refund policy window', async () => {
      // Appointment on 2026-11-20 at 03:00 PM (well in the future)
      const mockBooking = {
        id: 'b-refund-1',
        _id: '507f191e810c19729de860ed',
        date: '2026-11-20',
        startTime: '03:00 PM',
        amountPaid: 200,
        priceAtBooking: 1000,
        save: vi.fn().mockResolvedValue(true),
        toJSON: function () {
          return this;
        },
      };
      vi.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      const mockPayment = {
        _id: '507f191e810c19729de860ee',
        bookingId: mockBooking._id,
        razorpayPaymentId: 'pay_test_refund',
        amount: 20000,
        refundedAmount: 0,
        status: 'captured',
        save: vi.fn().mockResolvedValue(true),
        toJSON: function () {
          return this;
        },
      };
      vi.spyOn(Payment, 'findById').mockResolvedValue(mockPayment);

      const res = await request(app)
        .post(`/api/admin/payments/${mockPayment._id}/refund`)
        .set('Cookie', [ownerCookie])
        .send({
          amountPaise: 20000,
          reason: 'Customer cancelled early',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPayment.status).toBe('refunded');
      expect(mockBooking.paymentStatus).toBe('refunded');
      expect(mockBooking.amountPaid).toBe(0);
    });

    it('denies auto refund when within policy cancellation window without bypass', async () => {
      // Past appointment date violates cancellation window
      const mockBooking = {
        id: 'b-refund-2',
        _id: '507f191e810c19729de860ed',
        date: '2025-01-01',
        startTime: '10:00 AM',
        amountPaid: 200,
        priceAtBooking: 1000,
      };
      vi.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      const mockPayment = {
        _id: '507f191e810c19729de860ee',
        bookingId: mockBooking._id,
        status: 'captured',
        amount: 20000,
      };
      vi.spyOn(Payment, 'findById').mockResolvedValue(mockPayment);

      const res = await request(app)
        .post(`/api/admin/payments/${mockPayment._id}/refund`)
        .set('Cookie', [ownerCookie])
        .send({
          amountPaise: 20000,
          reason: 'Late cancellation',
          bypassPolicy: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('REFUND_POLICY_EXPIRED');
    });

    it('allows admin to bypass policy window with explicit audit flag', async () => {
      const mockBooking = {
        id: 'b-refund-3',
        _id: '507f191e810c19729de860ed',
        date: '2026-11-01',
        startTime: '10:00 AM',
        amountPaid: 200,
        priceAtBooking: 1000,
        save: vi.fn().mockResolvedValue(true),
        toJSON: function () {
          return this;
        },
      };
      vi.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      const mockPayment = {
        _id: '507f191e810c19729de860ee',
        bookingId: mockBooking._id,
        status: 'captured',
        amount: 20000,
        refundedAmount: 0,
        save: vi.fn().mockResolvedValue(true),
        toJSON: function () {
          return this;
        },
      };
      vi.spyOn(Payment, 'findById').mockResolvedValue(mockPayment);

      const res = await request(app)
        .post(`/api/admin/payments/${mockPayment._id}/refund`)
        .set('Cookie', [ownerCookie])
        .send({
          amountPaise: 20000,
          reason: 'Owner exceptional goodwill refund',
          bypassPolicy: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPayment.status).toBe('refunded');
    });

    it('PATCH /api/admin/bookings/:id/mark-paid clears balance at studio', async () => {
      const mockBooking = {
        id: 'b-studio-1',
        _id: '507f191e810c19729de860ed',
        priceAtBooking: 1000,
        amountPaid: 200,
        balanceDue: 800,
        paymentStatus: 'paid',
        save: vi.fn().mockResolvedValue(true),
        toJSON: function () {
          return this;
        },
      };
      vi.spyOn(Booking, 'findById').mockResolvedValue(mockBooking);

      const res = await request(app)
        .patch(`/api/admin/bookings/${mockBooking._id}/mark-paid`)
        .set('Cookie', [ownerCookie])
        .send();

      expect(res.status).toBe(200);
      expect(mockBooking.amountPaid).toBe(1000);
      expect(mockBooking.balanceDue).toBe(0);
      expect(mockBooking.paymentStatus).toBe('paid');
    });
  });
});
