import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import {
  calculateDepositRequired,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
  checkRefundEligibility,
} from './payment.js';

describe('Payment Pure Utils', () => {
  describe('calculateDepositRequired', () => {
    it('returns not required when paymentsEnabled is false', () => {
      const res = calculateDepositRequired({
        service: { price: 500 },
        priceAtBooking: 500,
        settings: { paymentSettings: { paymentsEnabled: false, paymentMode: 'deposit' } },
      });
      expect(res.required).toBe(false);
      expect(res.amount).toBe(0);
      expect(res.balanceDue).toBe(500);
      expect(res.purpose).toBe('none');
    });

    it('returns not required when service overrides with requiresDeposit = "no"', () => {
      const res = calculateDepositRequired({
        service: { price: 800, requiresDeposit: 'no' },
        priceAtBooking: 800,
        settings: {
          paymentSettings: {
            paymentsEnabled: true,
            paymentMode: 'deposit',
            depositType: 'percent',
            depositValue: 25,
          },
        },
      });
      expect(res.required).toBe(false);
      expect(res.balanceDue).toBe(800);
      expect(res.reason).toBe('service_override_no');
    });

    it('returns not required when priceAtBooking is below minimumServicePrice', () => {
      const res = calculateDepositRequired({
        service: { price: 300, requiresDeposit: 'inherit' },
        priceAtBooking: 300,
        settings: {
          paymentSettings: {
            paymentsEnabled: true,
            paymentMode: 'deposit',
            minimumServicePrice: 500,
          },
        },
      });
      expect(res.required).toBe(false);
      expect(res.reason).toBe('below_minimum_price');
    });

    it('calculates percentage deposit correctly and rounds accurately', () => {
      const res = calculateDepositRequired({
        service: { price: 650 },
        priceAtBooking: 650,
        settings: {
          paymentSettings: {
            paymentsEnabled: true,
            paymentMode: 'deposit',
            depositType: 'percent',
            depositValue: 20, // 20% of 650 = 130
          },
        },
      });
      expect(res.required).toBe(true);
      expect(res.amount).toBe(130);
      expect(res.balanceDue).toBe(520);
      expect(res.amountPaise).toBe(13000);
      expect(res.balanceDuePaise).toBe(52000);
      expect(res.purpose).toBe('deposit');
    });

    it('calculates flat deposit correctly and caps at priceAtBooking', () => {
      const res = calculateDepositRequired({
        service: { price: 400 },
        priceAtBooking: 400,
        settings: {
          paymentSettings: {
            paymentsEnabled: true,
            paymentMode: 'deposit',
            depositType: 'flat',
            depositValue: 200,
          },
        },
      });
      expect(res.required).toBe(true);
      expect(res.amount).toBe(200);
      expect(res.balanceDue).toBe(200);

      // Flat deposit higher than service price caps at price
      const capped = calculateDepositRequired({
        service: { price: 150 },
        priceAtBooking: 150,
        settings: {
          paymentSettings: {
            paymentsEnabled: true,
            paymentMode: 'deposit',
            depositType: 'flat',
            depositValue: 200,
          },
        },
      });
      expect(capped.amount).toBe(150);
      expect(capped.balanceDue).toBe(0);
      expect(capped.purpose).toBe('full');
    });

    it('requires full payment when paymentMode is "full"', () => {
      const res = calculateDepositRequired({
        service: { price: 1000 },
        priceAtBooking: 850, // after discount
        settings: {
          paymentSettings: {
            paymentsEnabled: true,
            paymentMode: 'full',
          },
        },
      });
      expect(res.required).toBe(true);
      expect(res.amount).toBe(850);
      expect(res.balanceDue).toBe(0);
      expect(res.amountPaise).toBe(85000);
      expect(res.purpose).toBe('full');
    });
  });

  describe('verifyRazorpayPaymentSignature', () => {
    const secret = 'secret_test_key_12345';
    const orderId = 'order_DA78491823';
    const paymentId = 'pay_983712391';

    it('successfully verifies valid HMAC SHA256 signature', () => {
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
        secret,
      });
      expect(isValid).toBe(true);
    });

    it('rejects tampered or mismatched signature', () => {
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const tamperedSignature =
        validSignature.slice(0, -2) + (validSignature.endsWith('a') ? 'b' : 'a');

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: tamperedSignature,
        secret,
      });
      expect(isValid).toBe(false);
    });

    it('rejects verification with wrong secret', () => {
      const validSignature = crypto
        .createHmac('sha256', 'different_secret')
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
        secret,
      });
      expect(isValid).toBe(false);
    });

    it('returns false safely on missing params', () => {
      expect(verifyRazorpayPaymentSignature({})).toBe(false);
      expect(verifyRazorpayPaymentSignature({ orderId, paymentId })).toBe(false);
    });
  });

  describe('verifyRazorpayWebhookSignature', () => {
    const webhookSecret = 'whsec_testing_445566';
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_123', amount: 50000 } } },
    });

    it('verifies valid webhook signature with Buffer or string raw body', () => {
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawPayload)
        .digest('hex');

      const verifiedFromString = verifyRazorpayWebhookSignature({
        rawBody: rawPayload,
        signature,
        secret: webhookSecret,
      });
      expect(verifiedFromString).toBe(true);

      const verifiedFromBuffer = verifyRazorpayWebhookSignature({
        rawBody: Buffer.from(rawPayload, 'utf8'),
        signature,
        secret: webhookSecret,
      });
      expect(verifiedFromBuffer).toBe(true);
    });

    it('rejects invalid webhook signature', () => {
      const isValid = verifyRazorpayWebhookSignature({
        rawBody: rawPayload,
        signature: 'invalid_hex_signature_abcdef',
        secret: webhookSecret,
      });
      expect(isValid).toBe(false);
    });
  });

  describe('checkRefundEligibility', () => {
    it('grants full refund when cancelled well before refund policy window', () => {
      // Appointment at 14:00 (2:00 PM) on 2026-11-10 in Asia/Kolkata
      // 14:00 IST is 08:30 UTC
      const appointmentDate = '2026-11-10';
      const appointmentTime = '02:00 PM';
      const booking = {
        date: appointmentDate,
        startTime: appointmentTime,
        amountPaid: 250,
      };
      const settings = {
        paymentSettings: { refundPolicyHours: 2 },
      };

      // Current time is 5 hours before appointment (09:00 AM IST)
      // 09:00 IST is 03:30 UTC
      const customNow = new Date('2026-11-10T03:30:00.000Z');

      const result = checkRefundEligibility({ booking, settings, customNow });
      expect(result.eligible).toBe(true);
      expect(result.refundAmount).toBe(250);
      expect(result.hoursBeforeAppointment).toBeGreaterThanOrEqual(4.9);
    });

    it('denies auto refund when cancelled within the refundPolicyHours window', () => {
      const booking = {
        date: '2026-11-10',
        startTime: '02:00 PM', // 08:30 UTC
        amountPaid: 300,
      };
      const settings = {
        paymentSettings: { refundPolicyHours: 2 },
      };

      // 1 hour before appointment (13:00 IST -> 07:30 UTC)
      const customNow = new Date('2026-11-10T07:30:00.000Z');

      const result = checkRefundEligibility({ booking, settings, customNow });
      expect(result.eligible).toBe(false);
      expect(result.refundAmount).toBe(0);
      expect(result.hoursBeforeAppointment).toBeCloseTo(1.0, 1);
    });
  });
});

