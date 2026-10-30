// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';
import { store } from '@/app/store';
import { bookingApi } from './bookingApi';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  store.dispatch(bookingApi.util.resetApiState());
});
afterAll(() => server.close());

describe('bookingApi RTK Query endpoints with MSW', () => {
  it('fetches deterministic slots for a given date and barber', async () => {
    const result = await store.dispatch(
      bookingApi.endpoints.getSlots.initiate({
        date: '2026-11-01',
        barberId: 'barb-1',
      })
    );

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);

    // 10:00 AM on 2026-11-01 for barb-1 is in mockBookings, so it should be marked unavailable
    const bookedSlot = result.data.find((s) => s.startTime === '10:00 AM');
    expect(bookedSlot).toBeDefined();
    expect(bookedSlot.isAvailable).toBe(false);

    // Other slots should be available
    const availableSlot = result.data.find((s) => s.startTime === '09:00 AM');
    expect(availableSlot).toBeDefined();
    expect(availableSlot.isAvailable).toBe(true);
  });

  it('handles double booking by returning 409 conflict', async () => {
    // Attempt to book the already booked slot: 2026-11-01 at 10:00 AM with barb-1
    const conflictResult = await store.dispatch(
      bookingApi.endpoints.createBooking.initiate({
        customerName: 'Conflict User',
        phone: '9876543210',
        barberId: 'barb-1',
        serviceId: 'srv-1',
        date: '2026-11-01',
        startTime: '10:00 AM',
      })
    );

    expect(conflictResult.error).toBeDefined();
    expect(conflictResult.error.status).toBe(409);
    expect(conflictResult.error.message).toMatch(/already booked/i);
  });

  it('successfully creates a valid non-conflicting booking', async () => {
    const successResult = await store.dispatch(
      bookingApi.endpoints.createBooking.initiate({
        customerName: 'New Client',
        phone: '9876543210',
        barberId: 'barb-1',
        serviceId: 'srv-1',
        date: '2026-11-01',
        startTime: '03:00 PM',
      })
    );

    expect(successResult.data).toBeDefined();
    expect(successResult.data.id).toMatch(/^bk-/);
    expect(successResult.data.status).toBe('confirmed');
  });
});
