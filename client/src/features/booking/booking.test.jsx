import { describe, it, expect, beforeEach } from 'vitest';
import { appointmentRequestSchema } from './schema';
import bookingDraftReducer, { saveBookingDraft, clearBookingDraft } from './bookingDraftSlice';

describe('Booking Feature', () => {
  describe('appointmentRequestSchema validation', () => {
    it('validates a valid appointment request with 10-digit Indian number', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const validData = {
        name: 'Arjun Verma',
        phone: '9876543210',
        email: 'arjun@example.com',
        dateTime: tomorrow,
      };

      const result = appointmentRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid phone number', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const invalidData = {
        name: 'Arjun Verma',
        phone: '12345',
        dateTime: tomorrow,
      };

      const result = appointmentRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/valid 10-digit Indian mobile number/i);
      }
    });

    it('rejects a date in the past', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const invalidData = {
        name: 'Arjun Verma',
        phone: '9876543210',
        dateTime: pastDate,
      };

      const result = appointmentRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/cannot be in the past/i);
      }
    });
  });

  describe('bookingDraftSlice', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('saves draft data to state and sessionStorage', () => {
      const initial = {
        name: '',
        phone: '',
        email: '',
        dateTime: '',
        serviceId: '',
        barberId: '',
      };

      const updated = bookingDraftReducer(
        initial,
        saveBookingDraft({ name: 'Rohan Sharma', phone: '9876543210' })
      );

      expect(updated.name).toBe('Rohan Sharma');
      expect(updated.phone).toBe('9876543210');
      expect(sessionStorage.getItem('barbershop_booking_draft')).toContain('Rohan Sharma');
    });

    it('clears draft and removes from sessionStorage', () => {
      sessionStorage.setItem('barbershop_booking_draft', JSON.stringify({ name: 'Temp' }));

      const stateWithDraft = {
        name: 'Temp',
        phone: '9876543210',
        email: '',
        dateTime: '',
        serviceId: '',
        barberId: '',
      };

      const cleared = bookingDraftReducer(stateWithDraft, clearBookingDraft());
      expect(cleared.name).toBe('');
      expect(sessionStorage.getItem('barbershop_booking_draft')).toBeNull();
    });
  });
});
