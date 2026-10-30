import { http, HttpResponse, delay } from 'msw';
import { mockGalleryItems, mockServices, mockTestimonials, mockBarbers } from './data';

/**
 * Mock Service Worker request handlers
 */
export const handlers = [
  // Quick Appointment Request Endpoint
  http.post('/api/bookings/request', async ({ request }) => {
    const body = await request.json();
    await delay(500);

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

  // Gallery Items Endpoint
  http.get('/api/gallery', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockGalleryItems,
    });
  }),

  // Services Menu Endpoint
  http.get('/api/services', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockServices,
    });
  }),

  // Reviews & Testimonials Endpoint
  http.get('/api/reviews', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockTestimonials,
    });
  }),

  // Barbers Team Endpoint
  http.get('/api/barbers', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockBarbers,
    });
  }),
];

export default handlers;
