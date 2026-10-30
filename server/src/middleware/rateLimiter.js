import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts. Please try again after 15 minutes.',
    },
  },
});

export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40, // Limit each IP to 40 booking creations/requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many booking requests created from this IP. Please wait a few minutes.',
    },
  },
});
