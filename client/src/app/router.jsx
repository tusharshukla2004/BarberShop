import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';

// Public route views
const HomePage = lazy(() => import('@/pages/HomePage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const BarbersPage = lazy(() => import('@/pages/BarbersPage'));
const BookAppointmentPage = lazy(() => import('@/pages/BookAppointmentPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const OffersPage = lazy(() => import('@/pages/OffersPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const PublicQueuePage = lazy(() => import('@/pages/PublicQueuePage'));
const PublicWalletPage = lazy(() => import('@/pages/public/PublicWalletPage'));
const BlogListPage = lazy(() => import('@/pages/public/BlogListPage'));
const BlogPostDetailPage = lazy(() => import('@/pages/public/BlogPostDetailPage'));
const AreaLandingPage = lazy(() => import('@/pages/public/AreaLandingPage'));
const ManageBookingPage = lazy(() => import('@/pages/public/ManageBookingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Admin portal route views (lazy-loaded chunks)
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const ProtectedRoute = lazy(() => import('@/features/admin/ProtectedRoute'));
const RoleRoute = lazy(() => import('@/features/admin/RoleRoute'));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminChangePasswordPage = lazy(() => import('@/pages/admin/AdminChangePasswordPage'));
const AdminStaffUsersPage = lazy(() => import('@/pages/admin/AdminStaffUsersPage'));
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AdminAuditLogsPage'));
const AdminQueuePage = lazy(() => import('@/pages/admin/AdminQueuePage'));
const AdminBookingsPage = lazy(() => import('@/pages/admin/AdminBookingsPage'));
const AdminRemindersPage = lazy(() => import('@/pages/admin/AdminRemindersPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/AdminCustomerDetailPage'));
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'));
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage'));
const AdminPackagesPlansPage = lazy(() => import('@/pages/admin/AdminPackagesPlansPage'));
const AdminOffersPage = lazy(() => import('@/pages/admin/AdminOffersPage'));
const AdminFaqsPage = lazy(() => import('@/pages/admin/AdminFaqsPage'));
const AdminServicesPage = lazy(() => import('@/pages/admin/AdminServicesPage'));
const AdminBarbersPage = lazy(() => import('@/pages/admin/AdminBarbersPage'));
const AdminGalleryPage = lazy(() => import('@/pages/admin/AdminGalleryPage'));
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminSeoPage = lazy(() => import('@/pages/admin/AdminSeoPage'));
const AdminBlogPage = lazy(() => import('@/pages/admin/AdminBlogPage'));

/**
 * Route loading skeleton fallback
 */
function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-pill border-2 border-accent border-t-transparent"
          aria-label="Loading page content..."
        />
        <span className="text-xs uppercase tracking-widest text-muted font-semibold">
          Loading...
        </span>
      </div>
    </div>
  );
}

/**
 * Global Application Router
 * @returns {JSX.Element}
 */
export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Console Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* General Staff Routes (Owner & Barbers) */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/queue" element={<AdminQueuePage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/reminders" element={<AdminRemindersPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
            <Route path="/admin/change-password" element={<AdminChangePasswordPage />} />

            {/* Owner-Only Routes */}
            <Route element={<RoleRoute requiredRole="owner" />}>
              <Route path="/admin/staff" element={<AdminStaffUsersPage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/packages-plans" element={<AdminPackagesPlansPage />} />
              <Route path="/admin/offers" element={<AdminOffersPage />} />
              <Route path="/admin/faqs" element={<AdminFaqsPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route path="/admin/barbers" element={<AdminBarbersPage />} />
              <Route path="/admin/gallery" element={<AdminGalleryPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/seo" element={<AdminSeoPage />} />
              <Route path="/admin/blog" element={<AdminBlogPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Public Storefront Routes */}
        <Route element={<PageShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking/manage" element={<ManageBookingPage />} />
          <Route path="/wallet/:token" element={<PublicWalletPage />} />
          <Route path="/queue" element={<PublicQueuePage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
          <Route path="/locations/:areaSlug" element={<AreaLandingPage />} />
          <Route path="/locations/:areaSlug/:serviceSlug" element={<AreaLandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/barbers" element={<BarbersPage />} />
          <Route path="/book" element={<BookAppointmentPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
