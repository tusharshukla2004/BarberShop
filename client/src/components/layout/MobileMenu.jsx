import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectMobileMenuOpen, closeMobileMenu } from '@/features/ui/uiSlice';
import { siteConfig } from '@/config/site';
import { IconButton, Button } from '@/components/ui';
import { X, Phone, Mail, MapPin, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Full-screen accessible mobile navigation drawer
 * @returns {JSX.Element | null}
 */
export function MobileMenu() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectMobileMenuOpen);
  const location = useLocation();
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Auto-close on route change
  useEffect(() => {
    if (isOpen) {
      dispatch(closeMobileMenu());
    }
  }, [location.pathname, dispatch, isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Escape key handler & Focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        dispatch(closeMobileMenu());
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the close button when opened
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      ref={drawerRef}
      className="fixed inset-0 z-50 flex flex-col bg-ink text-white animate-in fade-in duration-base overflow-y-auto"
    >
      {/* Top Bar with Brand & Close */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-dark">
        <NavLink
          to="/"
          onClick={() => dispatch(closeMobileMenu())}
          className="flex items-center gap-2 text-white"
        >
          <Scissors className="h-6 w-6 text-accent" />
          <span className="font-display text-2xl tracking-wide uppercase">{siteConfig.name}</span>
        </NavLink>
        <IconButton
          ref={closeBtnRef}
          aria-label="Close navigation menu"
          variant="outline"
          size="md"
          onClick={() => dispatch(closeMobileMenu())}
          className="text-white hover:text-accent border-border-dark"
        >
          <X className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-6 py-8 flex flex-col justify-between">
        <nav className="flex flex-col gap-4" aria-label="Mobile Navigation">
          {siteConfig.navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              onClick={() => dispatch(closeMobileMenu())}
              className={({ isActive }) =>
                cn(
                  'font-display text-3xl sm:text-4xl tracking-wider uppercase py-2 transition-colors duration-fast',
                  isActive
                    ? 'text-accent border-b border-accent/30'
                    : 'text-white/80 hover:text-white'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/contact"
            onClick={() => dispatch(closeMobileMenu())}
            className={({ isActive }) =>
              cn(
                'font-display text-3xl sm:text-4xl tracking-wider uppercase py-2 transition-colors duration-fast',
                isActive
                  ? 'text-accent border-b border-accent/30'
                  : 'text-white/80 hover:text-white'
              )
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Contact info & CTA */}
        <div className="mt-8 pt-8 border-t border-border-dark flex flex-col gap-6">
          <Button
            to={siteConfig.cta.href}
            variant="primary"
            size="lg"
            className="w-full text-center"
            onClick={() => dispatch(closeMobileMenu())}
          >
            {siteConfig.cta.label}
          </Button>

          <div className="flex flex-col gap-3 text-xs text-on-dark-muted">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-accent shrink-0" />
              <span>{siteConfig.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-accent shrink-0" />
              <span>{siteConfig.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-accent shrink-0" />
              <span>{siteConfig.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
