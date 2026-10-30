import { Container, Section, SectionHeading } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Hero } from '@/features/home/Hero';
import { ServiceLocationSection } from '@/features/home/ServiceLocationSection';
import { WorksPricingSection } from '@/features/home/WorksPricingSection';
import { siteConfig } from '@/config/site';

/**
 * Home Page
 * Full-screen Hero + Service & Location + Works Gallery & Prices + Team Skeleton
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

      {/* Cream Section: Works Gallery Slider + Testimonial Card + Price List */}
      <WorksPricingSection />

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
