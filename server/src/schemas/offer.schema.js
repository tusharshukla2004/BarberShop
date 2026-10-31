import { z } from 'zod';

const bilingualStringSchema = z.object({
  en: z.string().trim().min(2, 'English content must be at least 2 characters'),
  hi: z.string().trim().optional().default(''),
});

const bilingualOptionalSchema = z.object({
  en: z.string().trim().optional().default(''),
  hi: z.string().trim().optional().default(''),
});

export const offerSchema = z.object({
  body: z.object({
    title: bilingualStringSchema,
    description: bilingualOptionalSchema.optional().default({ en: '', hi: '' }),
    imageUrl: z.string().trim().optional().default(''),
    type: z.enum(['percent', 'flat', 'free_addon', 'combo', 'info']).default('percent'),
    value: z.coerce.number().min(0, 'Value must be 0 or greater').default(0),
    appliesToServiceIds: z.array(z.string()).optional().default([]),
    startsAt: z.string().min(1, 'Start date is required'),
    endsAt: z.string().min(1, 'End date is required'),
    isActive: z.boolean().optional().default(true),
    showOnHome: z.boolean().optional().default(false),
    promoCode: z.string().trim().optional().default(''),
    usageLimit: z.coerce.number().nullable().optional().default(null),
    daysOfWeek: z.array(z.coerce.number().min(0).max(6)).optional().default([]),
  }),
});

export const createOfferSchema = offerSchema;
export const updateOfferSchema = offerSchema;

export const validateOfferCodeSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1, 'Promo code is required'),
    serviceIds: z.array(z.string()).optional().default([]),
    date: z.string().optional(),
  }),
});
