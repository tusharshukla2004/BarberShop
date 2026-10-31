import { http, HttpResponse, delay } from 'msw';
import {
  mockServices,
  mockBarbers,
  mockGalleryItems,
  mockTestimonials,
  mockSettings,
  mockBookings,
} from './data';

// In-memory reactive collections for the MSW dev/test session
const dynamicServices = [...mockServices];
const dynamicBarbers = [...mockBarbers];
const dynamicGallery = [...mockGalleryItems];
const dynamicReviews = [...mockTestimonials];
let dynamicSettings = { ...mockSettings };
const dynamicBookings = [...mockBookings];

let currentUser = {
  id: 'admin-1',
  name: 'Devraj Saxena (Owner)',
  email: 'owner@barbershop.com',
  role: 'owner',
};

/**
 * Standard operating schedule slots generation helper
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

export const handlers = [
  // --- AUTH ENDPOINTS ---
  http.post('*/api/auth/login', async ({ request }) => {
    const body = await request.json();
    await delay(50);

    const email = body.email?.toLowerCase();
    const isBarber = email?.includes('barber');

    currentUser = {
      id: isBarber ? 'barb-2' : 'admin-1',
      name: isBarber ? 'Arbaaz Khan' : 'Devraj Saxena',
      email: body.email,
      role: isBarber ? 'barber' : 'owner',
    };

    return HttpResponse.json({
      success: true,
      data: {
        user: currentUser,
        token: 'mock-jwt-token-xyz',
      },
      message: 'Signed in successfully',
    });
  }),

  http.post('*/api/auth/logout', async () => {
    await delay(50);
    currentUser = null;
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  http.get('*/api/auth/me', async () => {
    await delay(50);
    if (!currentUser) {
      return HttpResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { user: currentUser },
    });
  }),

  // --- PUBLIC ENDPOINTS ---
  http.get('*/api/services', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: dynamicServices,
    });
  }),

  http.get('*/api/barbers', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: dynamicBarbers,
    });
  }),

  http.get('*/api/gallery', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: dynamicGallery,
    });
  }),

  http.get('*/api/reviews', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: dynamicReviews,
    });
  }),

  http.get('*/api/settings', async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: dynamicSettings,
    });
  }),

  // Slots
  http.get('*/api/bookings/slots', async ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '2026-11-01';
    const barberId = url.searchParams.get('barberId') || 'barb-1';
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: generateDeterministicSlots(date, barberId),
    });
  }),
  http.get('*/api/slots', async ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '2026-11-01';
    const barberId = url.searchParams.get('barberId') || 'barb-1';
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: generateDeterministicSlots(date, barberId),
    });
  }),

  // Public Booking Creation
  http.post('*/api/bookings/request', async ({ request }) => {
    const body = await request.json();
    await delay(50);
    const bookingId = `req_${Date.now()}`;
    return HttpResponse.json(
      {
        success: true,
        data: { id: bookingId, ...body, status: 'pending' },
        message: 'Your appointment request has been received.',
      },
      { status: 201 }
    );
  }),

  http.post('*/api/bookings', async ({ request }) => {
    const body = await request.json();
    await delay(50);

    const { customerName, phone, serviceId, barberId, date, startTime, endTime } = body;
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

  // Contact
  http.post('*/api/contact', async ({ request }) => {
    const body = await request.json();
    await delay(50);
    return HttpResponse.json(
      {
        success: true,
        data: { id: `msg_${Date.now()}`, ...body, status: 'unread' },
        message: 'Thank you for reaching out.',
      },
      { status: 201 }
    );
  }),

  // --- ADMIN ENDPOINTS ---
  // Admin Bookings
  http.get('*/api/admin/bookings', async ({ request }) => {
    const url = new URL(request.url);
    const barberId = url.searchParams.get('barberId');
    const status = url.searchParams.get('status');
    const date = url.searchParams.get('date');

    await delay(50);
    let list = [...dynamicBookings];

    if (currentUser?.role === 'barber') {
      list = list.filter((b) => b.barberId === currentUser.id || b.barberId === 'barb-1');
    } else if (barberId) {
      list = list.filter((b) => b.barberId === barberId);
    }

    if (status) list = list.filter((b) => b.status === status);
    if (date) list = list.filter((b) => b.date === date);

    return HttpResponse.json({ success: true, data: list });
  }),

  http.patch('*/api/admin/bookings/:id', async ({ params, request }) => {
    const { id } = params;
    const patch = await request.json();
    await delay(50);
    const booking = dynamicBookings.find((b) => b.id === id);
    if (!booking) {
      return HttpResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }
    Object.assign(booking, patch);
    return HttpResponse.json({ success: true, data: booking });
  }),

  http.patch('*/api/admin/bookings/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = await request.json();
    await delay(50);
    const booking = dynamicBookings.find((b) => b.id === id);
    if (!booking) {
      return HttpResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }
    booking.status = status;
    return HttpResponse.json({ success: true, data: booking });
  }),

  http.delete('*/api/admin/bookings/:id', async ({ params }) => {
    const { id } = params;
    await delay(50);
    const booking = dynamicBookings.find((b) => b.id === id);
    if (booking) booking.status = 'cancelled';
    return HttpResponse.json({ success: true, data: booking });
  }),

  // Admin Services
  http.post('*/api/admin/services', async ({ request }) => {
    const body = await request.json();
    await delay(50);
    const newService = { id: `srv-${Date.now()}`, isActive: true, ...body };
    dynamicServices.push(newService);
    return HttpResponse.json({ success: true, data: newService }, { status: 201 });
  }),

  http.put('*/api/admin/services/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    await delay(50);
    const idx = dynamicServices.findIndex((s) => s.id === id);
    if (idx !== -1) {
      dynamicServices[idx] = { ...dynamicServices[idx], ...body };
      return HttpResponse.json({ success: true, data: dynamicServices[idx] });
    }
    return HttpResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
  }),

  http.delete('*/api/admin/services/:id', async ({ params }) => {
    const { id } = params;
    await delay(50);
    const idx = dynamicServices.findIndex((s) => s.id === id);
    if (idx !== -1) dynamicServices.splice(idx, 1);
    return HttpResponse.json({ success: true, message: 'Deleted' });
  }),

  // Admin Barbers
  http.post('*/api/admin/barbers', async ({ request }) => {
    const body = await request.json();
    await delay(50);
    const newBarber = { id: `barb-${Date.now()}`, isActive: true, ...body };
    dynamicBarbers.push(newBarber);
    return HttpResponse.json({ success: true, data: newBarber }, { status: 201 });
  }),

  http.put('*/api/admin/barbers/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    await delay(50);
    const idx = dynamicBarbers.findIndex((b) => b.id === id);
    if (idx !== -1) {
      dynamicBarbers[idx] = { ...dynamicBarbers[idx], ...body };
      return HttpResponse.json({ success: true, data: dynamicBarbers[idx] });
    }
    return HttpResponse.json({ success: false, error: 'Barber not found' }, { status: 404 });
  }),

  http.delete('*/api/admin/barbers/:id', async ({ params }) => {
    const { id } = params;
    await delay(50);
    const idx = dynamicBarbers.findIndex((b) => b.id === id);
    if (idx !== -1) dynamicBarbers.splice(idx, 1);
    return HttpResponse.json({ success: true, message: 'Deleted' });
  }),

  // Admin Gallery
  http.post('*/api/admin/gallery', async ({ request }) => {
    const body = await request.json();
    await delay(50);
    const newItem = { id: `gal-${Date.now()}`, ...body };
    dynamicGallery.push(newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),

  http.put('*/api/admin/gallery/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    await delay(50);
    const idx = dynamicGallery.findIndex((g) => g.id === id);
    if (idx !== -1) {
      dynamicGallery[idx] = { ...dynamicGallery[idx], ...body };
      return HttpResponse.json({ success: true, data: dynamicGallery[idx] });
    }
    return HttpResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
  }),

  http.delete('*/api/admin/gallery/:id', async ({ params }) => {
    const { id } = params;
    await delay(50);
    const idx = dynamicGallery.findIndex((g) => g.id === id);
    if (idx !== -1) dynamicGallery.splice(idx, 1);
    return HttpResponse.json({ success: true, message: 'Deleted' });
  }),

  // Admin Reviews
  http.put('*/api/admin/reviews/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    await delay(50);
    const idx = dynamicReviews.findIndex((r) => r.id === id);
    if (idx !== -1) {
      dynamicReviews[idx] = { ...dynamicReviews[idx], ...body };
      return HttpResponse.json({ success: true, data: dynamicReviews[idx] });
    }
    return HttpResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
  }),

  http.delete('*/api/admin/reviews/:id', async ({ params }) => {
    const { id } = params;
    await delay(50);
    const idx = dynamicReviews.findIndex((r) => r.id === id);
    if (idx !== -1) dynamicReviews.splice(idx, 1);
    return HttpResponse.json({ success: true, message: 'Deleted' });
  }),

  // Admin Settings
  http.get('*/api/admin/settings', async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: dynamicSettings });
  }),

  http.put('*/api/admin/settings', async ({ request }) => {
    const body = await request.json();
    await delay(50);
    dynamicSettings = { ...dynamicSettings, ...body };
    return HttpResponse.json({ success: true, data: dynamicSettings });
  }),

  // Admin Reminders
  http.get('*/api/admin/reminders', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const _day = url.searchParams.get('day') || 'today';

    const reminders = dynamicBookings
      .filter((b) => b.status === 'confirmed')
      .map((b) => ({
        ...b,
        serviceName: dynamicServices.find((s) => s.id === b.serviceId)?.name || 'Custom Grooming',
        barberName: dynamicBarbers.find((bar) => bar.id === b.barberId)?.name || 'Master Barber',
      }));

    reminders.sort((a, b) => {
      const aSent = Boolean(a.reminderSentAt);
      const bSent = Boolean(b.reminderSentAt);
      if (aSent !== bSent) return aSent ? 1 : -1;
      return a.startTime.localeCompare(b.startTime);
    });

    return HttpResponse.json({ success: true, data: reminders });
  }),

  // Admin Booking Notifications
  http.patch('*/api/admin/bookings/:id/notifications', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const { type, channel = 'whatsapp_link' } = body;
    await delay(50);

    const booking = dynamicBookings.find((b) => b.id === id);
    if (!booking) {
      return HttpResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    if (type === 'confirmation') booking.confirmationSentAt = now;
    if (type === 'reminder') booking.reminderSentAt = now;
    if (type === 'review_request') booking.reviewRequestSentAt = now;

    if (!Array.isArray(booking.notifications)) {
      booking.notifications = [];
    }

    booking.notifications.push({
      type,
      channel,
      sentAt: now,
      by: currentUser.name || 'Owner',
    });

    return HttpResponse.json({ success: true, data: booking });
  }),
];

export default handlers;
