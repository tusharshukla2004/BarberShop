import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { siteConfig } from '@/config/site';
import { Scissors } from 'lucide-react';

export function AboutPage() {
  return (
    <>
      <Seo
        title={`About Us | ${siteConfig.name}`}
        description="Learn about our heritage, master barbers, and philosophy of classic gentleman grooming."
      />
      <div className="pt-20 sm:pt-24 bg-brown text-white py-12">
        <Container>
          <SectionHeading
            subtitle="Our Heritage"
            title="The Art of Grooming"
            tone="dark"
            align="center"
          />
        </Container>
      </div>

      <Section tone="white" py="lg">
        <Container className="max-w-3xl text-center">
          <p className="font-body text-base sm:text-lg text-ink/80 leading-relaxed mb-8">
            Founded with an obsession for precision and heritage barbershop values,{' '}
            {siteConfig.name} offers a haven where gentlemen can relax, recharge, and leave looking
            their absolute sharpest.
          </p>
          <Button to="/book" variant="primary" rightIcon={<Scissors className="h-4 w-4" />}>
            Experience The Blade
          </Button>
        </Container>
      </Section>
    </>
  );
}

export default AboutPage;
