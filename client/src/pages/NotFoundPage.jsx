import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="404 - Page Not Found"
        description="The requested page could not be found."
        noindex={true}
      />
      <Section tone="dark" py="xl" className="min-h-[70vh] flex items-center justify-center">
        <Container className="text-center">
          <span className="font-display text-8xl sm:text-9xl text-accent block leading-none">
            404
          </span>
          <SectionHeading
            subtitle="Page Not Found"
            title="The Barber Is Out"
            tone="dark"
            align="center"
            className="mt-4 mb-8"
          />
          <p className="text-on-dark-muted max-w-md mx-auto mb-8 text-sm sm:text-base">
            The page you are looking for does not exist or has been relocated to another chair.
          </p>
          <Button to="/" variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />}>
            Return To Home
          </Button>
        </Container>
      </Section>
    </>
  );
}

export default NotFoundPage;
