import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';

// Lazy-loaded route views
const HomePage = lazy(() => import('@/pages/HomePage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const BarbersPage = lazy(() => import('@/pages/BarbersPage'));
const BookAppointmentPage = lazy(() => import('@/pages/BookAppointmentPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const DesignSystemPage = lazy(() => import('@/pages/DesignSystemPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

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
        <Route element={<PageShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/barbers" element={<BarbersPage />} />
          <Route path="/book" element={<BookAppointmentPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
