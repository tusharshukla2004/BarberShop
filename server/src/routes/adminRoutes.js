import { Router } from 'express';
import { requireAuth, requireRole, scopeBarberAccess, csrfProtection } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listStaffUsers,
  createStaffUser,
  updateStaffUser,
  resetStaffPassword,
  getAuditLogs,
} from '../controllers/staffManagementController.js';
import {
  createStaffSchema,
  updateStaffSchema,
  resetStaffPasswordSchema,
} from '../schemas/auth.schema.js';
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
  getSummaryReport,
  getBookingsOverTime,
  getServicesReport,
  getBarbersReport,
  getPeakHoursReport,
  getCustomersReport,
  getNoShowsReport,
  getSourcesReport,
  getOffersReport,
  getWalletReport,
} from '../controllers/reportController.js';
import {
  getAdminAreas,
  createArea,
  updateArea,
  deleteArea,
  getAdminPosts,
  createPost,
  updatePost,
  deletePost,
  getAdminRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
  getSeoHealthReport,
  getGbpHelpers,
} from '../controllers/seoController.js';
import {
  createAreaSchema,
  updateAreaSchema,
  createPostSchema,
  updatePostSchema,
  createRedirectSchema,
  updateRedirectSchema,
} from '../schemas/seo.schema.js';
import {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
  listMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  getCustomerWallet,
  sellPackageToCustomer,
  sellMembershipToCustomer,
  consumePackageSession,
  reversePackageSession,
  reverseMembershipBenefit,
  adjustLoyaltyStamps,
  redeemLoyaltyReward,
  reverseLoyaltyHistory,
  generateWalletToken,
  revokeWalletToken,
  getExpiringWalletItemsList,
  getDueForVisitCustomers,
  getUpcomingBirthdays,
} from '../controllers/walletController.js';
import {
  listAdminOffers,
  createOffer,
  getOfferById,
  updateOffer,
  deleteOffer,
  duplicateOffer,
} from '../controllers/offerController.js';
import {
  listAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
} from '../controllers/faqController.js';
import {
  getPaymentsList,
  getReconciliation,
  refundPayment,
  markPaidAtShop,
} from '../controllers/paymentController.js';
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
import { refundPaymentSchema } from '../schemas/payment.schema.js';
import { reportQuerySchema } from '../schemas/report.schema.js';
import {
  createOfferSchema,
  updateOfferSchema,
} from '../schemas/offer.schema.js';
import {
  createFaqSchema,
  updateFaqSchema,
  reorderFaqsSchema,
} from '../schemas/faq.schema.js';
import {
  packageSchema,
  updatePackageSchema,
  membershipPlanSchema,
  updateMembershipPlanSchema,
  sellPackageSchema,
  sellMembershipSchema,
  consumeSessionSchema,
  reverseSessionSchema,
  reverseMembershipSchema,
  adjustLoyaltySchema,
  redeemRewardSchema,
  reverseLoyaltySchema,
} from '../schemas/wallet.schema.js';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireRole('owner', 'barber'), csrfProtection);

// Bookings management (scoped for barbers)
router.get('/bookings', scopeBarberAccess, adminListBookings);
router.patch('/bookings/:id', scopeBarberAccess, validate(updateBookingSchema), adminUpdateBooking);
router.patch('/bookings/:id/status', scopeBarberAccess, adminUpdateBooking);
router.patch(
  '/bookings/:id/notifications',
  scopeBarberAccess,
  validate(recordNotificationSchema),
  recordNotification
);
router.delete('/bookings/:id', scopeBarberAccess, adminCancelBooking);

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

// Reports & Analytics (Owner full view; Barbers see their own data only)
router.get('/reports/summary', validate(reportQuerySchema), getSummaryReport);
router.get('/reports/bookings-over-time', validate(reportQuerySchema), getBookingsOverTime);
router.get('/reports/services', validate(reportQuerySchema), getServicesReport);
router.get('/reports/barbers', validate(reportQuerySchema), getBarbersReport);
router.get('/reports/peak-hours', validate(reportQuerySchema), getPeakHoursReport);
router.get('/reports/customers', validate(reportQuerySchema), getCustomersReport);
router.get('/reports/no-shows', validate(reportQuerySchema), getNoShowsReport);
router.get('/reports/sources', validate(reportQuerySchema), getSourcesReport);
router.get('/reports/offers', validate(reportQuerySchema), getOffersReport);

// Offers management
router.get('/offers', listAdminOffers);
router.post('/offers', validate(createOfferSchema), createOffer);
router.get('/offers/:id', getOfferById);
router.put('/offers/:id', validate(updateOfferSchema), updateOffer);
router.delete('/offers/:id', deleteOffer);
router.post('/offers/:id/duplicate', duplicateOffer);

