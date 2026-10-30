import { Container, SectionHeading } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { TeamSection } from '@/features/barbers/TeamSection';

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

      <TeamSection showAll={true} />
    </>
  );
}

export default BarbersPage;
