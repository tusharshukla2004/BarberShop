import { http, HttpResponse, delay } from 'msw';
import {
  mockServices,
  mockBarbers,
  mockGalleryItems,
  mockTestimonials,
  mockSettings,
  mockBookings,
  mockCustomers,
  mockQueueEntries,
  mockOffers,
  mockFaqs,
  mockPayments,
} from './data';

// In-memory reactive collections for the MSW dev/test session
const dynamicServices = [...mockServices];
const dynamicBarbers = [...mockBarbers];
const dynamicGallery = [...mockGalleryItems];
const dynamicReviews = [...mockTestimonials];
let dynamicSettings = { ...mockSettings };
const dynamicBookings = [...mockBookings];
const dynamicCustomers = [...mockCustomers];
const dynamicQueue = [...mockQueueEntries];
const dynamicOffers = [...mockOffers];
const dynamicFaqs = [...mockFaqs];
const dynamicPayments = [...mockPayments];

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

  // Customers Management
  http.get('*/api/admin/customers', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const isFlagged = url.searchParams.get('isFlagged');
    const tag = url.searchParams.get('tag');

    let filtered = dynamicCustomers.filter((c) => !c.isDeleted);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q)
      );
    }

    if (isFlagged !== null && isFlagged !== undefined) {
      const flagBool = isFlagged === 'true';
      filtered = filtered.filter((c) => Boolean(c.isFlagged) === flagBool);
    }

    if (tag) {
      filtered = filtered.filter((c) => Array.isArray(c.tags) && c.tags.includes(tag));
    }

    return HttpResponse.json({
      success: true,
      data: {
        customers: filtered,
        pagination: {
          total: filtered.length,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      },
    });
  }),

  http.get('*/api/admin/customers/:id', async ({ params }) => {
    const { id } = params;
    await delay(50);

    const customer = dynamicCustomers.find((c) => c.id === id && !c.isDeleted);
    if (!customer) {
      return HttpResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const bookings = dynamicBookings.filter(
      (b) => b.customerId === id || b.phone === customer.phone
    );

    return HttpResponse.json({
      success: true,
      data: {
        customer,
        bookings,
      },
    });
  }),

  http.post('*/api/admin/customers', async ({ request }) => {
    const body = await request.json();
    await delay(50);

    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: body.name,
      phone: body.phone,
      email: body.email || '',
      notes: body.notes || '',
      tags: body.tags || [],
      preferredBarberId: body.preferredBarberId || null,
      preferredServiceIds: body.preferredServiceIds || [],
      whatsappConsent: Boolean(body.whatsappConsent),
      stats: {
        totalVisits: 0,
        completedVisits: 0,
        cancelledCount: 0,
        noShowCount: 0,
        lastVisitAt: null,
        totalSpent: 0,
      },
      isFlagged: Boolean(body.isFlagged),
      flagReason: body.flagReason || '',
      createdAt: new Date().toISOString(),
    };

    dynamicCustomers.unshift(newCustomer);
    return HttpResponse.json({ success: true, data: newCustomer }, { status: 201 });
  }),

  http.patch('*/api/admin/customers/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    await delay(50);

    const customer = dynamicCustomers.find((c) => c.id === id);
    if (!customer) {
      return HttpResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    Object.assign(customer, body);
    return HttpResponse.json({ success: true, data: customer });
  }),

  http.delete('*/api/admin/customers/:id', async ({ params }) => {
    const { id } = params;
    await delay(50);

    const customer = dynamicCustomers.find((c) => c.id === id);
    if (!customer) {
      return HttpResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    customer.name = 'Anonymized Customer';
    customer.phone = '0000000000';
    customer.email = '';
    customer.notes = '';
    customer.tags = [];
    customer.isDeleted = true;

    return HttpResponse.json({
      success: true,
      message: 'Customer permanently anonymized',
    });
  }),

  // Public Queue Status (Strictly anonymous, zero PII)
  http.get('*/api/queue/status', async () => {
    await delay(30);
    const waiting = dynamicQueue.filter((e) => e.status === 'waiting');
    const inService = dynamicQueue.filter((e) => e.status === 'in_service');
    return HttpResponse.json({
      success: true,
      data: {
        isOpen: true,
        walkInsEnabled: true,
        publicQueueEnabled: true,
        peopleWaiting: waiting.length,
        inServiceCount: inService.length,
        estimatedWaitMinutes: waiting.length * 20,
        nextAvailableTime: '11:15 AM',
        canBeServedBeforeClosing: true,
        reason: null,
      },
    });
  }),

  // Public Join Queue
  http.post('*/api/queue/join', async ({ request }) => {
    const body = await request.json();
    await delay(60);

    if (body.hp_field) {
      return HttpResponse.json({ success: false, error: 'Spam detected' }, { status: 400 });
    }

    const nextToken = (dynamicQueue[dynamicQueue.length - 1]?.tokenNumber || 0) + 1;
    const newEntry = {
      id: `q-${Date.now()}`,
      tokenNumber: nextToken,
      customerName: body.customerName,
      phone: body.phone || '',
      serviceId: body.serviceId,
      barberId: body.barberId || '',
      status: 'waiting',
      joinedAt: new Date().toISOString(),
      estimatedStart: '11:30 AM',
      estimatedWaitMinutes: 25,
      source: 'public',
      notes: body.notes || '',
      date: new Date().toISOString().slice(0, 10),
    };

    dynamicQueue.push(newEntry);
    return HttpResponse.json({ success: true, data: newEntry }, { status: 201 });
  }),

  // Admin Queue List & Calculations
  http.get('*/api/admin/queue', async ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    await delay(40);

    const entries = dynamicQueue.filter((e) => e.date === date || !e.date);
    const waiting = entries.filter((e) => e.status === 'waiting');
    const inService = entries.filter((e) => e.status === 'in_service');

    return HttpResponse.json({
      success: true,
      data: {
        date,
        workingBarbersCount: dynamicBarbers.filter((b) => b.isActive).length,
        totalWaiting: waiting.length,
        inServiceCount: inService.length,
        prospectEstimation: {
          estimatedStartMinutes: 660,
          estimatedStartTime: '11:00 AM',
          estimatedWaitMinutes: waiting.length * 20,
          assignedBarberId: 'barb-1',
          assignedBarberName: 'Alex Vance',
          canBeServedBeforeClosing: true,
          reason: null,
        },
        entries,
      },
    });
  }),

  // Admin Add Walk-In
  http.post('*/api/admin/queue', async ({ request }) => {
    const body = await request.json();
    await delay(50);

    const nextToken = (dynamicQueue[dynamicQueue.length - 1]?.tokenNumber || 0) + 1;
    const newEntry = {
      id: `q-${Date.now()}`,
      tokenNumber: nextToken,
      customerName: body.customerName,
      phone: body.phone || '',
      serviceId: body.serviceId,
      barberId: body.barberId || '',
      status: 'waiting',
      joinedAt: new Date().toISOString(),
      estimatedStart: '11:15 AM',
      estimatedWaitMinutes: 15,
      source: body.source || 'admin',
      notes: body.notes || '',
      date: new Date().toISOString().slice(0, 10),
    };

    dynamicQueue.push(newEntry);
    return HttpResponse.json({ success: true, data: newEntry }, { status: 201 });
  }),

  // Admin Update Queue Status
  http.patch('*/api/admin/queue/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    await delay(50);

    const entry = dynamicQueue.find((e) => e.id === id);
    if (!entry) {
      return HttpResponse.json({ success: false, error: 'Queue entry not found' }, { status: 404 });
    }

    Object.assign(entry, body);
    if (body.status === 'called') entry.calledAt = new Date().toISOString();
    if (body.status === 'in_service') entry.startedAt = new Date().toISOString();
    if (body.status === 'done') entry.completedAt = new Date().toISOString();

    return HttpResponse.json({ success: true, data: entry });
  }),

  // Reports: Summary
  http.get('*/api/admin/reports/summary', async ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') || '2026-10-01';
    const to = url.searchParams.get('to') || '2026-10-31';
    await delay(50);

    const completed = dynamicBookings.filter((b) => b.status === 'completed');
    const revenue = completed.reduce((sum, b) => sum + (b.priceAtBooking || 650), 0) || 18450;

    return HttpResponse.json({
      success: true,
      data: {
        period: { from, to, prevFrom: '2026-09-01', prevTo: '2026-09-30' },
        totalBookings: dynamicBookings.length || 28,
        completedBookings: completed.length || 24,
        revenue,
        noShows: 2,
        noShowRate: 7.7,
        uniqueCustomers: 19,
        repeatRate: 42.1,
        previousPeriod: {
          totalBookings: 24,
          completedBookings: 20,
          revenue: 15200,
          noShowRate: 9.1,
          uniqueCustomers: 16,
          repeatRate: 37.5,
        },
        deltas: {
          totalBookings: 16.7,
          completedBookings: 20.0,
          revenue: 21.4,
          noShowRate: -1.4,
          uniqueCustomers: 18.8,
          repeatRate: 4.6,
        },
        insights: [
          'Saturday 5:00 PM is your busiest time window.',
          'No-show rate dropped by 1.4% compared to previous period.',
          'Classic Haircut is your top revenue driver (₹12,400).',
          'High client loyalty: 42.1% repeat visitor rate.',
        ],
      },
    });
  }),

  // Reports: Bookings Over Time
  http.get('*/api/admin/reports/bookings-over-time', async () => {
    await delay(60);

    const timeline = [];
    const baseDays = 14;
    for (let i = baseDays; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const isWeekend = new Date(d).getDay() === 0 || new Date(d).getDay() === 6;
      const count = isWeekend ? 8 : 4;
      const completed = Math.max(1, count - (isWeekend ? 1 : 0));
      timeline.push({
        date: d,
        totalBookings: count,
        completedBookings: completed,
        revenue: completed * 650,
        noShows: count - completed,
      });
    }

    return HttpResponse.json({ success: true, data: timeline });
  }),

  // Reports: Services
  http.get('*/api/admin/reports/services', async () => {
    await delay(40);
    const report = dynamicServices.map((s, idx) => {
      const bookingsCount = 18 - idx * 3;
      const completedCount = bookingsCount - 1;
      const revenue = completedCount * (s.price || 500);
      return {
        serviceId: s.id,
        name: s.name,
        category: s.category || 'Grooming',
        durationMinutes: s.durationMinutes || 30,
        price: s.price || 500,
        bookingsCount,
        completedCount,
        revenue,
        shareOfRevenue: 35 - idx * 7,
      };
    });
    return HttpResponse.json({ success: true, data: report });
  }),

  // Reports: Barbers
  http.get('*/api/admin/reports/barbers', async () => {
    await delay(40);
    const report = dynamicBarbers.map((b, idx) => ({
      barberId: b.id,
      name: b.name,
      role: b.role || 'Barber',
      totalAssigned: 22 - idx * 4,
      completedCount: 20 - idx * 4,
      revenue: (20 - idx * 4) * 750,
      noShowCount: idx === 0 ? 1 : 0,
      noShowRate: idx === 0 ? 4.8 : 0,
      avgServiceDuration: 35,
    }));
    return HttpResponse.json({ success: true, data: report });
  }),

  // Reports: Peak Hours Heatmap
  http.get('*/api/admin/reports/peak-hours', async () => {
    await delay(50);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const matrix = [];

    for (let day = 0; day < 7; day++) {
      for (const h of hours) {
        const isPeak = (day === 5 || day === 6) && (h === 16 || h === 17 || h === 18);
        const count = isPeak ? 9 : (day === 0 || day === 6 ? 5 : 2);
        matrix.push({
          dayOfWeek: day,
          dayName: dayNames[day],
          hour: h,
          hourLabel: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`,
          count,
          revenue: count * 650,
        });
      }
    }

    return HttpResponse.json({
      success: true,
      data: {
        matrix,
        busiestWindow: {
          dayName: 'Saturday',
          hourLabel: '5:00 PM',
          count: 9,
          revenue: 5850,
        },
      },
    });
  }),

  // Reports: Customers
  http.get('*/api/admin/reports/customers', async () => {
    await delay(40);
    const top = dynamicCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      totalLifetimeVisits: c.stats?.totalVisits || 3,
      lifetimeSpent: c.stats?.totalSpent || 2400,
      visitsInPeriod: 2,
      spentInPeriod: 1300,
    }));

    return HttpResponse.json({
      success: true,
      data: {
        totalDistinctInPeriod: 19,
        newCustomersCount: 11,
        returningCustomersCount: 8,
        topCustomers: top,
      },
    });
  }),

  // Reports: No-Shows
  http.get('*/api/admin/reports/no-shows', async () => {
    await delay(40);
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'ns-1',
          date: new Date().toISOString().slice(0, 10),
          startTime: '02:00 PM',
          customerName: 'Karan Joshi',
          phone: '919876543211',
          barberName: 'Alex Vance',
          serviceName: 'Signature Haircut',
          price: 650,
          isFlagged: false,
          noShowCount: 1,
        },
      ],
    });
  }),

  // Reports: Sources
  http.get('*/api/admin/reports/sources', async () => {
    await delay(40);
    return HttpResponse.json({
      success: true,
      data: [
        { source: 'online_booking', label: 'Online Booking', count: 18, completedCount: 16, percentage: 64.3, revenue: 11200 },
        { source: 'walk_in', label: 'Walk-in Queue', count: 7, completedCount: 6, percentage: 25.0, revenue: 4500 },
        { source: 'admin_created', label: 'Admin Created', count: 3, completedCount: 2, percentage: 10.7, revenue: 1550 },
      ],
    });
  }),

  // Public Offers
  http.get('*/api/offers', async () => {
    await delay(30);
    const active = dynamicOffers.filter((o) => o.isActive);
    return HttpResponse.json({ success: true, data: active });
  }),

  // Validate Offer Code
  http.post('*/api/offers/validate', async ({ request }) => {
    await delay(50);
    const body = await request.json();
    const { code, serviceIds = [] } = body;
    const cleanCode = (code || '').trim().toUpperCase();

    const offer = dynamicOffers.find(
      (o) => (o.promoCode || '').toUpperCase() === cleanCode && o.isActive
    );

    if (!offer) {
      return HttpResponse.json({
        success: true,
        data: {
          valid: false,
          isValid: false,
          reason: 'Promo code is invalid, expired, or inactive.',
          discountAmount: 0,
          finalPrice: 0,
        },
      });
    }

    // Check service restriction
    if (
      Array.isArray(offer.appliesToServiceIds) &&
      offer.appliesToServiceIds.length > 0 &&
      serviceIds.length > 0
    ) {
      const match = serviceIds.some((sId) => offer.appliesToServiceIds.includes(sId));
      if (!match) {
        return HttpResponse.json({
          success: true,
          data: {
            valid: false,
            isValid: false,
            reason: 'Promo code is not applicable to the selected services.',
            discountAmount: 0,
            finalPrice: 0,
          },
        });
      }
    }

    const services = dynamicServices.filter((s) => serviceIds.includes(s.id));
    const grossPrice = services.reduce((sum, s) => sum + s.price, 0) || 500;

    let discountAmount = 0;
    if (offer.type === 'percent') {
      discountAmount = Math.round((grossPrice * offer.value) / 100);
    } else {
      discountAmount = Math.min(grossPrice, offer.value);
    }

    const finalPrice = Math.max(0, grossPrice - discountAmount);

    return HttpResponse.json({
      success: true,
      data: {
        valid: true,
        isValid: true,
        offer,
        originalPrice: grossPrice,
        discountAmount,
        finalPrice,
      },
    });
  }),

  // Admin Offers List
  http.get('*/api/admin/offers', async () => {
    await delay(40);
    return HttpResponse.json({ success: true, data: dynamicOffers });
  }),

  // Admin Create Offer
  http.post('*/api/admin/offers', async ({ request }) => {
    await delay(50);
    const body = await request.json();
    const newOffer = {
      id: `off-${Date.now()}`,
      _id: `off-${Date.now()}`,
      ...body,
      promoCode: (body.promoCode || '').toUpperCase(),
      usedCount: 0,
      statusBadge: 'Live',
    };
    dynamicOffers.unshift(newOffer);
    return HttpResponse.json({ success: true, data: newOffer }, { status: 201 });
  }),

  // Admin Update Offer
  http.put('*/api/admin/offers/:id', async ({ params, request }) => {
    await delay(50);
    const { id } = params;
    const body = await request.json();
    const index = dynamicOffers.findIndex((o) => o.id === id || o._id === id);
    if (index === -1) {
      return HttpResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }
    dynamicOffers[index] = { ...dynamicOffers[index], ...body };
    return HttpResponse.json({ success: true, data: dynamicOffers[index] });
  }),

  // Admin Delete Offer
  http.delete('*/api/admin/offers/:id', async ({ params }) => {
    await delay(50);
    const { id } = params;
    const index = dynamicOffers.findIndex((o) => o.id === id || o._id === id);
    if (index !== -1) {
      dynamicOffers.splice(index, 1);
    }
    return HttpResponse.json({ success: true, data: null });
  }),

  // Admin Duplicate Offer
  http.post('*/api/admin/offers/:id/duplicate', async ({ params }) => {
    await delay(50);
    const { id } = params;
    const original = dynamicOffers.find((o) => o.id === id || o._id === id);
    if (!original) {
      return HttpResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }
    const clone = {
      ...original,
      id: `off-${Date.now()}`,
      _id: `off-${Date.now()}`,
      title: {
        en: `Copy of ${original.title.en}`,
        hi: original.title.hi ? `प्रतिलिपि: ${original.title.hi}` : '',
      },
      promoCode: original.promoCode ? `${original.promoCode}_COPY` : '',
      isActive: false,
      usedCount: 0,
      statusBadge: 'Inactive',
    };
    dynamicOffers.unshift(clone);
    return HttpResponse.json({ success: true, data: clone }, { status: 201 });
  }),

  // Reports: Offers Performance
  http.get('*/api/admin/reports/offers', async () => {
    await delay(40);
    const reportData = dynamicOffers.map((o) => ({
      offerId: o.id || o._id,
      title: o.title?.en || 'Offer',
      promoCode: o.promoCode || 'N/A',
      type: o.type,
      value: o.value,
      usesInPeriod: o.usedCount || 0,
      totalDiscountGiven: (o.usedCount || 0) * (o.value || 100),
      revenueGenerated: (o.usedCount || 0) * 500,
      totalLifetimeUses: o.usedCount || 0,
    }));
    return HttpResponse.json({ success: true, data: reportData });
  }),

  // Public FAQs
  http.get('*/api/faqs', async () => {
    await delay(30);
    const published = dynamicFaqs.filter((f) => f.isPublished);
    const grouped = published.reduce((acc, f) => {
      acc[f.category] = acc[f.category] || [];
      acc[f.category].push(f);
      return acc;
    }, {});
    return HttpResponse.json({ success: true, data: { faqs: published, grouped } });
  }),

  // Admin FAQs List
  http.get('*/api/admin/faqs', async () => {
    await delay(40);
    return HttpResponse.json({ success: true, data: dynamicFaqs });
  }),

  // Admin Create FAQ
  http.post('*/api/admin/faqs', async ({ request }) => {
    await delay(50);
    const body = await request.json();
    const newFaq = {
      id: `faq-${Date.now()}`,
      _id: `faq-${Date.now()}`,
      ...body,
      order: dynamicFaqs.length + 1,
    };
    dynamicFaqs.push(newFaq);
    return HttpResponse.json({ success: true, data: newFaq }, { status: 201 });
  }),

  // Admin Update FAQ
  http.put('*/api/admin/faqs/:id', async ({ params, request }) => {
    await delay(50);
    const { id } = params;
    const body = await request.json();
    const index = dynamicFaqs.findIndex((f) => f.id === id || f._id === id);
    if (index === -1) {
      return HttpResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
    }
    dynamicFaqs[index] = { ...dynamicFaqs[index], ...body };
    return HttpResponse.json({ success: true, data: dynamicFaqs[index] });
  }),

  // Admin Delete FAQ
  http.delete('*/api/admin/faqs/:id', async ({ params }) => {
    await delay(50);
    const { id } = params;
    const index = dynamicFaqs.findIndex((f) => f.id === id || f._id === id);
    if (index !== -1) {
      dynamicFaqs.splice(index, 1);
    }
    return HttpResponse.json({ success: true, data: null });
  }),

  // Admin Reorder FAQs
  http.patch('*/api/admin/faqs/reorder', async ({ request }) => {
    await delay(50);
    const body = await request.json();
    const { orders = [] } = body;
    orders.forEach(({ id, order }) => {
      const item = dynamicFaqs.find((f) => f.id === id || f._id === id);
      if (item) item.order = order;
    });
    dynamicFaqs.sort((a, b) => a.order - b.order);
    return HttpResponse.json({ success: true, data: dynamicFaqs });
  }),

  // Online Payments & Deposits
  http.post('*/api/payments/create-order', async ({ request }) => {
    await delay(50);
    const body = await request.json();
    const service = dynamicServices.find((s) => s.id === body.serviceId) || dynamicServices[0];
    const originalPrice = service ? service.price : 650;
    const depositAmount = Math.round((originalPrice * 20) / 100);
    const balanceDue = originalPrice - depositAmount;

    const mockOrderId = `order_mock_${Date.now()}`;
    const newBooking = {
      id: `bk-${Date.now()}`,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      serviceId: body.serviceId,
      barberId: body.barberId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime || body.startTime,
      notes: body.notes,
      priceAtBooking: originalPrice,
      amountPaid: 0,
      balanceDue,
      status: 'pending_payment',
      paymentStatus: 'pending',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
    dynamicBookings.push(newBooking);

    const paymentRecord = {
      id: `pay_mock_${Date.now()}`,
      bookingId: newBooking.id,
      razorpayOrderId: mockOrderId,
      amount: depositAmount * 100,
      purpose: 'deposit',
      status: 'created',
      currency: 'INR',
      booking: newBooking,
    };
    dynamicPayments.push(paymentRecord);

    return HttpResponse.json({
      success: true,
      data: {
        paymentRequired: true,
        booking: newBooking,
        order: {
          id: mockOrderId,
          amount: depositAmount * 100,
          currency: 'INR',
          keyId: 'rzp_test_mock_key',
        },
        paymentId: paymentRecord.id,
        breakdown: {
          totalPrice: originalPrice,
          depositAmount,
          balanceDue,
          purpose: 'deposit',
        },
        expiresAt: newBooking.expiresAt,
        holdTimeoutMinutes: 10,
      },
    });
  }),

  http.post('*/api/payments/verify', async ({ request }) => {
    await delay(50);
    const body = await request.json();
    const { bookingId, razorpayOrderId, razorpayPaymentId } = body;

    const booking = dynamicBookings.find((b) => b.id === bookingId || b._id === bookingId);
    if (booking) {
      const deposit = Math.round(((booking.priceAtBooking || 650) * 20) / 100);
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.amountPaid = deposit;
      booking.balanceDue = (booking.priceAtBooking || 650) - deposit;
      booking.expiresAt = null;
    }

    const payment = dynamicPayments.find((p) => p.razorpayOrderId === razorpayOrderId);
    if (payment) {
      payment.status = 'captured';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.method = 'upi';
    }

    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        booking: booking || { id: bookingId, status: 'confirmed' },
        payment: payment || { id: 'pay_mock', status: 'captured' },
      },
    });
  }),

  // Admin Payments List
  http.get('*/api/admin/payments', async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let filtered = [...dynamicPayments];
    if (status && status !== 'all') {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.razorpayOrderId?.toLowerCase().includes(q) ||
          p.booking?.customerName?.toLowerCase().includes(q) ||
          p.booking?.phone?.includes(q)
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        payments: filtered,
        pagination: {
          page: 1,
          limit: 20,
          total: filtered.length,
          totalPages: 1,
        },
      },
    });
  }),

  // Admin Payments Reconciliation
  http.get('*/api/admin/payments/reconciliation', async () => {
    await delay(50);
    const totalExpected = dynamicBookings.reduce((sum, b) => sum + (b.priceAtBooking || 0), 0);
    const collectedOnline = dynamicPayments.reduce((sum, p) => {
      if (p.status === 'captured') return sum + (p.amount || 0) / 100;
      return sum;
    }, 0);
    const refundedOnline = dynamicPayments.reduce((sum, p) => sum + (p.refundedAmount || 0) / 100, 0);

    return HttpResponse.json({
      success: true,
      data: {
        totalExpected,
        collectedOnline: Math.max(0, collectedOnline - refundedOnline),
        collectedAtShop: 1200,
        pendingBalance: 450,
        refundedOnline,
        totalCollected: Math.max(0, collectedOnline - refundedOnline) + 1200,
      },
    });
  }),

  // Admin Refund Payment
  http.post('*/api/admin/payments/:id/refund', async ({ params, request }) => {
    await delay(50);
    const { id } = params;
    const body = await request.json();
    const payment = dynamicPayments.find((p) => p.id === id || p._id === id);
    if (!payment) {
      return HttpResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    const refundAmount = body.amountPaise || payment.amount;
    payment.status = 'refunded';
    payment.refundedAmount = refundAmount;
    payment.refundReason = body.reason || 'Customer request';

    const booking = dynamicBookings.find((b) => b.id === payment.bookingId);
    if (booking) {
      booking.paymentStatus = 'refunded';
      booking.amountPaid = Math.max(0, (booking.amountPaid || 0) - refundAmount / 100);
      booking.balanceDue = booking.priceAtBooking || 0;
    }

    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        payment,
        booking,
      },
    });
  }),

  // Admin Mark Paid at Shop
  http.patch('*/api/admin/bookings/:id/mark-paid', async ({ params }) => {
    await delay(50);
    const { id } = params;
    const booking = dynamicBookings.find((b) => b.id === id || b._id === id);
    if (!booking) {
      return HttpResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    booking.amountPaid = booking.priceAtBooking || 0;
    booking.balanceDue = 0;
    booking.paymentStatus = 'paid';

    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        booking,
      },
    });
  }),
];

export default handlers;
