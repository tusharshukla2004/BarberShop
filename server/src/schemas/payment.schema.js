import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email().optional().or(z.literal('')),
    serviceId: z.string().min(1, 'Service ID is required'),
    barberId: z.string().optional().default(''),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().optional(),
    notes: z.string().max(500).optional().default(''),
    whatsappConsent: z.boolean().optional().default(false),
    promoCode: z.string().optional().default(''),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
    razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
    razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
    method: z.string().optional(),
  }),
});

export const refundPaymentSchema = z.object({
  body: z.object({
    amountPaise: z.number().int().positive().optional(),
    reason: z.string().max(200).optional().default('Customer request'),
    bypassPolicy: z.boolean().optional().default(false),
  }),
});
