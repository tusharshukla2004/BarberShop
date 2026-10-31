import { z } from 'zod';

export const serviceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    category: z.enum(['Hair', 'Shave', 'Beard', 'Combo', 'Treatment']),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    price: z.number().nonnegative('Price must be greater than or equal to 0'),
    durationMinutes: z.number().int().min(5, 'Duration must be at least 5 minutes'),
    isActive: z.boolean().optional(),
  }),
});

export const barberSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Barber name must be at least 2 characters'),
    role: z.string().min(2, 'Role must be at least 2 characters'),
    photoUrl: z.string().min(1, 'Photo URL is required'),
    experienceYears: z.number().int().nonnegative().optional(),
    specialties: z.array(z.string()).optional(),
    socials: z
      .object({
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        facebook: z.string().optional(),
      })
      .optional(),
    workingHours: z
      .array(
        z.object({
          day: z.enum([
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ]),
          start: z.string(),
          end: z.string(),
          isWorking: z.boolean(),
        })
      )
      .optional(),
    leaveDays: z.array(z.string().or(z.date())).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const galleryItemSchema = z.object({
  body: z.object({
    imageUrl: z.string().min(1, 'Image URL is required'),
    category: z.string().min(2, 'Category is required'),
    caption: z.string().optional(),
    order: z.number().int().optional(),
  }),
});

export const reviewSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name is required'),
    role: z.string().optional(),
    rating: z.number().int().min(1).max(5),
    text: z.string().min(5, 'Review text must be at least 5 characters'),
    isApproved: z.boolean().optional(),
  }),
});

export const settingsSchema = z.object({
  body: z.object({
    shopHours: z
      .array(
        z.object({
          days: z.string(),
          time: z.string(),
        })
      )
      .optional(),
    holidays: z.array(z.string()).optional(),
    slotLengthMinutes: z.number().int().min(15).max(120).optional(),
    whatsappNumber: z.string().optional(),
    googleReviewLink: z.string().optional(),
    messageTemplates: z
      .object({
        confirmation: z.string().optional(),
        reminder: z.string().optional(),
        reschedule: z.string().optional(),
        cancellation: z.string().optional(),
        review_request: z.string().optional(),
        running_late: z.string().optional(),
      })
      .optional(),
    policies: z.record(z.any()).optional(),
  }),
});
