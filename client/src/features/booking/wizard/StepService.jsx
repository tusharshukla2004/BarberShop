import PropTypes from 'prop-types';
import { Check, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QueryState from '@/components/common/QueryState';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { formatPrice } from '@/lib/formatters';
import { getShopImageForServiceCategory } from '@/features/shop/productImages';
import useMobileScrollToContinue from './useMobileScrollToContinue';

export default function StepService({ selectedServiceId, onSelect, onNext }) {
  const { data: services = [], isLoading, isError, error, refetch } = useGetServicesQuery();
  const { targetRef, scrollToContinue } = useMobileScrollToContinue();

  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl text-ink tracking-wide uppercase">
          1. Choose Your Grooming Treatment
        </h2>
        <p className="text-muted text-sm mt-1">
          Select a signature haircut, straight razor shave, or bespoke combination.
        </p>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={!isLoading && services.length === 0}
        emptyMessage="No services currently available for booking."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  onSelect(service.id);
                  scrollToContinue();
                }}
                className={`text-left rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected ? 'ring-2 ring-accent shadow-md scale-[1.01]' : 'hover:shadow-md'
                }`}
              >
                <Card
                  tone="light"
                  className={`h-full flex flex-col justify-between overflow-hidden border ${
                    isSelected ? 'border-accent bg-accent/5' : 'border-border-light bg-card'
                  }`}
                >
                  <img
                    src={getShopImageForServiceCategory(service.category)}
                    alt={`${service.category || 'Barbershop'} grooming products`}
                    className="aspect-[16/9] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-display text-xl text-ink tracking-wide leading-tight">
                        {service.name}
                      </h3>
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border border-border-light shrink-0" />
                      )}
                    </div>

                    <p className="text-muted text-xs sm:text-sm line-clamp-3 mb-4 font-normal">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-light/50 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-muted">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {service.durationMinutes} mins
                    </span>
                    <span className="font-display text-lg text-ink">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </QueryState>

      <div ref={targetRef} className="flex justify-end pt-4">
        <Button
          variant="accent"
          size="lg"
          disabled={!selectedServiceId}
          onClick={onNext}
          className="px-8 tracking-wider uppercase font-semibold text-xs"
        >
          Continue to Barber
        </Button>
      </div>
    </div>
  );
}

StepService.propTypes = {
  selectedServiceId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};
