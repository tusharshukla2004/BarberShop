import { Container, Section, SectionHeading } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Hero } from '@/features/home/Hero';
import { siteConfig } from '@/config/site';

/**
 * Home Page
 * Full-screen Hero with working appointment form + subsequent section skeletons
 * @returns {JSX.Element}
 */
export function HomePage() {
  return (
    <>
      <Seo
        title={`${siteConfig.name} - ${siteConfig.tagline}`}
        description={siteConfig.description}
      />

      {/* Hero with Appointment Request Card and Fluid Headline */}
      <Hero />

      {/* Dark Brown Section (Location / Services introduction) */}
      <Section tone="brown" py="lg">
        <Container>
          <SectionHeading
            subtitle="Master Craftsmanship"
            title="Location & Services"
            tone="dark"
            align="center"
          />
          <p className="max-w-2xl mx-auto text-center text-on-dark-muted mt-4 text-sm sm:text-base">
            Heritage barbering techniques honed over decades, paired with modern aesthetic
            precision.
          </p>
        </Container>
      </Section>

      {/* Cream Section (Works gallery slider placeholder) */}
      <Section tone="cream" py="lg">
        <Container>
          <SectionHeading subtitle="Our Works" title="Works & Testimonials" align="center" />
        </Container>
      </Section>

      {/* White Section (Team section) */}
      <Section tone="white" py="lg">
        <Container>
          <SectionHeading subtitle="The Team" title="Meet Our Barbers" align="center" />
        </Container>
      </Section>
    </>
  );
}

export default HomePage;
