import { z } from 'zod';

export const listQueueQuerySchema = z.object({
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
      .optional(),
  }),
});

export const addWalkInSchema = z.object({
  body: z.object({
    customerName: z.string().trim().min(2, 'Customer name must be at least 2 characters'),
    phone: z.string().trim().optional().or(z.literal('')),
    serviceId: z.string().trim().min(1, 'Service ID is required'),
    barberId: z.string().trim().optional().default(''),
    notes: z.string().trim().optional().default(''),
    source: z.enum(['admin', 'kiosk', 'public']).optional().default('admin'),
  }),
});

export const updateQueueEntrySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Queue entry ID is required'),
  }),
  body: z.object({
    status: z.enum(['waiting', 'called', 'in_service', 'done', 'left', 'no_show']).optional(),
    barberId: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    reorder: z.enum(['up', 'down', 'top', 'bottom']).optional(),
  }),
});

export const joinPublicQueueSchema = z.object({
  body: z.object({
    customerName: z.string().trim().min(2, 'Customer name must be at least 2 characters'),
    phone: z.string().trim().optional().or(z.literal('')),
    serviceId: z.string().trim().min(1, 'Service ID is required'),
    barberId: z.string().trim().optional().default(''),
    notes: z.string().trim().optional().default(''),
    hp_field: z.string().max(0, 'Spam bot detected').optional().or(z.literal('')),
  }),
});
