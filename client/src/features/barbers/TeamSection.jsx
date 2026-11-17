import { motion } from 'framer-motion';
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
 * Smooth staggered reveal powered by Framer Motion
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
        {/* Header Block: Centered Heading & Short Paragraph with scroll reveal */}
        <motion.div
          className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>

        {/* Governed by QueryState with staggered cards */}
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={displayedBarbers.length === 0}
          emptyMessage="No barber profiles available."
          skeleton={skeleton}
          onRetry={refetch}
        >
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
          >
            {displayedBarbers.map((barber) => (
              <motion.div
                key={barber.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                <BarberCard barber={barber} />
              </motion.div>
            ))}

            {/* Equal Height Recruitment Card with motion */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <JoinTeamCard />
            </motion.div>
          </motion.div>
        </QueryState>

        {/* Bottom "View All Barbers" CTA on Home */}
        {!showAll && (
          <motion.div
            className="mt-12 sm:mt-16 flex justify-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              to={teamSection.viewAllCta.href}
              variant="secondary"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {teamSection.viewAllCta.label}
            </Button>
          </motion.div>
        )}
      </Container>
    </Section>
  );
}

export default TeamSection;
