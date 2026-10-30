import { useGetBarbersQuery } from './barbersApi';
import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { BarberCard } from './BarberCard';
import { JoinTeamCard } from './JoinTeamCard';
import { QueryState } from '@/components/common/QueryState';
import { homeContent } from '@/features/home/content';
import { ArrowRight } from 'lucide-react';

/**
 * "Meet Our Experts" Team Section
 * 4-column equal height grid featuring 3 BarberCards and 1 JoinTeamCard
 *
 * @param {Object} props
 * @param {boolean} [props.showAll=false] - When true, shows all barbers (for /barbers page)
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function TeamSection({ showAll = false, className = '' }) {
  const { teamSection } = homeContent;
  const { data: barbers = [], isLoading, isError, error, refetch } = useGetBarbersQuery();

  // Show first 3 on home section, or all if showAll is true
  const displayedBarbers = showAll ? barbers : barbers.slice(0, 3);

  const skeleton = (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="w-full aspect-[3/4] rounded-lg bg-card border border-border-light animate-pulse"
        />
      ))}
    </div>
  );

  return (
    <Section tone="white" py="lg" id="team" className={className}>
      <Container>
        {/* Header Block: Centered Heading & Short Paragraph */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          {teamSection.eyebrow ? (
            <SectionHeading
              subtitle={teamSection.eyebrow}
              title={teamSection.title}
              align="center"
              tone="light"
              className="mb-4"
            />
          ) : (
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink font-bold uppercase tracking-tight mb-4">
              {teamSection.title}
            </h2>
          )}
          <p className="text-sm sm:text-base text-ink/75 font-body leading-relaxed max-w-[560px]">
            {teamSection.description}
          </p>
        </div>

        {/* Governed by QueryState */}
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={displayedBarbers.length === 0}
          emptyMessage="No barber profiles available."
          skeleton={skeleton}
          onRetry={refetch}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch">
            {displayedBarbers.map((barber) => (
              <BarberCard key={barber.id} barber={barber} />
            ))}

            {/* Equal Height Recruitment Card */}
            <JoinTeamCard />
          </div>
        </QueryState>

        {/* Bottom "View All Barbers" CTA on Home */}
        {!showAll && (
          <div className="mt-12 sm:mt-16 flex justify-center">
            <Button
              to={teamSection.viewAllCta.href}
              variant="secondary"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {teamSection.viewAllCta.label}
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}

export default TeamSection;
