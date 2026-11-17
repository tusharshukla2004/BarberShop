import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export function ClosingCtaSection() {
  const checkpoints = [
    'Walk-ins & Online Booking',
    'Complimentary Espresso / Beverage',
    'Zero-Wait Slot Guarantee',
    'Premium Organic Apothecary',
  ];

  return (
    <section className="relative overflow-hidden border-t border-border-dark bg-ink py-16 text-white sm:py-20 md:py-24">
      {/* Ambient atmospheric glows */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 w-[480px] h-[480px] rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-10 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Text & CTAs with motion reveal */}
          <motion.div
            className="lg:col-span-6 flex flex-col items-start text-left"
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Live Availability Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-xs uppercase tracking-wider mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experience True Craftsmanship</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider leading-[0.95] uppercase mb-5 drop-shadow-md">
              READY FOR A BESPOKE GROOMING EXPERIENCE?
            </h2>

            <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              Reserve your chair with one of our master craftsmen or explore our full suite of signature hot-lather treatments, precision fades, and bespoke beard sculptures.
            </p>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-9 w-full max-w-xl">
              {checkpoints.map((text, idx) => (
                <div
                  key={idx}
                  className="flex min-h-10 items-center gap-2 text-xs font-mono text-white/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="leading-5">{text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Button
                as={Link}
                to="/book"
                variant="accent"
                size="lg"
                className="tracking-wider uppercase font-semibold text-xs py-3.5 px-8 rounded-full shadow-xl luxury-shimmer-btn justify-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>

              <Button
                as={Link}
                to="/services"
                variant="outline"
                size="lg"
                className="tracking-wider uppercase font-semibold text-xs py-3.5 px-7 rounded-full text-white border-white/30 hover:border-white hover:bg-white/10 justify-center"
              >
                View All Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Cinematic Video Showcase with Luxury Floating Frame */}
          <motion.div
            className="lg:col-span-6 w-full flex justify-center"
            initial={{ opacity: 0, scale: 0.93 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <div className="relative w-full max-w-lg group">
              {/* Golden Ambient Blur Glow behind video */}
              <div
                className="absolute -inset-2.5 rounded-[32px] bg-gradient-to-tr from-accent/20 via-white/5 to-accent/10 blur-xl opacity-60 transition duration-700 group-hover:opacity-80"
                aria-hidden="true"
              />

              {/* Video Player Card */}
              <div className="relative rounded-[28px] overflow-hidden border border-white/20 bg-black/80 shadow-2xl aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] transition-transform duration-base group-hover:scale-[1.01]">
                <video
                  src="/grooming-experience.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                  aria-label="Master Barber at work in the lounge"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

export default ClosingCtaSection;
