import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').trim(),
  category: z.enum(['Hair', 'Beard', 'Shave', 'Accessories']),
  tagline: z.string().trim().optional().default(''),
  price: z.coerce.number().positive('Price must be greater than 0'),
  size: z.string().trim().optional().default(''),
  scent: z.string().trim().optional().default(''),
  description: z.string().min(5, 'Description must be at least 5 characters').trim(),
  ingredients: z.string().trim().optional().default(''),
  howToUse: z.string().trim().optional().default(''),
  imageUrl: z.string().url('Image URL must be valid').or(z.string().min(1)),
  rating: z.coerce.number().min(0).max(5).optional().default(5.0),
  reviewCount: z.coerce.number().min(0).optional().default(0),
  isBestSeller: z.boolean().optional().default(false),
  inStock: z.boolean().optional().default(true),
  order: z.coerce.number().optional().default(0),
});
