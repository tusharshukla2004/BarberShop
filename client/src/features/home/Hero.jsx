import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { Button, Container } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { AppointmentForm } from '@/features/booking/AppointmentForm';
import { BARBER_GALLERY_IMAGES, BARBER_HERO_BACKGROUND_IMAGE } from '@/assets';
import { homeContent } from './content';

const HERO_GALLERY_IMAGES = [
  BARBER_GALLERY_IMAGES[0],
  BARBER_GALLERY_IMAGES[1],
  BARBER_GALLERY_IMAGES[3],
  BARBER_GALLERY_IMAGES[5],
  BARBER_GALLERY_IMAGES[4],
];

const BOOKING_POPUP_DELAY = 3.5 * 60 * 1000;
const HERO_IMAGE_INTERVAL = 5_000;
// Set to true to restore the hero image slideshow.
const SHOW_HERO_GALLERY = false;

export function Hero() {
  const { hero } = homeContent;
  const [activeImage, setActiveImage] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!SHOW_HERO_GALLERY) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % HERO_GALLERY_IMAGES.length);
    }, HERO_IMAGE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isBookingOpen) return undefined;

    const timeoutId = window.setTimeout(() => setIsBookingOpen(true), BOOKING_POPUP_DELAY);
    return () => window.clearTimeout(timeoutId);
  }, [isBookingOpen]);

  const appointmentButton = (
    <Button
      type="button"
      variant="accent"
      size="lg"
      leftIcon={<CalendarDays className="h-4 w-4" />}
      onClick={() => setIsBookingOpen(true)}
      className="w-full self-center justify-center text-center sm:w-fit"
    >
      Book an appointment
    </Button>
  );

  return (
    <>
      <section className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden bg-ink pt-24 text-white sm:pt-28">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.06, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <img
            src={BARBER_HERO_BACKGROUND_IMAGE}
            alt=""
            className="h-full w-full object-cover object-center brightness-100"
            loading="eager"
            fetchPriority="high"
            width="1920"
            height="1080"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
        </motion.div>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_24%_50%,rgba(249,165,90,0.08),transparent_58%)]"
          aria-hidden="true"
        />
        <Container className="relative z-10 w-full py-6 sm:py-8 lg:py-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <motion.div
              className="order-2 mx-auto flex w-full max-w-[500px] flex-col gap-3 lg:order-1 lg:col-span-5 lg:mx-0 lg:max-w-[400px]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
            >
              {SHOW_HERO_GALLERY && (
                <div className="relative isolate">
                  <div
                    className="pointer-events-none absolute -inset-3 -z-10 rounded-[1.75rem] bg-[radial-gradient(ellipse_at_center,rgba(249,165,90,0.16),rgba(249,165,90,0.04)_55%,transparent_78%)] blur-xl"
                    aria-hidden="true"
                  />
                  <div
                    role="region"
                    aria-roledescription="book-style photo gallery"
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-accent/20 bg-black/70 shadow-[0_20px_56px_rgba(0,0,0,0.38)] [perspective:1600px] sm:aspect-[16/10] lg:h-[min(52svh,420px)] lg:aspect-auto"
                    aria-label="Barbershop photo showcase"
                  >
                <AnimatePresence initial={false} mode="sync">
                      <motion.div
                        key={activeImage}
                        className="absolute inset-0"
                        initial={{
                          rotateY: prefersReducedMotion ? 0 : 85,
                          opacity: prefersReducedMotion ? 0 : 0.8,
                        }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{
                          rotateY: prefersReducedMotion ? 0 : -85,
                          opacity: prefersReducedMotion ? 0 : 0.8,
                        }}
                        transition={{
                          duration: prefersReducedMotion ? 0.2 : 0.9,
                          ease: [0.22, 0.7, 0.25, 1],
                        }}
                        style={{
                          transformOrigin: 'left center',
                          transformStyle: 'preserve-3d',
                          backfaceVisibility: 'hidden',
                        }}
                      >
                        <img
                          src={HERO_GALLERY_IMAGES[activeImage].src}
                          alt={HERO_GALLERY_IMAGES[activeImage].alt}
                          className="h-full w-full object-cover object-top"
                          loading={activeImage === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          draggable="false"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10"
                          aria-hidden="true"
                        />
                      </motion.div>
                </AnimatePresence>
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-2 border-r border-white/15 bg-gradient-to-r from-black/50 to-transparent"
                  aria-hidden="true"
                />
                  <div
                    className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-[radial-gradient(ellipse_at_center,transparent_62%,rgba(12,10,9,0.24)_100%)]"
                    aria-hidden="true"
                  />
                  </div>
                </div>
              )}
              {SHOW_HERO_GALLERY ? (
                <>
                  <p className="w-full max-w-[380px] text-center text-sm leading-relaxed text-white/75 lg:text-left">
                    {hero.mission}
                  </p>
                  {appointmentButton}
                </>
              ) : (
                <div className="relative mt-8 flex w-full flex-col items-center justify-center gap-5 text-center sm:mt-10 lg:mt-12 lg:translate-y-7">
                  <p className="max-w-[380px] text-sm leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] sm:text-base uppercase">
                    {hero.mission}
                  </p>
                  {appointmentButton}
                </div>
              )}
            </motion.div>

            <div className="order-1 flex translate-y-10 flex-col items-start pb-2 text-left lg:order-2 lg:col-span-7 lg:translate-y-20 lg:items-end lg:text-right">
              <motion.div
                className="mb-4 inline-flex select-none items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3.5 py-1.5 shadow-lg backdrop-blur-md"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
                  Salon Open · Master Barbers on Duty
                </span>
              </motion.div>

              <motion.h1
                className="select-none font-display text-[clamp(38px,4.6vw,74px)] uppercase leading-[0.88] tracking-wide text-white drop-shadow-2xl lg:text-right"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              >
                <span className="block">WHERE TRADITION</span>
                <span className="block">MEETS MODERN STYLE</span>
              </motion.h1>
            </div>
          </div>
        </Container>
      </section>

      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={hero.formTitle}
        tone="dark"
      >
        <AppointmentForm />
      </Modal>
    </>
  );
}

export default Hero;
