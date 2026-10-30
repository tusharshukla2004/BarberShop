import { Container } from '@/components/ui';
import { AppointmentForm } from '@/features/booking/AppointmentForm';
import { homeContent } from './content';
import { assets } from '@/assets';

/**
 * Home Hero section matching reference design:
 * - High-res cinematographic barber background
 * - Left: Glass Card ("Make an appoitment") + mission paragraph
 * - Bottom-Right: 2-line display headline ("WHERE TRADITION / MEETS MODERN STYLE")
 *
 * @returns {JSX.Element}
 */
export function Hero() {
  const { hero } = homeContent;

  return (
    <section className="relative w-full min-h-[100svh] min-h-[640px] flex items-center bg-ink text-white pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 overflow-hidden">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={assets.heroBg}
          alt="Modern Mane Master Barber Lounge"
          className="h-full w-full object-cover object-[center_right] sm:object-center brightness-95 sm:brightness-100"
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="1080"
        />
        {/* Soft edge vignettes to ensure text legibility while keeping the barber artwork vibrant */}
        <div
          className="absolute inset-y-0 left-0 w-full lg:w-1/2 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/75 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      <Container className="relative z-10 w-full flex-1 flex flex-col justify-center">
        {/* Responsive Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Main Headline (Top on mobile via order-1, Bottom-Right on desktop via order-2 lg:col-span-7) */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-start lg:items-end text-left lg:text-right pb-2 sm:pb-6">
            <h1 className="font-display uppercase text-white leading-[0.92] tracking-wide text-left lg:text-right text-[clamp(44px,6.8vw,100px)] max-w-2xl select-none drop-shadow-2xl">
              WHERE TRADITION<br />
              MEETS MODERN STYLE
            </h1>
          </div>

          {/* Left Column: Glass Card + Mission Paragraph (Order-2 on mobile, Left on desktop via order-1 lg:col-span-5) */}
          <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col gap-3.5 max-w-md w-full">
            {/* Glass-style appointment card matching reference */}
            <div className="rounded-[28px] border border-white/20 bg-black/30 backdrop-blur-md p-6 sm:p-7 shadow-2xl transition-all duration-base">
              <h2 className="text-xl sm:text-2xl text-white font-normal tracking-wide mb-4">
                {hero.formTitle}
              </h2>

              {/* Working Appointment Request Form */}
              <AppointmentForm />
            </div>

            {/* Mission paragraph below card */}
            <p className="text-xs sm:text-[13px] text-white/75 font-normal leading-relaxed px-1">
              {hero.mission}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
