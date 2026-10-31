import { z } from 'zod';

export const reportQuerySchema = z.object({
  query: z
    .object({
      from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'from date must be in YYYY-MM-DD format')
        .optional(),
      to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'to date must be in YYYY-MM-DD format')
        .optional(),
      barberId: z.string().trim().optional(),
      granularity: z.enum(['day', 'week', 'month']).optional().default('day'),
      format: z.enum(['json', 'csv']).optional().default('json'),
    })
    .refine(
      (data) => {
        if (data.from && data.to) {
          return data.from <= data.to;
        }
        return true;
      },
      {
        message: 'from date cannot be after to date',
        path: ['from'],
      }
    )
    .refine(
      (data) => {
        if (data.from && data.to) {
          const fromDate = new Date(`${data.from}T00:00:00Z`);
          const toDate = new Date(`${data.to}T00:00:00Z`);
          const diffDays = Math.round((toDate - fromDate) / 86400000);
          return diffDays <= 366;
        }
        return true;
      },
      {
        message: 'Date range cannot exceed 366 days',
        path: ['to'],
      }
    ),
});

