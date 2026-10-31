import { z } from 'zod';

/**
 * Validation schema for the quick appointment request form
 */
export const appointmentRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name cannot exceed 60 characters'),
  email: z
    .string()
    .trim()
    .max(100, 'Email cannot exceed 100 characters')
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      'Please enter a valid email address'
    ),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .refine((val) => {
      const digitsOnly = val.replace(/\D/g, '');
      // Match 10 digits starting with 6-9, or 12 digits starting with 91 followed by 6-9
      if (digitsOnly.length === 10) {
        return /^[6-9]\d{9}$/.test(digitsOnly);
      }
      if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        return /^[6-9]\d{9}$/.test(digitsOnly.slice(2));
      }
      return false;
    }, 'Enter a valid 10-digit Indian mobile number (e.g. 98765 43210)'),
  dateTime: z
    .string()
    .min(1, 'Please select your preferred date & time')
    .refine((val) => {
      const selected = new Date(val);
      if (Number.isNaN(selected.getTime())) return false;
      const now = new Date();
      // Allow buffer of 2 minutes to prevent immediate clock drift validation failures
      return selected.getTime() >= now.getTime() - 2 * 60 * 1000;
    }, 'Appointment time cannot be in the past'),
  serviceId: z.string().optional(),
  barberId: z.string().optional(),
  whatsappConsent: z.boolean().optional().default(false),
});

export default appointmentRequestSchema;
