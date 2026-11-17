import { Seo } from '@/components/common/Seo';
import { Hero } from '@/features/home/Hero';
import { LiveQueueCard } from '@/features/queue/LiveQueueCard';
import { Container } from '@/components/ui';
import { WorksPricingSection } from '@/features/home/WorksPricingSection';
import { GalleryShowcaseSection } from '@/features/home/GalleryShowcaseSection';
import { TeamSection } from '@/features/barbers/TeamSection';
import { ProductsShowcaseSection } from '@/features/shop/ProductsShowcaseSection';
import { ClosingCtaSection } from '@/features/home/ClosingCtaSection';
import { siteConfig } from '@/config/site';
import { MessageCircle } from 'lucide-react';
import { normalizeIndianPhone, buildWhatsAppLink } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

/**
 * Home Page (Phase 1 Complete Home Experience)
 * 1. Hero with Working Appointment Form
 * 2. Discover Our Works Slider + Testimonial Card + Our Prices
 * 3. Full-bleed barber gallery
 * 4. Meet Our Experts (3 Barbers + Join Team Card)
 * 5. Curated Barbershop Apothecary Products
 * 6. Closing CTA Band
 *
 * @returns {JSX.Element}
 */
export function HomePage() {
  const whatsappNumber = normalizeIndianPhone(siteConfig.whatsapp);
  const whatsappUrl = buildWhatsAppLink(
    whatsappNumber,
    `Hello ${siteConfig.name}, I would like to inquire about appointments and services.`
  );

  return (
    <>
      <Seo
        title={`${siteConfig.name} - ${siteConfig.tagline}`}
        description={siteConfig.description}
        canonical="/"
        includeSchema={true}
      />

      {/* Hero with Appointment Request Card and Fluid Headline */}
      <Hero />

      {/* Live Walk-in Queue Status Card */}
      <div className="bg-sand/40 py-4 border-b border-border">
        <Container>
          <LiveQueueCard />
        </Container>
      </div>

      {/* Cream Section: Works Gallery Slider + Testimonial Card + Price List */}
      <WorksPricingSection />

      {/* Full-bleed barber gallery with opposing scroll-linked rows */}
      <GalleryShowcaseSection />

      {/* White Section: Meet Our Experts Team Grid */}
      <TeamSection />

      {/* Cream Section: Curated Apothecary & Grooming Products */}
      <ProductsShowcaseSection tone="cream" limit={12} />

      {/* Dark Ink Closing Call to Action */}
      <ClosingCtaSection />

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          title="Chat with us on WhatsApp"
          onClick={() => trackEvent('whatsapp_click', { channel: 'homepage' })}
          className="fixed right-4 bottom-8 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 hover:bg-[#1EBE5D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 lg:flex"
        >
          <MessageCircle className="h-7 w-7" aria-hidden="true" />
        </a>
      )}
    </>
  );
}

export default HomePage;
