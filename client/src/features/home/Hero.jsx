import { Container } from '@/components/ui';
import { AppointmentForm } from '@/features/booking/AppointmentForm';
import { homeContent } from './content';
import { assets } from '@/assets';

/**
 * Home Hero section matching reference design:
 * - High-res cinematographic barber background clearly visible
 * - Left: Glass Card ("Make an appoitment") + mission paragraph
 * - Bottom-Right: Exactly 2-line display headline ("WHERE TRADITION / MEETS MODERN STYLE")
 *   positioned down at the bottom so it does not obscure the barber and client
 *
 * @returns {JSX.Element}
 */
export function Hero() {
  const { hero } = homeContent;

  return (
    <section className="relative w-full min-h-[100svh] min-h-[680px] flex flex-col justify-end bg-ink text-white pt-24 sm:pt-28 pb-8 sm:pb-12 lg:pb-14 overflow-hidden">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={assets.heroBg}
          alt="Modern Mane Master Barber Lounge"
          className="h-full w-full object-cover object-[center_top] md:object-center brightness-95 sm:brightness-100"
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="1080"
        />
        {/* Soft edge vignettes to ensure text legibility while keeping the barber artwork vibrant */}
        <div
          className="absolute inset-y-0 left-0 w-full lg:w-1/2 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 inset-x-0 h-52 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      <Container className="relative z-10 w-full">
        {/* Responsive Grid System: aligned to bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Left Column: Glass Card + Mission Paragraph (Order-2 on mobile, Left on desktop via order-1 lg:col-span-5) */}
          <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col gap-3.5 max-w-md w-full">
            {/* Glass-style appointment card matching reference */}
            <div className="rounded-[28px] border border-white/20 bg-black/35 backdrop-blur-md p-6 sm:p-7 shadow-2xl transition-all duration-base">
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

          {/* Main Headline: strictly 2 lines, anchored low down at the bottom right */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-start lg:items-end text-left lg:text-right pb-2 sm:pb-3">
            <h1 className="font-display uppercase text-white leading-[0.88] tracking-wide text-left lg:text-right text-[clamp(38px,4.6vw,74px)] select-none drop-shadow-2xl">
              <span className="block whitespace-nowrap">WHERE TRADITION</span>
              <span className="block whitespace-nowrap">MEETS MODERN STYLE</span>
            </h1>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
