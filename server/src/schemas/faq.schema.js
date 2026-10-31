import { z } from 'zod';

const bilingualStringSchema = z.object({
  en: z.string().trim().min(3, 'English text must be at least 3 characters'),
  hi: z.string().trim().optional().default(''),
});

export const faqSchema = z.object({
  body: z.object({
    question: bilingualStringSchema,
    answer: bilingualStringSchema,
    category: z.enum(['Booking', 'Pricing', 'Services', 'Policies', 'Other']).default('Booking'),
    order: z.coerce.number().optional().default(0),
    isPublished: z.boolean().optional().default(true),
  }),
});

export const createFaqSchema = faqSchema;
export const updateFaqSchema = faqSchema;

export const reorderFaqsSchema = z.object({
  body: z.object({
    orders: z.array(
      z.object({
        id: z.string().min(1),
        order: z.coerce.number(),
      })
    ),
  }),
});
