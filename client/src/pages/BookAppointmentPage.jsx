import { Container, Section, SectionHeading, Card } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Calendar } from 'lucide-react';

export function BookAppointmentPage() {
  return (
    <>
      <Seo
        title="Book an Appointment"
        description="Schedule your bespoke haircut, beard styling, or hot towel shave online in seconds."
      />
      <div className="pt-20 sm:pt-24 bg-ink text-white py-12">
        <Container>
          <SectionHeading
            subtitle="Online Scheduling"
            title="Book an Appointment"
            tone="dark"
            align="center"
          />
        </Container>
      </div>

      <Section tone="cream" py="lg">
        <Container className="max-w-2xl">
          <Card tone="white" padding="lg" className="text-center">
            <div className="inline-flex p-3 rounded-pill bg-accent/15 text-accent mb-4">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-display text-3xl text-ink">Booking Flow (Phase 1)</h3>
            <p className="text-muted text-sm mt-2">
              Multi-step booking form (Service &rarr; Barber &rarr; Date & Time &rarr; Client Info)
              will be introduced in the booking feature prompt.
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}

export default BookAppointmentPage;
