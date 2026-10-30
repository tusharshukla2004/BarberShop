import { useNavigate } from 'react-router-dom';
import Seo from '@/components/common/Seo';
import PageBanner from '@/components/common/PageBanner';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QueryState from '@/components/common/QueryState';
import JoinTeamCard from '@/features/barbers/JoinTeamCard';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useAppDispatch } from '@/app/hooks';
import { selectBarber, setBookingStep } from '@/features/booking/bookingDraftSlice';

export default function BarbersPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: barbers = [], isLoading, isError, error, refetch } = useGetBarbersQuery();

  const handleBookWithBarber = (barberId) => {
    dispatch(selectBarber(barberId));
    dispatch(setBookingStep(1)); // Start booking flow with preselected barber
    navigate('/book');
  };

  return (
    <>
      <Seo
        title="Meet Our Master Barbers | Sovereign Craftsmen"
        description="Get to know our master barbers, stylists, and beard artisans. Decades of combined heritage and precision grooming."
        canonical="/barbers"
      />

      <PageBanner
        eyebrow="The Artisans"
        title="MEET OUR MASTER CRAFTSMEN"
        description="Our barbers are dedicated artists with decades of combined training in classical scissor techniques, traditional straight razors, and modern styling."
      />

      <Section tone="white" className="py-16 md:py-24">
        <Container>
          <QueryState
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
            isEmpty={!isLoading && barbers.length === 0}
            emptyMessage="No master barbers currently available."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {barbers.map((barber) => (
                <BarberProfileCard
                  key={barber.id}
                  barber={barber}
                  onBook={() => handleBookWithBarber(barber.id)}
                />
              ))}

              {/* Join our team card */}
              <div className="h-full min-h-[420px]">
                <JoinTeamCard />
              </div>
            </div>
          </QueryState>
        </Container>
      </Section>
    </>
  );
}

function BarberProfileCard({ barber, onBook }) {
  return (
    <Card
      tone="light"
      className="flex flex-col justify-between overflow-hidden border border-border-light/70 shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <div>
        {/* Portrait Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-card">
          <img
            src={barber.photoUrl}
            alt={barber.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />

          {/* Experience Badge */}
          {barber.experienceYears && (
            <div className="absolute bottom-3 left-3 bg-ink/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-medium tracking-wide">
              {barber.experienceYears} Years Craft
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5">
          <SectionHeading level={3} tone="dark" className="text-xl sm:text-2xl text-ink">
            {barber.name}
          </SectionHeading>
          <p className="text-accent text-xs font-semibold uppercase tracking-wider mt-0.5 mb-3">
            {barber.role}
          </p>

          {/* Specialties Chips */}
          {barber.specialties && barber.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {barber.specialties.map((spec) => (
                <span
                  key={spec}
                  className="bg-card text-ink/80 text-[11px] px-2.5 py-1 rounded-md font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking CTA Button */}
      <div className="p-5 pt-0">
        <Button
          variant="outline"
          size="md"
          className="w-full justify-center text-xs tracking-wider uppercase font-semibold"
          onClick={onBook}
          aria-label={`Book with ${barber.name}`}
        >
          Book with {barber.name.split(' ')[0]}
        </Button>
      </div>
    </Card>
  );
}
