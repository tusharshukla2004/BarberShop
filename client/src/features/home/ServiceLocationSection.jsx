import { lazy, Suspense } from 'react';
import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { siteConfig } from '@/config/site';
import { homeContent } from './content';
import { ArrowRight, MapPin, Phone, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy-load MapView to optimize bundle & ensure safe testing
const MapView = lazy(() => import('@/components/common/MapView'));

/**
 * Loading fallback skeleton matching the MapView aspect ratios
 */
function MapSkeleton() {
  return (
    <div
      className="w-full rounded-lg border border-border-dark bg-ink/50 flex flex-col items-center justify-center aspect-[16/10] lg:aspect-[4/5] animate-pulse"
      aria-hidden="true"
    >
      <div className="h-8 w-8 rounded-pill bg-accent/20 flex items-center justify-center text-accent mb-2">
        <MapPin className="h-4 w-4" />
      </div>
      <span className="text-xs uppercase tracking-widest text-on-dark-muted">Loading Map...</span>
    </div>
  );
}

/**
 * Service & Location Section directly beneath the Hero
 * Features 3-column layout on desktop: Heading & CTA | Tinted Map | Location & Contact Info
 * Mobile order: Heading block -> Map -> Info
 *
 * @returns {JSX.Element}
 */
export function ServiceLocationSection() {
  const { serviceSection } = homeContent;

  return (
    <Section tone="brown" py="lg" id="service-location">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Column 1: Heading Block (Mobile: 1st) */}
          <div className="flex flex-col gap-6 text-left order-1">
            <SectionHeading
              subtitle={serviceSection.eyebrow}
              title={serviceSection.title}
              tone="dark"
              align="left"
              className="gap-3"
            />
            <p className="text-sm sm:text-base text-on-dark-muted font-body leading-relaxed max-w-lg">
              {serviceSection.description}
            </p>
            <div className="pt-2">
              <Button
                to={serviceSection.cta.href}
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                {serviceSection.cta.label}
              </Button>
            </div>
          </div>

          {/* Column 2: Tinted Map (Mobile: 2nd) */}
          <div className="w-full flex justify-center order-2">
            <Suspense fallback={<MapSkeleton />}>
              <MapView directionsLabel={serviceSection.directions.label} />
            </Suspense>
          </div>

          {/* Column 3: Contact Info Rows (Mobile: 3rd) */}
          <div className="flex flex-col gap-8 order-3">
            {/* Row 1: Location */}
            <div className="flex items-start gap-4 pb-8 border-b border-border-dark">
              {/* White rounded-lg icon tile */}
              <div className="h-12 w-12 rounded-lg bg-white text-ink flex items-center justify-center shrink-0 shadow-md">
                <MapPin className="h-6 w-6 text-accent" />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight">
                  {serviceSection.info.locationTitle}
                </h3>
                <p className="text-xs sm:text-sm text-on-dark-muted leading-relaxed max-w-xs">
                  {siteConfig.address}
                </p>
              </div>
            </div>

            {/* Row 2: Phone & Operational Hours */}
            <div className="flex items-start gap-4">
              {/* White rounded-lg icon tile */}
              <div className="h-12 w-12 rounded-lg bg-white text-ink flex items-center justify-center shrink-0 shadow-md">
                <Phone className="h-6 w-6 text-accent" />
              </div>

              <div className="flex flex-col gap-2 text-left">
                <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight">
                  {serviceSection.info.contactTitle}
                </h3>

                {/* Telephone Link */}
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                  className="text-accent hover:text-accent-hover font-semibold text-sm sm:text-base tracking-wide transition-colors"
                >
                  {siteConfig.phone}
                </a>

                {/* Hours List */}
                <div className="flex flex-col gap-1.5 mt-2">
                  {siteConfig.hours.map((schedule) => (
                    <div
                      key={schedule.days}
                      className={cn(
                        'flex items-center justify-between gap-4 text-xs text-on-dark-muted py-0.5'
                      )}
                    >
                      <span className="font-medium text-white/90">{schedule.days}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="h-3 w-3 text-accent" />
                        {schedule.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default ServiceLocationSection;
