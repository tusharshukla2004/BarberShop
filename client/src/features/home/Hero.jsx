import { Container } from '@/components/ui';
import { AppointmentForm } from '@/features/booking/AppointmentForm';
import { homeContent } from './content';
import { assets } from '@/assets';

/**
 * Home Hero section matching reference layout
 * Desktop: Left glass appointment card + mission paragraph; Bottom-right large fluid headline
 * Mobile: Headline first -> Form card -> Mission paragraph (no overlap)
 *
 * @returns {JSX.Element}
 */
export function Hero() {
  const { hero } = homeContent;

  return (
    <section className="relative w-full min-h-[100svh] min-h-[640px] flex items-center bg-ink text-white pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 overflow-hidden">
      {/* Background Hero Image with Dark Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={assets.heroBg}
          alt="Vintage Barbershop Interior"
          className="h-full w-full object-cover object-center opacity-40 scale-105 transition-transform duration-slow"
          loading="eager"
          fetchPriority="high"
        />
        {/* Multi-layered dark gradients for contrast and readability */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/60"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-transparent"
          aria-hidden="true"
        />
        {/* Subtle decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-15 bg-[radial-gradient(#F9A55A_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      <Container className="relative z-10 w-full flex-1 flex flex-col justify-center">
        {/* Responsive Grid / Flex System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Mobile Headline (Order 1 on mobile, hidden on lg desktop) */}
          <div className="lg:hidden flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {hero.badge}
            </span>
            <h1 className="font-display uppercase text-white leading-[0.95] tracking-wide text-[clamp(44px,11vw,72px)]">
              {hero.headline}
            </h1>
          </div>

          {/* Left Column: Glass Card + Mission Paragraph */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4">
            {/* Glass-style appointment card */}
            <div className="rounded-xl border border-white/20 bg-ink/75 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-black/60 transition-all duration-base">
              <div className="flex flex-col gap-1 mb-6 text-left">
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {hero.formSubtitle}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase leading-tight">
                  {hero.formTitle}
                </h2>
              </div>

              {/* Working Appointment Request Form */}
              <AppointmentForm />
            </div>

            {/* Mission paragraph below card */}
            <p className="text-xs sm:text-sm text-on-dark-muted leading-relaxed max-w-md px-1">
              {hero.mission}
            </p>
          </div>

          {/* Right Column (lg and up): Huge right-aligned headline */}
          <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-end items-end text-right pb-4">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-accent mb-4">
              {hero.badge}
            </span>
            <h1 className="font-display uppercase text-white leading-[0.92] tracking-wide text-right text-[clamp(48px,7.5vw,120px)] max-w-4xl select-none">
              {hero.headline}
            </h1>
            <p className="text-sm text-on-dark-muted font-body mt-6 max-w-lg text-right leading-relaxed">
              {hero.missionFooter}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