// FAQs management
router.get('/faqs', listAdminFaqs);
router.post('/faqs', validate(createFaqSchema), createFaq);
router.put('/faqs/:id', validate(updateFaqSchema), updateFaq);
router.delete('/faqs/:id', deleteFaq);
router.patch('/faqs/reorder', validate(reorderFaqsSchema), reorderFaqs);

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

// Payments & Financial Ledger
router.get('/payments', getPaymentsList);
router.get('/payments/reconciliation', requireRole('owner'), getReconciliation);
router.post(
  '/payments/:id/refund',
  requireRole('owner'),
  validate(refundPaymentSchema),
  refundPayment
);
router.patch('/bookings/:id/mark-paid', markPaidAtShop);

// Packages & Membership Plans Management (Owner Only for modifications)
router.get('/packages', listPackages);
router.post('/packages', requireRole('owner'), validate(packageSchema), createPackage);
router.put('/packages/:id', requireRole('owner'), validate(updatePackageSchema), updatePackage);
router.delete('/packages/:id', requireRole('owner'), deletePackage);

router.get('/memberships', listMembershipPlans);
router.post('/memberships', requireRole('owner'), validate(membershipPlanSchema), createMembershipPlan);
router.put('/memberships/:id', requireRole('owner'), validate(updateMembershipPlanSchema), updateMembershipPlan);
router.delete('/memberships/:id', requireRole('owner'), deleteMembershipPlan);

// Customer Wallet & Benefit Redemptions
router.get('/customers/due-for-visit', getDueForVisitCustomers);
router.get('/customers/upcoming-birthdays', getUpcomingBirthdays);
router.get('/customers/:id/wallet', getCustomerWallet);
router.post('/customers/:id/packages', validate(sellPackageSchema), sellPackageToCustomer);
router.post('/customers/:id/memberships', validate(sellMembershipSchema), sellMembershipToCustomer);
router.post('/customers/:id/consume-session', validate(consumeSessionSchema), consumePackageSession);
router.post(
  '/customers/:id/reverse-session',
  requireRole('owner'),
  validate(reverseSessionSchema),
  reversePackageSession
);
router.post(
  '/customers/:id/reverse-membership',
  requireRole('owner'),
  validate(reverseMembershipSchema),
  reverseMembershipBenefit
);
router.post('/customers/:id/loyalty/adjust', validate(adjustLoyaltySchema), adjustLoyaltyStamps);
router.post('/customers/:id/loyalty/redeem', validate(redeemRewardSchema), redeemLoyaltyReward);
router.post(
  '/customers/:id/loyalty/reverse',
  requireRole('owner'),
  validate(reverseLoyaltySchema),
  reverseLoyaltyHistory
);
router.post('/customers/:id/wallet-token', generateWalletToken);
router.delete('/customers/:id/wallet-token', revokeWalletToken);

// Expiring wallet items & Wallet Reports
router.get('/wallet/expiring', getExpiringWalletItemsList);
router.get('/reports/wallet', requireRole('owner'), getWalletReport);

// SEO: Local Landing Pages (Areas)
router.get('/areas', getAdminAreas);
router.post('/areas', requireRole('owner'), validate(createAreaSchema), createArea);
router.put('/areas/:id', requireRole('owner'), validate(updateAreaSchema), updateArea);
router.delete('/areas/:id', requireRole('owner'), deleteArea);

// Blog Management
router.get('/posts', getAdminPosts);
router.post('/posts', validate(createPostSchema), createPost);
router.put('/posts/:id', validate(updatePostSchema), updatePost);
router.delete('/posts/:id', requireRole('owner'), deletePost);

// Technical SEO: Redirects
router.get('/redirects', getAdminRedirects);
router.post('/redirects', requireRole('owner'), validate(createRedirectSchema), createRedirect);
router.put('/redirects/:id', requireRole('owner'), validate(updateRedirectSchema), updateRedirect);
router.delete('/redirects/:id', requireRole('owner'), deleteRedirect);

// SEO Health Audit & GBP Optimization Helpers
router.get('/seo/health', getSeoHealthReport);
router.get('/seo/gbp', getGbpHelpers);

// Staff Users & Accounts (Owner Only)
router.get('/users', requireRole('owner'), listStaffUsers);
router.post('/users', requireRole('owner'), validate(createStaffSchema), createStaffUser);
router.patch('/users/:id', requireRole('owner'), validate(updateStaffSchema), updateStaffUser);
router.post(
  '/users/:id/reset-password',
  requireRole('owner'),
  validate(resetStaffPasswordSchema),
  resetStaffPassword
);

// Audit Logs (Owner Only)
router.get('/audit-logs', requireRole('owner'), getAuditLogs);

export default router;
