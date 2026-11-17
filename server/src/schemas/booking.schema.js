import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
      .string()
      .trim()
      .regex(
        /^(?:(?:\+|0{0,2})91(\s*[- ]\s*)?|[0]?)?[6789]\d{9}$/,
        'Please enter a valid 10-digit Indian mobile number'
      ),
    email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
    serviceId: z.string().min(1, 'Service is required'),
    barberId: z.string().optional().default(''),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().optional(),
    notes: z.string().max(500).optional(),
    whatsappConsent: z.boolean().optional().default(false),
    promoCode: z.string().trim().optional(),
  }),
});

export const createBookingRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
      .string()
      .trim()
      .regex(
        /^(?:(?:\+|0{0,2})91(\s*[- ]\s*)?|[0]?)?[6789]\d{9}$/,
        'Please enter a valid 10-digit Indian mobile number'
      ),
    dateTime: z.string().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    service: z.string().optional(),
    notes: z.string().max(500).optional(),
    whatsappConsent: z.boolean().optional().default(false),
    promoCode: z.string().trim().optional(),
  }),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
  body: z.object({
    status: z
      .enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
      .optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    barberId: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const getSlotsQuerySchema = z.object({
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date YYYY-MM-DD is required'),
    barberId: z.string().min(1, 'Barber ID is required'),
    serviceId: z.string().optional(),
  }),
});

export const recordNotificationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
  body: z.object({
    type: z.enum([
      'confirmation',
      'reminder',
      'reschedule',
      'cancellation',
      'review_request',
      'running_late',
      'custom',
    ]),
    channel: z
      .enum(['whatsapp_link', 'whatsapp_cloud', 'email', 'sms'])
      .default('whatsapp_link')
      .optional(),
  }),
});

export const getRemindersQuerySchema = z.object({
  query: z.object({
    hours: z.coerce.number().min(1).max(48).default(3).optional(),
    day: z.enum(['today', 'tomorrow']).default('today').optional(),
  }),
});
