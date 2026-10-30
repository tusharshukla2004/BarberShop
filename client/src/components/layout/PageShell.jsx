import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from '@/components/common/Toaster';
import { useScrollToTop } from '@/hooks/useScrollToTop';

/**
 * Root Layout wrapper providing Navbar, Skip Link, Main slot, Footer, and Toast notifications
 * @returns {JSX.Element}
 */
export function PageShell() {
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink antialiased">
      {/* Accessible skip-link for keyboard & screen reader navigation */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-accent text-ink px-4 py-2 font-semibold rounded-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-ink"
      >
        Skip to content
      </a>

      {/* Global Navigation Bar */}
      <Navbar />

      {/* Primary Main Content */}
      <main id="main" className="flex-1 focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Global Site Footer */}
      <Footer />

      {/* Global Toast Notification System */}
      <Toaster />
    </div>
  );
}

export default PageShell;
