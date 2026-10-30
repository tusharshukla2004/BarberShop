import { describe, it, expect, beforeEach } from 'vitest';
import { appointmentRequestSchema } from './schema';
import { store } from '@/app/store';
import bookingDraftReducer, {
  saveBookingDraft,
  clearBookingDraft,
  selectIsDraftReady,
  selectDraftSummary,
} from './bookingDraftSlice';

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

  describe('bookingDraftSlice pure reducer & selectors', () => {
    it('updates state via pure reducer', () => {
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
      expect(selectIsDraftReady({ bookingDraft: updated })).toBe(false);
      expect(selectDraftSummary({ bookingDraft: updated }).hasContactInfo).toBe(true);
    });

    it('clears draft state via clearBookingDraft', () => {
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
    });
  });

  describe('bookingDraft listenerMiddleware persistence', () => {
    beforeEach(() => {
      sessionStorage.clear();
      store.dispatch(clearBookingDraft());
    });

    it('persists draft to sessionStorage on store dispatch', () => {
      store.dispatch(
        saveBookingDraft({
          name: 'Vikram Singh',
          phone: '9876543210',
          dateTime: '2026-11-01T10:00',
        })
      );

      const raw = sessionStorage.getItem('barbershop_booking_draft');
      expect(raw).toBeDefined();
      expect(raw).toContain('Vikram Singh');
    });

    it('cleans up sessionStorage on clearBookingDraft dispatch', () => {
      store.dispatch(saveBookingDraft({ name: 'To be removed' }));
      store.dispatch(clearBookingDraft());

      const raw = sessionStorage.getItem('barbershop_booking_draft');
      expect(raw).toBeNull();
    });
  });
});
