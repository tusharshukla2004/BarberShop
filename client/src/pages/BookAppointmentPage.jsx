import { useAppSelector } from '@/app/hooks';
import { selectBookingDraft } from '@/features/booking/bookingDraftSlice';
import { Container, Section, SectionHeading, Card, Button } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Calendar, User, Phone, Clock, ArrowRight } from 'lucide-react';

export function BookAppointmentPage() {
  const draft = useAppSelector(selectBookingDraft);

  const hasDraft = Boolean(draft.name || draft.phone || draft.dateTime);

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
          {hasDraft ? (
            <Card tone="white" padding="lg" className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border-light pb-4">
                <div className="p-2.5 rounded-pill bg-accent/15 text-accent">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    Draft Loaded from Session
                  </span>
                  <h3 className="font-display text-2xl text-ink">Appointment Details</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2.5 p-3 rounded-md bg-card border border-card-border">
                  <User className="h-4 w-4 text-accent shrink-0" />
                  <div>
                    <span className="text-xs text-muted block">Client Name</span>
                    <span className="font-medium text-ink">{draft.name || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-md bg-card border border-card-border">
                  <Phone className="h-4 w-4 text-accent shrink-0" />
                  <div>
                    <span className="text-xs text-muted block">Phone</span>
                    <span className="font-medium text-ink">{draft.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-md bg-card border border-card-border sm:col-span-2">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <div>
                    <span className="text-xs text-muted block">Requested Slot</span>
                    <span className="font-medium text-ink">
                      {draft.dateTime ? new Date(draft.dateTime).toLocaleString() : 'Not selected'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted">
                Your draft has survived navigation and page reloads. In the upcoming booking wizard
                prompt, you will choose specific barbers and add-on services.
              </p>

              <Button
                to="/"
                variant="secondary"
                size="sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Modify Request on Home
              </Button>
            </Card>
          ) : (
            <Card tone="white" padding="lg" className="text-center">
              <div className="inline-flex p-3 rounded-pill bg-accent/15 text-accent mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-display text-3xl text-ink">No Active Booking Draft</h3>
              <p className="text-muted text-sm mt-2 mb-6">
                Start by making an appointment request from the home page hero form.
              </p>
              <Button to="/" variant="primary" size="md">
                Go to Home Hero Form
              </Button>
            </Card>
          )}
        </Container>
      </Section>
    </>
  );
}

export default BookAppointmentPage;
