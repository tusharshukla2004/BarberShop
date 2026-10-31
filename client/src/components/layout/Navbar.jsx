import { NavLink, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { openMobileMenu } from '@/features/ui/uiSlice';
import { useScrolled } from '@/hooks/useScrolled';
import { siteConfig } from '@/config/site';
import { Button, IconButton, Container } from '@/components/ui';
import { MobileMenu } from './MobileMenu';
import { Scissors, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Global responsive navigation bar
 * Transparent over home hero, transitions to solid ink with backdrop blur
 * @returns {JSX.Element}
 */
export function Navbar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isScrolled = useScrolled(24);

  const isHome = location.pathname === '/';
  // Transparent only when on Home AND not scrolled past threshold
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      <header
        className={cn(
          'top-0 left-0 right-0 z-40 transition-all duration-base w-full text-white',
          isTransparent
            ? 'absolute bg-transparent py-5 sm:py-6'
            : 'fixed bg-ink/95 text-white backdrop-blur-md shadow-md py-3.5 sm:py-4 border-b border-border-dark'
        )}
      >
        <Container className="flex items-center justify-between">
          {/* Left: Brand Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 group text-white transition-opacity hover:opacity-90"
            aria-label={`${siteConfig.name} Home`}
          >
            <div className="h-9 w-9 rounded-pill bg-accent/15 border border-accent/40 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
              <Scissors className="h-5 w-5 text-accent" />
            </div>
            <span className="font-display text-2xl sm:text-3xl tracking-wide uppercase text-white">
              {siteConfig.name}
            </span>
          </NavLink>

          {/* Center (Desktop): Pill container for NavLinks */}
          <nav
            className="hidden lg:flex items-center gap-1 p-1 rounded-pill border border-white/20 bg-ink/60 backdrop-blur-md shadow-lg"
            aria-label="Main Navigation"
          >
            {siteConfig.navLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-xs uppercase tracking-wider font-semibold px-4 py-1.5 rounded-pill transition-all duration-fast select-none',
                    isActive
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right (Desktop): Admin Dashboard & Contact Us Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Button
              to="/admin"
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white font-medium text-xs tracking-wider uppercase px-3.5"
            >
              Admin Dashboard
            </Button>
            <Button
              to="/contact"
              variant="secondary"
              size="sm"
              className="bg-white text-ink border-white hover:bg-white/90 text-xs tracking-wider uppercase px-4"
            >
              Contact us
            </Button>
          </div>

          {/* Mobile Right: Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <IconButton
              aria-label="Open navigation menu"
              variant="outline"
              size="md"
              onClick={() => dispatch(openMobileMenu())}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </IconButton>
          </div>
        </Container>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileMenu />
    </>
  );
}

export default Navbar;
