import { z } from 'zod';

export const COMMON_PASSWORDS = [
  'password123',
  'password1234',
  'admin123456',
  '1234567890',
  'qwerty12345',
  'barbershop123',
  'welcome12345',
  'pass12345678',
  'changeme123',
  'adminadmin1',
  'modernmane123',
];

export const passwordRule = z
  .string()
  .min(10, 'Password must be at least 10 characters long')
  .refine((val) => !COMMON_PASSWORDS.includes(val.toLowerCase()), {
    message: 'Password is too common or easily guessed. Please choose a stronger password.',
  });

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordRule,
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password cannot be the same as your current password',
      path: ['newPassword'],
    }),
});

export const createStaffSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters'),
      email: z.string().trim().email('Please enter a valid email address'),
      role: z.enum(['owner', 'barber']),
      barberId: z.string().nullable().optional(),
      temporaryPassword: passwordRule,
    })
    .refine((data) => (data.role === 'barber' ? Boolean(data.barberId) : true), {
      message: 'barberId is required when creating a barber account',
      path: ['barberId'],
    }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    barberId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const resetStaffPasswordSchema = z.object({
  body: z.object({
    temporaryPassword: passwordRule,
  }),
});
