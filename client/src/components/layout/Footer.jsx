import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/site';
import { Container, Button, IconButton } from '@/components/ui';
import {
  Scissors,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Clock,
} from 'lucide-react';

/**
 * Global site footer matching reference architecture
 * @returns {JSX.Element}
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const menuLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Shop', href: '/shop' },
    { label: 'Barbers', href: '/barbers' },
  ];

  const quickLinks = [
    { label: 'Services', href: '/services' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Location & Contact', href: '/contact' },
    { label: 'Design System', href: '/design-system' },
  ];

  return (
    <footer className="w-full bg-white text-ink border-t border-border-light">
      <Container className="py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          {/* Column 1: Brand & Contact Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-pill bg-accent/15 border border-accent/40 flex items-center justify-center text-accent">
                <Scissors className="h-5 w-5 text-accent" />
              </div>
              <span className="font-display text-2xl sm:text-3xl tracking-wide uppercase text-ink">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {siteConfig.description}
            </p>

            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-ink/80 mt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                  className="hover:text-accent transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-accent transition-colors"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Menu */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-xl uppercase tracking-wider text-ink">Menu</h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-accent transition-colors block py-0.5">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-xl uppercase tracking-wider text-ink">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-accent transition-colors block py-0.5">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Operational Hours & Booking CTA */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-xl uppercase tracking-wider text-ink flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Operational Hours
            </h3>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-muted">
              {siteConfig.hours.map((schedule) => (
                <div
                  key={schedule.days}
                  className="flex justify-between items-center py-1 border-b border-border-light"
                >
                  <span className="font-medium text-ink">{schedule.days}</span>
                  <span className="text-muted">{schedule.time}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button
                to={siteConfig.cta.href}
                variant="primary"
                size="md"
                className="w-full text-center"
              >
                Reserve now
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Visit Instagram page"
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(siteConfig.social.instagram, '_blank', 'noopener,noreferrer')
              }
            >
              <Instagram className="h-4 w-4" />
            </IconButton>
            <IconButton
              aria-label="Visit Facebook page"
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(siteConfig.social.facebook, '_blank', 'noopener,noreferrer')
              }
            >
              <Facebook className="h-4 w-4" />
            </IconButton>
            <IconButton
              aria-label="Visit Twitter profile"
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(siteConfig.social.twitter, '_blank', 'noopener,noreferrer')
              }
            >
              <Twitter className="h-4 w-4" />
            </IconButton>
            <IconButton
              aria-label="Visit YouTube channel"
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(siteConfig.social.youtube, '_blank', 'noopener,noreferrer')
              }
            >
              <Youtube className="h-4 w-4" />
            </IconButton>
          </div>

          <p className="text-xs text-muted text-center sm:text-right">
            &copy; {currentYear} {siteConfig.name}. All rights reserved. Precision & Grooming.
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
