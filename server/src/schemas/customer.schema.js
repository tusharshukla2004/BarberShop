import { z } from 'zod';

export const listCustomersQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    isFlagged: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((val) => val === true || val === 'true')
      .optional(),
    tag: z.string().optional(),
    lastVisitFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'lastVisitFrom must be YYYY-MM-DD')
      .optional(),
    lastVisitTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'lastVisitTo must be YYYY-MM-DD')
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z
      .enum(['name', 'createdAt', 'stats.totalVisits', 'stats.lastVisitAt', 'stats.totalSpent'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    phone: z.string().trim().min(10, 'Valid 10-digit Indian mobile number is required'),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    notes: z.string().trim().optional(),
    tags: z.array(z.string().trim()).optional(),
    preferredBarberId: z.string().nullable().optional(),
    preferredServiceIds: z.array(z.string()).optional(),
    whatsappConsent: z.boolean().optional(),
    isFlagged: z.boolean().optional(),
    flagReason: z.string().trim().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(2).optional(),
    phone: z.string().trim().min(10).optional(),
    email: z.string().trim().email().optional().or(z.literal('')),
    notes: z.string().trim().optional(),
    tags: z.array(z.string().trim()).optional(),
    preferredBarberId: z.string().nullable().optional(),
    preferredServiceIds: z.array(z.string()).optional(),
    whatsappConsent: z.boolean().optional(),
    isFlagged: z.boolean().optional(),
    flagReason: z.string().trim().optional(),
  }),
});

export const customerIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
});
