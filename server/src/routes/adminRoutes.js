import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import {
  createBarber,
  updateBarber,
  deleteBarber,
} from '../controllers/barberController.js';
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import {
  getSettings,
  updateSettings,
} from '../controllers/settingsController.js';
import {
  adminListBookings,
  adminUpdateBooking,
  adminCancelBooking,
  recordNotification,
  getReminders,
} from '../controllers/bookingController.js';
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import {
  getAdminQueue,
  addWalkIn,
  updateQueueStatus,
} from '../controllers/queueController.js';
import {
  serviceSchema,
  barberSchema,
  galleryItemSchema,
  settingsSchema,
} from '../schemas/content.schema.js';
import { productSchema } from '../schemas/product.schema.js';
import {
  updateBookingSchema,
  recordNotificationSchema,
  getRemindersQuerySchema,
} from '../schemas/booking.schema.js';
import {
  listCustomersQuerySchema,
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamSchema,
} from '../schemas/customer.schema.js';
import {
  listQueueQuerySchema,
  addWalkInSchema,
  updateQueueEntrySchema,
} from '../schemas/queue.schema.js';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireRole('owner', 'barber'));

// Bookings management
router.get('/bookings', adminListBookings);
router.patch('/bookings/:id', validate(updateBookingSchema), adminUpdateBooking);
router.patch('/bookings/:id/status', adminUpdateBooking);
router.patch(
  '/bookings/:id/notifications',
  validate(recordNotificationSchema),
  recordNotification
);
router.delete('/bookings/:id', adminCancelBooking);

// Reminders (Today / Tomorrow upcoming sessions)
router.get('/reminders', validate(getRemindersQuerySchema), getReminders);

// Customers management
router.get('/customers', validate(listCustomersQuerySchema), listCustomers);
router.get('/customers/:id', validate(customerIdParamSchema), getCustomerById);
router.post('/customers', validate(createCustomerSchema), createCustomer);
router.patch('/customers/:id', validate(updateCustomerSchema), updateCustomer);
router.delete('/customers/:id', validate(customerIdParamSchema), deleteCustomer);

// Queue management
router.get('/queue', validate(listQueueQuerySchema), getAdminQueue);
router.post('/queue', validate(addWalkInSchema), addWalkIn);
router.patch('/queue/:id', validate(updateQueueEntrySchema), updateQueueStatus);

// Services management
router.post('/services', validate(serviceSchema), createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Barbers management
router.post('/barbers', validate(barberSchema), createBarber);
router.put('/barbers/:id', updateBarber);
router.delete('/barbers/:id', deleteBarber);

// Gallery management
router.post('/gallery', validate(galleryItemSchema), createGalleryItem);
router.put('/gallery/:id', updateGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);

// Reviews management
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

// Products management
router.post('/products', validate(productSchema), createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Settings management
router.get('/settings', getSettings);
router.put('/settings', validate(settingsSchema), updateSettings);

export default router;
