import { Seo } from '@/components/common/Seo';
import { Hero } from '@/features/home/Hero';
import { ServiceLocationSection } from '@/features/home/ServiceLocationSection';
import { WorksPricingSection } from '@/features/home/WorksPricingSection';
import { TeamSection } from '@/features/barbers/TeamSection';
import { siteConfig } from '@/config/site';

/**
 * Home Page (Phase 1 Complete Home Experience)
 * 1. Hero with Working Appointment Form
 * 2. Service Beyond Expectation + Tinted Map + Contact Info
 * 3. Discover Our Works Slider + Testimonial Card + Our Prices
 * 4. Meet Our Experts (3 Barbers + Join Team Card)
 *
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

      {/* White Section: Meet Our Experts Team Grid */}
      <TeamSection />
    </>
  );
}

export default HomePage;
