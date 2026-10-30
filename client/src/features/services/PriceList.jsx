import { useGetServicesQuery } from './servicesApi';
import { SectionHeading, Button } from '@/components/ui';
import { formatPrice } from '@/lib/formatters';
import { ArrowRight, AlertCircle } from 'lucide-react';

/**
 * Service Price List with display typography and border-light dividers
 *
 * @param {Object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function PriceList({ className = '' }) {
  const { data: services = [], isLoading, isError, refetch } = useGetServicesQuery();

  return (
    <div className={`w-full flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <SectionHeading
            subtitle="Transparent Rates"
            title="OUR PRICES"
            align="left"
            tone="light"
          />
          <Button
            to="/services"
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="text-xs uppercase font-semibold text-accent hover:text-accent-hover tracking-wider p-0 self-start sm:self-auto"
          >
            Full Menu
          </Button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="flex items-center justify-between py-3.5 border-b border-border-light animate-pulse"
              >
                <div className="h-6 w-48 bg-card rounded-sm" />
                <div className="h-6 w-16 bg-card rounded-sm" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 rounded-md bg-card border border-border-light text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted mb-3">Unable to fetch current price menu.</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Services List Rows */}
        {!isLoading && !isError && (
          <div className="flex flex-col divide-y divide-border-light">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between py-3.5 sm:py-4 group hover:bg-card/40 px-2 -mx-2 rounded-sm transition-colors duration-fast"
              >
                <div className="flex flex-col text-left">
                  <span className="font-display text-xl sm:text-2xl text-ink uppercase tracking-wide group-hover:text-accent transition-colors">
                    {service.name}
                  </span>
                  {service.description && (
                    <span className="text-xs text-muted max-w-sm line-clamp-1 mt-0.5">
                      {service.description}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-4">
                  <span className="font-display text-2xl sm:text-3xl text-ink font-semibold">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 mt-4 border-t border-border-light flex items-center justify-between text-xs text-muted">
        <span>* All services include complimentary warm towels and styling.</span>
        <Button to="/book" variant="primary" size="sm">
          Book Now
        </Button>
      </div>
    </div>
  );
}

export default PriceList;
