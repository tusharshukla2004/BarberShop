import { useGetBarbersQuery } from './barbersApi';
import { Container, Section, SectionHeading, Button } from '@/components/ui';
import { BarberCard } from './BarberCard';
import { JoinTeamCard } from './JoinTeamCard';
import { homeContent } from '@/features/home/content';
import { ArrowRight, AlertCircle, Users } from 'lucide-react';

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
  const { data: barbers = [], isLoading, isError, refetch } = useGetBarbersQuery();

  // Show first 3 on home section, or all if showAll is true
  const displayedBarbers = showAll ? barbers : barbers.slice(0, 3);

  return (
    <Section tone="white" py="lg" id="team" className={className}>
      <Container>
        {/* Header Block: Centered Heading & Short Paragraph */}
        <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <SectionHeading
            subtitle={teamSection.eyebrow}
            title={teamSection.title}
            align="center"
            tone="light"
            className="mb-4"
          />
          <p className="text-sm sm:text-base text-muted font-body leading-relaxed max-w-[560px]">
            {teamSection.description}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="w-full aspect-[3/4] rounded-lg bg-card border border-border-light animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-8 rounded-lg bg-card border border-border-light text-center max-w-md mx-auto">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h4 className="font-display text-xl text-ink">Unable to load barbers</h4>
            <p className="text-xs text-muted mt-1 mb-4">
              Please check your network connection and retry.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && displayedBarbers.length === 0 && (
          <div className="p-8 rounded-lg bg-card border border-border-light text-center max-w-md mx-auto">
            <Users className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No barber profiles currently available.</p>
          </div>
        )}

        {/* 4-Column Grid: 3 BarberCards + 1 JoinTeamCard */}
        {!isLoading && !isError && displayedBarbers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch">
            {displayedBarbers.map((barber) => (
              <BarberCard key={barber.id} barber={barber} />
            ))}

            {/* Equal Height Recruitment Card */}
            <JoinTeamCard />
          </div>
        )}

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
