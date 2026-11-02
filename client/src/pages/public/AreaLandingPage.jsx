import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Navigation,
  Calendar,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Seo from '@/components/common/Seo';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import QueryState from '@/components/common/QueryState';
import { useGetAreaBySlugQuery } from '@/features/seo/seoApi';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import { useAppDispatch } from '@/app/hooks';
import { selectService } from '@/features/booking/bookingDraftSlice';

export default function AreaLandingPage() {
  const { areaSlug, serviceSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data, isLoading, isError, error } = useGetAreaBySlugQuery({
    areaSlug,
    serviceSlug,
  });

  const area = data?.area;
  const selectedService = data?.selectedService;
  const allServices = data?.allServices || [];
  const nearbyAreas = data?.nearbyAreas || [];

  const handleBookNow = (service = null) => {
    const targetService = service || selectedService;
    trackEvent('booking_started', {
      source: 'area_landing_page',
      area: area?.slug,
      service: targetService?.id || targetService?._id,
    });

    if (targetService) {
      dispatch(selectService(targetService.id || targetService._id));
    }
    navigate('/book');
  };

  const handleDirectionsClick = () => {
    trackEvent('directions_click', {
      source: 'area_landing_page',
      area: area?.slug,
    });
  };

  const areaSchema = useMemo(() => {
    if (!area) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'BarberShop',
      name: `Modern Mane Luxury Barber Studio - ${area.name?.en}`,
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
      description: area.description?.en,
      url: `${siteConfig.url}/locations/${area.slug}${selectedService ? `/${selectedService.slug || selectedService.id}` : ''}`,
      telephone: siteConfig.phone,
      priceRange: '₹₹',
      areaServed: {
        '@type': 'AdministrativeArea',
        name: area.name?.en,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '42 Heritage Lane, Near Clock Tower',
        addressLocality: 'Bandra West, Mumbai',
        postalCode: '400050',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: siteConfig.location.lat,
        longitude: siteConfig.location.lng,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '20:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday', 'Sunday'],
          opens: '09:00',
          closes: '21:00',
        },
      ],
    };
  }, [area, selectedService]);

  if (isLoading || isError || !area) {
    return (
      <Container className="py-16">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!area}
          emptyMessage="This neighborhood landing page is not currently published or pending content review."
        />
      </Container>
    );
  }

  const pageTitle = selectedService
    ? `${selectedService.name} in ${area.name?.en}`
    : `Gentlemen's Haircut & Grooming in ${area.name?.en}`;

  const metaTitle = area.seoTitle?.en || `${pageTitle} | Modern Mane Studio`;
  const metaDescription =
    area.seoDescription?.en ||
    `Visit Modern Mane for master haircuts, fades, and hot towel straight razor shaves near ${area.name?.en}. Convenient directions from ${area.landmarks?.join(', ')}. Book online.`;

  const breadcrumbItems = [
    { label: 'Locations', href: '/locations' },
    { label: area.name?.en, href: `/locations/${area.slug}` },
    ...(selectedService ? [{ label: selectedService.name }] : []),
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Seo
        title={metaTitle}
        description={metaDescription}
        canonical={`/locations/${area.slug}${selectedService ? `/${selectedService.slug || selectedService.id}` : ''}`}
        schema={areaSchema}
      />

      <div className="bg-ink text-white pt-24 pb-12 sm:pt-28 sm:pb-16 border-b border-border-dark relative overflow-hidden">
        {/* Subtle luxury ambient glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative z-10">
          <Breadcrumbs items={breadcrumbItems} tone="dark" />

          <div className="max-w-3xl space-y-4 mt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> Neighborhood Service Hub · {area.name?.en}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wider text-white">
              {pageTitle}
            </h1>

            <p className="text-sm sm:text-base text-white/75 leading-relaxed font-sans">
              {area.description?.en}
            </p>

            {area.name?.hi && (
              <p className="text-xs text-accent/80 font-sans italic border-l-2 border-accent pl-3">
                {area.description?.hi}
              </p>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => handleBookNow()} className="shadow-lg">
                <Calendar className="w-4 h-4 mr-2" /> Book Your Appointment
              </Button>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${siteConfig.name} ${siteConfig.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDirectionsClick}
                className="inline-flex items-center justify-center px-4 py-2 rounded font-semibold text-xs border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                <Navigation className="w-4 h-4 mr-2 text-accent" /> Get Directions
              </a>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12 space-y-12">
        {/* Selected Service Card if combination page */}
        {selectedService && (
          <Card className="p-6 border-accent/40 bg-accent/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
                  Featured Service for {area.name?.en}
                </span>
                <h2 className="text-2xl font-serif font-bold text-ink">{selectedService.name}</h2>
                <p className="text-xs text-muted mt-1 max-w-xl">{selectedService.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-ink font-semibold">
                  <span>Price: ₹{selectedService.price}</span>
                  <span>·</span>
                  <span>Duration: {selectedService.durationMinutes || 45} mins</span>
                </div>
              </div>
              <Button onClick={() => handleBookNow(selectedService)}>Book This Service</Button>
            </div>
          </Card>
        )}

        {/* Directions & How to Reach */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
              <Navigation className="w-5 h-5 text-accent" /> How to Reach from {area.name?.en}
            </h2>
            <div className="text-xs sm:text-sm text-muted leading-relaxed space-y-3">
              <p>{area.directions?.en}</p>
              {area.directions?.hi && (
                <p className="italic text-accent/90">{area.directions?.hi}</p>
              )}
            </div>

            {area.landmarks?.length > 0 && (
              <div className="pt-3 border-t border-border-light">
                <span className="text-xs font-semibold text-ink block mb-1.5">
                  Prominent Nearby Landmarks:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {area.landmarks.map((landmark) => (
                    <span
                      key={landmark}
                      className="px-2 py-0.5 rounded text-[11px] bg-surface font-mono text-ink border border-border-light"
                    >
                      📍 {landmark}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" /> Studio Hours & Amenities
            </h2>
            <div className="space-y-2 text-xs">
              {siteConfig.hours.map((h) => (
                <div key={h.days} className="flex justify-between py-1 border-b border-border-light">
                  <span className="text-ink font-medium">{h.days}</span>
                  <span className="text-muted font-mono">{h.time}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2 text-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Complimentary Valet Parking
              </div>
              <div className="flex items-center gap-2 text-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chilled Cold Brew & Espresso Bar
              </div>
              <div className="flex items-center gap-2 text-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Digital Wallet & Loyalty Punchcards
              </div>
            </div>
          </Card>
        </div>

        {/* Area Specific FAQs */}
        {area.faqs?.length > 0 && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h2 className="text-2xl font-serif font-bold text-ink">Frequently Asked Questions</h2>
              <p className="text-xs text-muted">
                Common questions for clients traveling to Modern Mane from {area.name?.en}.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {area.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-border-light bg-card p-4 transition-all duration-200 open:border-accent/40"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-xs sm:text-sm font-semibold text-ink group-open:text-accent">
                    <span>{faq.question?.en}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180 text-muted" />
                  </summary>
                  <div className="mt-2.5 text-xs text-muted leading-relaxed border-t border-border-light/60 pt-2.5">
                    <p>{faq.answer?.en}</p>
                    {faq.answer?.hi && <p className="italic text-accent/80 mt-1">{faq.answer?.hi}</p>}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related Services in this Area */}
        <div className="space-y-4 pt-4 border-t border-border-light">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-ink">
              Popular Services Available for {area.name?.en}
            </h2>
            <Link to="/services" className="text-xs text-accent font-semibold hover:underline">
              View All Services →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allServices.slice(0, 6).map((service) => {
              const serviceSlugVal = service.slug || service.id;
              return (
                <Card key={service.id || service._id} className="p-4 hover:border-accent/50 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-ink text-sm">{service.name}</h3>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{service.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border-light flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-ink">₹{service.price}</span>
                    <div className="flex gap-2">
                      <Link
                        to={`/locations/${area.slug}/${serviceSlugVal}`}
                        className="text-[11px] text-muted hover:text-accent underline"
                      >
                        Info
                      </Link>
                      <Button size="sm" onClick={() => handleBookNow(service)} className="text-[11px] h-7 px-2.5">
                        Book
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Nearby Areas We Serve (Internal Linking) */}
        {nearbyAreas.length > 0 && (
          <div className="p-6 rounded-lg bg-surface/60 border border-border-light text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold block">
              Other Neighborhoods We Serve
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {nearbyAreas.map((near) => (
                <Link
                  key={near.slug}
                  to={`/locations/${near.slug}`}
                  className="px-3 py-1 rounded bg-card border border-border-light text-xs text-ink hover:border-accent hover:text-accent transition-colors"
                >
                  {near.name?.en}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

