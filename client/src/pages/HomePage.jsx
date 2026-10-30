import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { siteConfig } from '@/config/site';
import { Calendar, ArrowRight, Scissors } from 'lucide-react';

/**
 * Home Page Placeholder
 * Features a full-height hero section to verify transparent-to-solid navbar transition
 * @returns {JSX.Element}
 */
export function HomePage() {
  return (
    <>
      <Seo
        title={`${siteConfig.name} - Classic Barber & Grooming Lounge`}
        description={siteConfig.description}
      />

      {/* Hero Showcase (Navbar is transparent over this) */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-ink text-white pt-28 pb-16 overflow-hidden">
        {/* Subtle patterned overlay */}
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#F9A55A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
          aria-hidden="true"
        />

        <Container className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill border border-accent/40 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-6">
            <Scissors className="h-3.5 w-3.5" />
            <span>Classic Craftsmanship &bull; Modern Mastery</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight uppercase leading-none max-w-5xl">
            Precision Cuts & Traditional Grooming
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-on-dark-muted font-body leading-relaxed">
            Welcome to {siteConfig.name}. Step into timeless luxury where every trim, fade, and hot
            towel shave is executed with surgical dedication.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button
              to="/book"
              variant="primary"
              size="lg"
              rightIcon={<Calendar className="h-5 w-5" />}
            >
              Book Appointment
            </Button>
            <Button
              to="/services"
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Explore Services
            </Button>
          </div>
        </Container>
      </section>

      {/* Dark Brown Section (Follows Hero in design spec) */}
      <Section tone="brown" py="lg">
        <Container>
          <SectionHeading
            subtitle="Master Craftsmanship"
            title="Premium Barbershop Experience"
            tone="dark"
            align="center"
          />
          <p className="max-w-2xl mx-auto text-center text-on-dark-muted mt-4 text-sm sm:text-base">
            Scroll down to observe the Navbar dynamically transitioning from transparent to solid
            ink with backdrop blur.
          </p>
        </Container>
      </Section>

      {/* Cream Section */}
      <Section tone="cream" py="lg">
        <Container>
          <SectionHeading
            subtitle="Our Works"
            title="Artisanal Portfolio & Grooming"
            align="center"
          />
        </Container>
      </Section>

      {/* White Section */}
      <Section tone="white" py="lg">
        <Container>
          <SectionHeading subtitle="The Team" title="Meet Our Master Barbers" align="center" />
        </Container>
      </Section>
    </>
  );
}

export default HomePage;
