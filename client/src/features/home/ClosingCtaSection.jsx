import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';

export function ClosingCtaSection() {
  return (
    <Section tone="ink" className="py-20 md:py-28 text-white relative overflow-hidden border-t border-border-dark">
      <div
        className="pointer-events-none absolute -bottom-24 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative z-10 text-center max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          Experience True Craftsmanship
        </p>
        <SectionHeading
          level={2}
          tone="light"
          className="text-3xl sm:text-4xl md:text-5xl text-white tracking-wider leading-tight mb-6"
        >
          READY FOR A BESPOKE GROOMING EXPERIENCE?
        </SectionHeading>
        <p className="text-on-dark-muted text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto">
          Reserve your chair with one of our master craftsmen or explore our full suite of signature hot-lather treatments.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            as={Link}
            to="/book"
            variant="accent"
            size="lg"
            className="w-full sm:w-auto tracking-wider uppercase font-semibold text-xs py-3.5 px-8"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>

          <Button
            as={Link}
            to="/services"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto tracking-wider uppercase font-semibold text-xs py-3.5 px-8 text-white border-white/30 hover:border-white"
          >
            View All Services
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export default ClosingCtaSection;
