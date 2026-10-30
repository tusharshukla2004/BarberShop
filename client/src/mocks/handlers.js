import { http, HttpResponse, delay } from 'msw';
import {
  mockServices,
  mockBarbers,
  mockGalleryItems,
  mockTestimonials,
  mockSettings,
  mockBookings,
} from './data';

// In-memory bookings store for the session
const dynamicBookings = [...mockBookings];

/**
 * Standard operating schedule slots generation helper (9:00 AM to 8:30 PM at 30-min intervals)
 * @param {string} date
 * @param {string} barberId
 * @returns {Array<{ startTime: string, endTime: string, isAvailable: boolean }>}
 */
function generateDeterministicSlots(date, barberId) {
  const timeSlots = [
    { startTime: '09:00 AM', endTime: '09:45 AM' },
    { startTime: '10:00 AM', endTime: '10:45 AM' },
    { startTime: '11:00 AM', endTime: '11:45 AM' },
    { startTime: '11:45 AM', endTime: '12:30 PM' },
    { startTime: '02:00 PM', endTime: '02:45 PM' },
    { startTime: '03:00 PM', endTime: '03:45 PM' },
    { startTime: '04:00 PM', endTime: '04:45 PM' },
    { startTime: '05:00 PM', endTime: '05:45 PM' },
    { startTime: '06:00 PM', endTime: '06:45 PM' },
    { startTime: '07:00 PM', endTime: '07:45 PM' },
  ];

  return timeSlots.map((slot) => {
    // Check if slot conflicts with an active booking
    const isBooked = dynamicBookings.some(
      (b) =>
        b.date === date &&
        b.barberId === barberId &&
        b.startTime === slot.startTime &&
        b.status !== 'cancelled'
    );

    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: !isBooked,
    };
  });
}

/**
 * Mock Service Worker request handlers with wildcard origin support
 */
export const handlers = [
  // 1. Services
  http.get('*/api/services', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: mockServices,
    });
  }),

  // 2. Barbers
  http.get('*/api/barbers', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: mockBarbers,
    });
  }),

  // 3. Gallery
  http.get('*/api/gallery', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: mockGalleryItems,
    });
  }),

  // 4. Reviews / Testimonials
  http.get('*/api/reviews', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: mockTestimonials,
    });
  }),

  // 5. Settings
  http.get('*/api/settings', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: mockSettings,
    });
  }),

  // 6. Slots (Deterministic, respecting bookings)
  http.get('*/api/bookings/slots', async ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '2026-11-01';
    const barberId = url.searchParams.get('barberId') || 'barb-1';

    await delay(50);
    const slots = generateDeterministicSlots(date, barberId);

    return HttpResponse.json({
      success: true,
      data: slots,
    });
  }),

  // 7. Quick Appointment Request
  http.post('*/api/bookings/request', async ({ request }) => {
    const body = await request.json();
    await delay(50);

    if (!body.name || !body.phone || !body.dateTime) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Name, phone number, and appointment date/time are required.',
        },
        { status: 400 }
      );
    }

    const bookingId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    return HttpResponse.json(
      {
        success: true,
        data: {
          id: bookingId,
          ...body,
          status: 'pending',
        },
        message: 'Your appointment request has been received. Our concierge will confirm your slot.',
      },
      { status: 201 }
    );
  }),

  // 8. Full Booking Creation (Enforces 409 Conflict on Double-Booking)
  http.post('*/api/bookings', async ({ request }) => {
    const body = await request.json();
    await delay(50);

    const { customerName, phone, serviceId, barberId, date, startTime, endTime } = body;

    if (!customerName || !phone || !date || !startTime) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Missing required booking fields.',
        },
        { status: 400 }
      );
    }

    // Check conflict
    const isConflict = dynamicBookings.some(
      (b) =>
        b.date === date &&
        b.barberId === barberId &&
        b.startTime === startTime &&
        b.status !== 'cancelled'
    );

    if (isConflict) {
      return HttpResponse.json(
        {
          success: false,
          error: 'This slot is already booked. Please choose an alternate slot or barber.',
        },
        { status: 409 }
      );
    }

    const newBooking = {
      id: `bk-${Date.now()}`,
      customerName,
      phone,
      email: body.email || '',
      serviceId: serviceId || 'srv-1',
      barberId: barberId || 'barb-1',
      date,
      startTime,
      endTime: endTime || startTime,
      status: 'confirmed',
      notes: body.notes || '',
    };

    dynamicBookings.push(newBooking);

    return HttpResponse.json(
      {
        success: true,
        data: newBooking,
        message: 'Booking confirmed successfully!',
      },
      { status: 201 }
    );
  }),

  // 9. Admin: List Bookings
  http.get('*/api/admin/bookings', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: dynamicBookings,
    });
  }),

  // 10. Admin: Update Booking Status
  http.patch('*/api/admin/bookings/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = await request.json();
    await delay(50);

    const booking = dynamicBookings.find((b) => b.id === id);
    if (!booking) {
      return HttpResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    booking.status = status;
    return HttpResponse.json({
      success: true,
      data: booking,
    });
  }),

  // 11. Admin: Cancel Booking
  http.delete('*/api/admin/bookings/:id', async ({ params }) => {
    const { id } = params;
    await delay(50);

    const index = dynamicBookings.findIndex((b) => b.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    dynamicBookings[index].status = 'cancelled';
    return HttpResponse.json({
      success: true,
      data: dynamicBookings[index],
      message: 'Booking cancelled.',
    });
  }),
];

export default handlers;
