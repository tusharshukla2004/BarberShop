import { http, HttpResponse, delay } from 'msw';

/**
 * Mock Service Worker request handlers
 */
export const handlers = [
  // Quick Appointment Request Endpoint
  http.post('/api/bookings/request', async ({ request }) => {
    const body = await request.json();
    await delay(500);

    // Basic server-side guard simulation
    if (!body.name || !body.phone || !body.dateTime) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Name, phone, and preferred appointment time are required.',
        },
        { status: 400 }
      );
    }

    const bookingId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    return HttpResponse.json(
      {
        success: true,
        bookingId,
        message:
          'Your appointment request has been received. Our concierge will confirm your slot.',
        draft: body,
      },
      { status: 201 }
    );
  }),
];

export default handlers;
