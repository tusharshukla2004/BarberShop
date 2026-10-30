import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Calendar } from 'lucide-react';

export function ServicesPage() {
  return (
    <>
      <Seo
        title="Services & Pricing"
        description="Explore our complete menu of precision haircuts, straight razor shaves, and facial grooming packages."
      />
      <div className="pt-20 sm:pt-24 bg-brown text-white py-12">
        <Container>
          <SectionHeading
            subtitle="Signature Offerings"
            title="Services & Pricing"
            tone="dark"
            align="center"
          />
        </Container>
      </div>

      <Section tone="cream" py="lg">
        <Container className="text-center">
          <p className="text-muted max-w-xl mx-auto mb-8">
            Full service catalog and pricing menu will be populated in Phase 1 (MVP).
          </p>
          <Button to="/book" variant="primary" rightIcon={<Calendar className="h-4 w-4" />}>
            Book Appointment
          </Button>
        </Container>
      </Section>
    </>
  );
}

export default ServicesPage;
