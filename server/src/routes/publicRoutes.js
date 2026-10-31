import { Router } from 'express';
import { getServices } from '../controllers/serviceController.js';
import { getBarbers } from '../controllers/barberController.js';
import { getGallery } from '../controllers/galleryController.js';
import { getReviews, createReview } from '../controllers/reviewController.js';
import { getSettings } from '../controllers/settingsController.js';
import { getProducts, getProductById } from '../controllers/productController.js';
import { createContactMessage } from '../controllers/contactController.js';
import {
  getSlots,
  createBooking,
  createBookingRequest,
} from '../controllers/bookingController.js';
import {
  getPublicQueueStatus,
  joinPublicQueue,
} from '../controllers/queueController.js';
import { getPublicOffers, validateOfferCode } from '../controllers/offerController.js';
import { getPublicFaqs } from '../controllers/faqController.js';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentWebhook,
} from '../controllers/paymentController.js';
import {
  getPublicPackages,
  getPublicMemberships,
  getPublicWalletByToken,
} from '../controllers/walletController.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  createBookingRequestSchema,
  getSlotsQuerySchema,
} from '../schemas/booking.schema.js';
import { reviewSchema } from '../schemas/content.schema.js';
import { contactSchema } from '../schemas/contact.schema.js';
import { joinPublicQueueSchema } from '../schemas/queue.schema.js';
import { validateOfferCodeSchema } from '../schemas/offer.schema.js';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from '../schemas/payment.schema.js';
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

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

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

// Walk-in queue
router.get('/queue/status', getPublicQueueStatus);
router.post('/queue/join', bookingLimiter, validate(joinPublicQueueSchema), joinPublicQueue);

// Offers & FAQs
router.get('/offers', getPublicOffers);
router.post('/offers/validate', validate(validateOfferCodeSchema), validateOfferCode);
router.get('/faqs', getPublicFaqs);

// Packages, Memberships & Public Customer Wallet Pass
router.get('/packages', getPublicPackages);
router.get('/memberships', getPublicMemberships);
router.get('/wallet/:token', getPublicWalletByToken);

// Online Payments & Deposits (Razorpay)
router.post(
  '/payments/create-order',
  bookingLimiter,
  validate(createPaymentOrderSchema),
  createPaymentOrder
);
router.post('/payments/verify', validate(verifyPaymentSchema), verifyPayment);
router.post('/payments/webhook', handlePaymentWebhook);

export default router;
