import { z } from 'zod';

export const bilingualStringSchema = z.object({
  en: z.string().min(1, 'English string is required').trim(),
  hi: z.string().optional().default(''),
});

export const areaFaqSchema = z.object({
  question: bilingualStringSchema,
  answer: bilingualStringSchema,
});

export const areaBodySchema = z.object({
  name: bilingualStringSchema,
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .trim(),
  landmarks: z.array(z.string().trim()).default([]),
  description: bilingualStringSchema,
  directions: bilingualStringSchema,
  mapEmbedUrl: z.string().optional().default(''),
  faqs: z.array(areaFaqSchema).default([]),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  order: z.number().int().default(0),
  seoTitle: bilingualStringSchema.optional(),
  seoDescription: bilingualStringSchema.optional(),
});

export const createAreaSchema = z.object({
  body: areaBodySchema,
});

export const updateAreaSchema = z.object({
  body: areaBodySchema.partial(),
});

export const postBodySchema = z.object({
  title: bilingualStringSchema,
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .trim(),
  excerpt: bilingualStringSchema,
  content: z.object({
    en: z.string().min(10, 'English content is required'),
    hi: z.string().optional().default(''),
  }),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string().trim()).default(['grooming']),
  category: z.enum(['haircut', 'beard', 'styling', 'grooming', 'trends', 'news']).default('grooming'),
  author: z
    .object({
      name: z.string().default('Master Barber Ravi'),
      role: z.string().default('Senior Grooming Expert'),
      avatar: z.string().optional(),
    })
    .default({}),
  status: z.enum(['draft', 'scheduled', 'published']).default('draft'),
  publishedAt: z.string().datetime().optional().or(z.date().optional()),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const createPostSchema = z.object({
  body: postBodySchema,
});

export const updatePostSchema = z.object({
  body: postBodySchema.partial(),
});

export const redirectBodySchema = z.object({
  fromPath: z.string().min(1, 'From path is required').trim(),
  toPath: z.string().min(1, 'To path is required').trim(),
  statusCode: z.enum(['301', '302', '410']).or(z.number()).transform((val) => Number(val)),
  isActive: z.boolean().default(true),
  notes: z.string().optional().default(''),
});

export const createRedirectSchema = z.object({
  body: redirectBodySchema,
});

export const updateRedirectSchema = z.object({
  body: redirectBodySchema.partial(),
});
