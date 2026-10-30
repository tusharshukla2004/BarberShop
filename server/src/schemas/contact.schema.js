import { z } from 'zod';

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
      .string()
      .trim()
      .regex(
        /^(?:(?:\+|0{0,2})91(\s*[- ]\s*)?|[0]?)?[6789]\d{9}$/,
        'Please enter a valid 10-digit Indian mobile number'
      ),
    email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
    message: z.string().min(5, 'Message must be at least 5 characters').max(1000),
  }),
});
