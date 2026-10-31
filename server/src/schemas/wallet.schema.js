import { z } from 'zod';

export const packageSchema = z.object({
  body: z.object({
    name: z.object({
      en: z.string().trim().min(2, 'English name is required'),
      hi: z.string().trim().min(2, 'Hindi name is required'),
    }),
    description: z
      .object({
        en: z.string().optional().default(''),
        hi: z.string().optional().default(''),
      })
      .optional(),
    serviceIds: z.array(z.string()).default([]),
    sessions: z.number().int().min(1, 'Sessions must be at least 1'),
    price: z.number().min(0, 'Price cannot be negative'),
    validityDays: z.number().int().min(1, 'Validity must be at least 1 day').default(90),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updatePackageSchema = z.object({
  body: z.object({
    name: z
      .object({
        en: z.string().trim().min(2).optional(),
        hi: z.string().trim().min(2).optional(),
      })
      .optional(),
    description: z
      .object({
        en: z.string().optional(),
        hi: z.string().optional(),
      })
      .optional(),
    serviceIds: z.array(z.string()).optional(),
    sessions: z.number().int().min(1).optional(),
    price: z.number().min(0).optional(),
    validityDays: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const membershipPlanSchema = z.object({
  body: z.object({
    name: z.object({
      en: z.string().trim().min(2, 'English name is required'),
      hi: z.string().trim().min(2, 'Hindi name is required'),
    }),
    description: z
      .object({
        en: z.string().optional().default(''),
        hi: z.string().optional().default(''),
      })
      .optional(),
    price: z.number().min(0, 'Price cannot be negative'),
    durationDays: z.number().int().min(1, 'Duration must be at least 1 day').default(30),
    benefits: z
      .array(
        z.object({
          type: z.enum(['discount_percent', 'free_service', 'priority_booking']),
          value: z.number().min(0).default(0),
          serviceIds: z.array(z.string()).default([]),
        })
      )
      .default([]),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateMembershipPlanSchema = z.object({
  body: z.object({
    name: z
      .object({
        en: z.string().trim().min(2).optional(),
        hi: z.string().trim().min(2).optional(),
      })
      .optional(),
    description: z
      .object({
        en: z.string().optional(),
        hi: z.string().optional(),
      })
      .optional(),
    price: z.number().min(0).optional(),
    durationDays: z.number().int().min(1).optional(),
    benefits: z
      .array(
        z.object({
          type: z.enum(['discount_percent', 'free_service', 'priority_booking']),
          value: z.number().min(0).default(0),
          serviceIds: z.array(z.string()).default([]),
        })
      )
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export const sellPackageSchema = z.object({
  body: z.object({
    packageId: z.string().min(1, 'Package ID is required'),
    paymentMethod: z.enum(['cash', 'upi', 'card', 'online']).default('cash'),
    amountPaid: z.number().min(0).optional(),
  }),
});

export const sellMembershipSchema = z.object({
  body: z.object({
    planId: z.string().min(1, 'Plan ID is required'),
    paymentMethod: z.enum(['cash', 'upi', 'card', 'online']).default('cash'),
    amountPaid: z.number().min(0).optional(),
  }),
});

export const consumeSessionSchema = z.object({
  body: z.object({
    customerPackageId: z.string().min(1, 'Customer Package ID is required'),
    bookingId: z.string().optional().nullable(),
    serviceId: z.string().optional().default(''),
  }),
});

export const reverseSessionSchema = z.object({
  body: z.object({
    customerPackageId: z.string().min(1, 'Customer Package ID is required'),
    bookingId: z.string().optional().nullable(),
    reason: z.string().trim().min(3, 'Reversal reason is required'),
  }),
});

export const reverseMembershipSchema = z.object({
  body: z.object({
    customerMembershipId: z.string().min(1, 'Customer Membership ID is required'),
    bookingId: z.string().optional().nullable(),
    reason: z.string().trim().min(3, 'Reversal reason is required'),
  }),
});

export const adjustLoyaltySchema = z.object({
  body: z.object({
    type: z.enum(['earn', 'adjust']),
    amount: z.number().int().min(1, 'Amount must be at least 1'),
    notes: z.string().trim().min(2, 'Notes required'),
    bookingId: z.string().optional().nullable(),
  }),
});

export const redeemRewardSchema = z.object({
  body: z.object({
    stampsToRedeem: z.number().int().min(1).default(10),
    bookingId: z.string().optional().nullable(),
    notes: z.string().optional().default('Loyalty Reward Redeemed'),
  }),
});

export const reverseLoyaltySchema = z.object({
  body: z.object({
    historyId: z.string().min(1, 'History entry ID is required'),
    reason: z.string().trim().min(3, 'Reversal reason is required'),
  }),
});

