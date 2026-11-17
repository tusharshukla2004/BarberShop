import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/site';
import { Container, IconButton } from '@/components/ui';
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
  Navigation,
} from 'lucide-react';
import { useGetPublicAreasQuery } from '@/features/seo/seoApi';
import { trackEvent } from '@/lib/analytics';

/**
 * Global site footer matching reference architecture
 * @returns {JSX.Element}
 */
export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: areas = [] } = useGetPublicAreasQuery();

  const menuLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Offers', href: '/offers' },
    { label: 'Shop', href: '/shop' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Grooming Journal', href: '/blog' },
  ];

  const quickLinks = [
    { label: 'Services', href: '/services' },
    { label: 'Editorial Blog', href: '/blog' },
    { label: 'Location & Contact', href: '/contact' },
    { label: 'Design System', href: '/design-system' },
  ];

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${siteConfig.location.lat},${siteConfig.location.lng}`;

  return (
    <footer className="w-full bg-white text-ink border-t border-border-light">
      <Container className="py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Column 1: Brand & Visit Information */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-pill bg-accent/15 border border-accent/40 flex items-center justify-center text-accent">
                <Scissors className="h-5 w-5 text-accent" />
              </div>
              <span className="font-display text-xl sm:text-2xl tracking-wide uppercase text-ink">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {siteConfig.description}
            </p>

            <div className="flex flex-col gap-2 text-xs sm:text-sm text-ink/80 mt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-display text-base uppercase tracking-wider text-ink">
                    Visit Us
                  </h3>
                  <span>{siteConfig.address}</span>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:text-accent-hover transition-colors"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Get directions
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                  onClick={() => trackEvent('call_click', { channel: 'footer' })}
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
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-ink">Menu</h3>
            <ul className="flex flex-col gap-1.5 text-xs sm:text-sm text-muted">
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
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-ink">Quick Links</h3>
            <ul className="flex flex-col gap-1.5 text-xs sm:text-sm text-muted">
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
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-ink flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Operational Hours
            </h3>
            <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted">
              {siteConfig.hours.map((schedule) => (
                <div
                  key={schedule.days}
                  className="flex justify-between items-center py-0.5 border-b border-border-light"
                >
                  <span className="font-medium text-ink">{schedule.days}</span>
                  <span className="text-muted">{schedule.time}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Areas We Serve (Internal Linking) */}
        {areas.length > 0 && (
          <div className="mt-8 pt-5 border-t border-border-light">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-accent" />
              <h4 className="font-display text-base uppercase tracking-wider text-ink">
                Neighborhood Areas We Serve
              </h4>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {areas.map((area) => (
                <Link
                  key={area.slug}
                  to={`/locations/${area.slug}`}
                  className="px-3 py-1 rounded bg-surface border border-border-light text-muted hover:text-accent hover:border-accent transition-colors"
                >
                  Haircut in {area.name?.en}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
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
