import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Calendar } from 'lucide-react';

export function BarbersPage() {
  return (
    <>
      <Seo
        title="Our Master Barbers"
        description="Meet the passionate artisans and master barbers behind our classic salon experience."
      />
      <div className="pt-20 sm:pt-24 bg-brown text-white py-12">
        <Container>
          <SectionHeading
            subtitle="Meet The Artisans"
            title="Our Master Barbers"
            tone="dark"
            align="center"
          />
        </Container>
      </div>

      <Section tone="white" py="lg">
        <Container className="text-center">
          <p className="text-muted max-w-xl mx-auto mb-8">
            Detailed barber profiles, certifications, and booking slots will be displayed here.
          </p>
          <Button to="/book" variant="primary" rightIcon={<Calendar className="h-4 w-4" />}>
            Choose Your Barber
          </Button>
        </Container>
      </Section>
    </>
  );
}

export default BarbersPage;
