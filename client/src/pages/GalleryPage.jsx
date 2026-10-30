import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { Sparkles } from 'lucide-react';

export function GalleryPage() {
  return (
    <>
      <Seo
        title="Works Gallery"
        description="Browse through our curated gallery of modern fades, classic tapers, and beard sculptures."
      />
      <div className="pt-20 sm:pt-24 bg-brown text-white py-12">
        <Container>
          <SectionHeading
            subtitle="Our Portfolio"
            title="Works Gallery"
            tone="dark"
            align="center"
          />
        </Container>
      </div>

      <Section tone="cream" py="lg">
        <Container className="text-center">
          <p className="text-muted max-w-xl mx-auto mb-8">
            Interactive Embla Carousel works gallery will be integrated in upcoming prompts.
          </p>
          <Button to="/book" variant="primary" rightIcon={<Sparkles className="h-4 w-4" />}>
            Reserve Your Session
          </Button>
        </Container>
      </Section>
    </>
  );
}

export default GalleryPage;
