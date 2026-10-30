import { Container, Section, SectionHeading } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Hero } from '@/features/home/Hero';
import { ServiceLocationSection } from '@/features/home/ServiceLocationSection';
import { siteConfig } from '@/config/site';

/**
 * Home Page
 * Full-screen Hero + Service Beyond Expectation dark-brown section + subsequent section skeletons
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

      {/* Dark Brown Section: Service Beyond Expectation + Map + Contact */}
      <ServiceLocationSection />

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
