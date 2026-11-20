import PropTypes from 'prop-types';
import { Check, Users, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QueryState from '@/components/common/QueryState';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import useMobileScrollToContinue from './useMobileScrollToContinue';

export default function StepBarber({ selectedBarberId, onSelect, onNext, onBack }) {
  const { data: barbers = [], isLoading, isError, error, refetch } = useGetBarbersQuery();
  const { targetRef, scrollToContinue } = useMobileScrollToContinue();

  const isAnySelected = !selectedBarberId || selectedBarberId === 'any';

  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl text-ink tracking-wide uppercase">
          2. Choose Your Master Barber
        </h2>
        <p className="text-muted text-sm mt-1">
          Select a specific artisan or choose Any Available Barber for maximum slot options.
        </p>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={!isLoading && barbers.length === 0}
        emptyMessage="No barbers currently available."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* "Any Available Barber" Card */}
          <button
            type="button"
            onClick={() => {
              onSelect('any');
              scrollToContinue();
            }}
            className={`text-left rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isAnySelected ? 'ring-2 ring-accent shadow-md scale-[1.01]' : 'hover:shadow-md'
            }`}
          >
            <Card
              tone="light"
              className={`p-5 h-full flex flex-col justify-between border ${
                isAnySelected ? 'border-accent bg-accent/5' : 'border-border-light bg-card'
              }`}
            >
              <div>
                <div className="aspect-[3/4] w-full rounded-md bg-ink/10 flex flex-col items-center justify-center p-4 text-center mb-4 border border-border-light">
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-3">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="font-display text-lg text-ink">FIRST AVAILABLE</span>
                  <p className="text-[11px] text-muted mt-1 leading-snug">
                    Best for fastest scheduling.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl text-ink">ANY AVAILABLE</h3>
                    <p className="text-accent text-[11px] font-semibold uppercase tracking-wider">
                      Optimal Flexibility
                    </p>
                  </div>

                  {isAnySelected ? (
                    <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full border border-border-light shrink-0" />
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border-light/50 mt-4 flex items-center gap-1.5 text-xs text-muted">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Assigned by shop concierge</span>
              </div>
            </Card>
          </button>

          {/* Individual Barber Cards */}
          {barbers.map((barber) => {
            const isSelected = selectedBarberId === barber.id;
            return (
              <button
                key={barber.id}
                type="button"
                onClick={() => {
                  onSelect(barber.id);
                  scrollToContinue();
                }}
                className={`text-left rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected ? 'ring-2 ring-accent shadow-md scale-[1.01]' : 'hover:shadow-md'
                }`}
              >
                <Card
                  tone="light"
                  className={`p-5 h-full flex flex-col justify-between border ${
                    isSelected ? 'border-accent bg-accent/5' : 'border-border-light bg-card'
                  }`}
                >
                  <div>
                    <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden mb-4 bg-border-light">
                      <img
                        src={barber.photoUrl}
                        alt={barber.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {barber.experienceYears && (
                        <span className="absolute bottom-2 left-2 bg-ink/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {barber.experienceYears} Yrs Exp
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-xl text-ink leading-tight">
                          {barber.name}
                        </h3>
                        <p className="text-accent text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                          {barber.role}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border border-border-light shrink-0" />
                      )}
                    </div>
                  </div>

                  {barber.specialties && barber.specialties.length > 0 && (
                    <div className="pt-3 border-t border-border-light/50 mt-4 flex flex-wrap gap-1">
                      {barber.specialties.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="bg-border-light/60 text-ink/70 text-[10px] px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </button>
            );
          })}
        </div>
      </QueryState>

      <div ref={targetRef} className="flex items-center justify-between pt-4">
        <Button variant="outline" size="md" onClick={onBack} className="text-xs uppercase font-semibold">
          Back
        </Button>

        <Button
          variant="accent"
          size="lg"
          onClick={onNext}
          className="px-8 tracking-wider uppercase font-semibold text-xs"
        >
          Continue to Date & Time
        </Button>
      </div>
    </div>
  );
}

StepBarber.propTypes = {
  selectedBarberId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
