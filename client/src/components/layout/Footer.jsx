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
  MessageSquare,
  Navigation,
} from 'lucide-react';
import { normalizeIndianPhone, buildWhatsAppLink } from '@/lib/whatsapp';
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

  const phone = normalizeIndianPhone(siteConfig.whatsapp) || '919876543210';
  const whatsappUrl = buildWhatsAppLink(
    phone,
    `Hello ${siteConfig.name}, I would like to inquire about appointments and services.`
  );

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { channel: 'footer' });
  };

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

            <div className="pt-2 flex flex-col gap-2">
              <Button
                to={siteConfig.cta.href}
                variant="primary"
                size="md"
                className="w-full text-center"
              >
                Reserve now
              </Button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-[#25D366] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#1EBE5D] transition-colors shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Areas We Serve (Internal Linking) */}
        {areas.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border-light">
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
        <div className="mt-8 pt-8 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
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
