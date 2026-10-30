import { Router } from 'express';
import { getServices } from '../controllers/serviceController.js';
import { getBarbers } from '../controllers/barberController.js';
import { getGallery } from '../controllers/galleryController.js';
import { getReviews, createReview } from '../controllers/reviewController.js';
import { getSettings } from '../controllers/settingsController.js';
import { createContactMessage } from '../controllers/contactController.js';
import {
  getSlots,
  createBooking,
  createBookingRequest,
} from '../controllers/bookingController.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  createBookingRequestSchema,
  getSlotsQuerySchema,
} from '../schemas/booking.schema.js';
import { reviewSchema } from '../schemas/content.schema.js';
import { contactSchema } from '../schemas/contact.schema.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Services
router.get('/services', getServices);

// Barbers
router.get('/barbers', getBarbers);

// Gallery
router.get('/gallery', getGallery);

// Reviews
router.get('/reviews', getReviews);
router.post('/reviews', validate(reviewSchema), createReview);

// Contact messages
router.post('/contact', validate(contactSchema), createContactMessage);

// Settings
router.get('/settings', getSettings);

// Slots (supporting both /api/slots and /api/bookings/slots)
router.get('/slots', validate(getSlotsQuerySchema), getSlots);
router.get('/bookings/slots', validate(getSlotsQuerySchema), getSlots);

// Bookings
router.post('/bookings', bookingLimiter, validate(createBookingSchema), createBooking);
router.post(
  '/bookings/request',
  bookingLimiter,
  validate(createBookingRequestSchema),
  createBookingRequest
);

export default router;
