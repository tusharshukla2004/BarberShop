import { Container, Section, SectionHeading, Card } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { siteConfig } from '@/config/site';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export function ContactPage() {
  return (
    <>
      <Seo
        title={`Contact & Location | ${siteConfig.name}`}
        description="Visit our salon, call our front desk, or drop a query for grooming consultations and reservations."
      />
      <div className="pt-20 sm:pt-24 bg-brown text-white py-12">
        <Container>
          <SectionHeading
            subtitle="Get In Touch"
            title="Location & Contact"
            tone="dark"
            align="center"
          />
        </Container>
      </div>

      <Section tone="cream" py="lg">
        <Container className="max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card tone="white" padding="lg">
              <h3 className="font-display text-2xl text-ink mb-4">Contact Details</h3>
              <div className="flex flex-col gap-4 text-sm text-ink/80">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{siteConfig.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-accent shrink-0" />
                  <a
                    href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                    className="hover:text-accent font-medium"
                  >
                    {siteConfig.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent shrink-0" />
                  <a href={`mailto:${siteConfig.email}`} className="hover:text-accent font-medium">
                    {siteConfig.email}
                  </a>
                </div>
              </div>
            </Card>

            <Card tone="white" padding="lg">
              <h3 className="font-display text-2xl text-ink mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Operating Hours
              </h3>
              <div className="flex flex-col gap-2.5 text-sm text-ink/80">
                {siteConfig.hours.map((item) => (
                  <div
                    key={item.days}
                    className="flex justify-between items-center py-1 border-b border-border-light"
                  >
                    <span className="font-medium text-ink">{item.days}</span>
                    <span className="text-muted">{item.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default ContactPage;
