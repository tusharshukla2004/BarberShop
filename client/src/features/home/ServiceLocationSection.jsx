import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { siteConfig } from '@/config/site';
import { homeContent } from './content';
import { ArrowRight, MapPin, Phone, Clock } from 'lucide-react';

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
 * Powered by Framer Motion scroll reveals
 *
 * @returns {JSX.Element}
 */
export function ServiceLocationSection() {
  const { serviceSection } = homeContent;

  return (
    <Section tone="brown" py="lg" id="service-location" className="overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Column 1: Heading Block (Mobile: 1st) */}
          <motion.div
            className="flex flex-col gap-6 text-left order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>

          {/* Column 2: Tinted Map (Mobile: 2nd) */}
          <motion.div
            className="w-full flex justify-center order-2"
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<MapSkeleton />}>
              <MapView directionsLabel={serviceSection.directions.label} />
            </Suspense>
          </motion.div>

          {/* Column 3: Contact Info Rows (Mobile: 3rd) */}
          <motion.div
            className="flex flex-col gap-8 order-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Row 1: Location */}
            <div className="flex items-start gap-4 pb-8 border-b border-border-dark group">
              {/* White rounded-lg icon tile */}
              <div className="h-12 w-12 rounded-lg bg-white text-ink flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-base">
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
            <div className="flex items-start gap-4 group">
              {/* White rounded-lg icon tile */}
              <div className="h-12 w-12 rounded-lg bg-white text-ink flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-base">
                <Phone className="h-6 w-6 text-accent" />
              </div>

              <div className="flex flex-col gap-2 text-left">
                <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight">
                  {serviceSection.info.phoneTitle}
                </h3>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                  className="text-xs sm:text-sm text-on-dark-muted hover:text-accent transition-colors font-mono"
                >
                  {siteConfig.phone}
                </a>

                {/* Operating hours table */}
                <div className="pt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-accent font-semibold uppercase tracking-wider mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Lounge Hours</span>
                  </div>
                  {siteConfig.hours.map((schedule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-6 text-xs text-on-dark-muted font-mono"
                    >
                      <span className="font-body text-white/85">{schedule.days}</span>
                      <span>{schedule.open} – {schedule.close}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}

export default ServiceLocationSection;
