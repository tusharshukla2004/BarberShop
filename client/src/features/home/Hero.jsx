import { Container } from '@/components/ui';
import { AppointmentForm } from '@/features/booking/AppointmentForm';
import { homeContent } from './content';
import { assets } from '@/assets';

/**
 * Home Hero section matching reference layout exactly:
 * - Full-width background image with barber cutting client's hair
 * - Left column: Rounded-3xl translucent glass card titled "Make an appointment",
 *   form inputs, and mission paragraph below card
 * - Right column: Large right-aligned two-line headline "WHERE TRADITION MEETS MODERN STYLE"
 *
 * @returns {JSX.Element}
 */
export function Hero() {
  const { hero } = homeContent;

  return (
    <section className="relative w-full min-h-[100svh] min-h-[640px] flex items-center bg-ink text-white pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 overflow-hidden">
      {/* Background Hero Image matching reference */}
      <div className="absolute inset-0 z-0">
        <img
          src={assets.heroBg}
          alt="Modern Mane vintage barbershop"
          className="h-full w-full object-cover object-[center_20%] lg:object-center"
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="1080"
        />
        {/* Subtle dark gradient overlay to ensure text and card contrast */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/90 via-black/30 to-black/40 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      <Container className="relative z-10 w-full flex-1 flex flex-col justify-center">
        {/* Responsive Grid System matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          {/* Main Headline (Top on mobile via order-1, Right-aligned on desktop via order-2 lg:col-span-7) */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-start lg:items-end text-left lg:text-right pb-0 lg:pb-8">
            <h1 className="font-display uppercase text-white leading-[0.92] tracking-wide text-left lg:text-right text-[clamp(44px,7.8vw,110px)] max-w-3xl select-none drop-shadow-lg">
              WHERE TRADITION<br className="hidden sm:inline" /> MEETS MODERN STYLE
            </h1>
          </div>

          {/* Left Column: Glass Card + Mission Paragraph (Order-2 on mobile, Left on desktop via order-1 lg:col-span-5) */}
          <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col gap-4">
            {/* Glass-style appointment card matching reference screenshot */}
            <div className="rounded-[28px] border border-white/25 bg-black/40 backdrop-blur-md p-6 sm:p-7 shadow-2xl transition-all duration-base">
              <h2 className="text-xl sm:text-2xl text-white font-normal tracking-wide mb-5 text-left">
                {hero.formTitle}
              </h2>

              {/* Working Appointment Request Form */}
              <AppointmentForm />
            </div>

            {/* Mission paragraph below card matching reference screenshot */}
            <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed max-w-md px-1 font-normal">
              {hero.mission}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
