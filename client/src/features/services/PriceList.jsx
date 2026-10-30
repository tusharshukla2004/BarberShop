import { useGetServicesQuery } from './servicesApi';
import { QueryState } from '@/components/common/QueryState';
import { siteConfig } from '@/config/site';

const DEFAULT_PRICES = [
  { id: 'srv-1', name: 'HAIRCUT', price: 40 },
  { id: 'srv-2', name: 'SHAVE', price: 35 },
  { id: 'srv-3', name: 'HAIRCUT + SHAVE', price: 70 },
  { id: 'srv-4', name: 'BEARD TRIM', price: 15 },
];

/**
 * Service Price List matching the clean minimalist design from the reference screenshot.
 *
 * @param {Object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function PriceList({ className = '' }) {
  const { data: services = [], isLoading, isError, error, refetch } = useGetServicesQuery();

  const skeleton = (
    <div className="flex flex-col">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="flex items-center justify-between py-4 sm:py-5 border-b border-ink/20 animate-pulse"
        >
          <div className="h-5 w-32 bg-ink/10 rounded-sm" />
          <div className="h-5 w-12 bg-ink/10 rounded-sm" />
        </div>
      ))}
    </div>
  );

  const displayServices =
    services.length > 0
      ? services.slice(0, 4).map((s, idx) => ({
          id: s.id,
          name: s.name.toUpperCase(),
          price: s.price,
          fallback: DEFAULT_PRICES[idx],
        }))
      : DEFAULT_PRICES;

  const currencySymbol = siteConfig.currency === '₹' ? '$' : siteConfig.currency;

  return (
    <div className={`w-full flex flex-col justify-center text-left ${className}`}>
      <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink font-bold uppercase tracking-tight leading-none mb-6 sm:mb-8">
        OUR PRICES
      </h2>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={displayServices.length === 0}
        emptyMessage="No services currently listed."
        skeleton={skeleton}
        onRetry={refetch}
      >
        <div className="flex flex-col">
          {displayServices.map((service) => (
            <div
              key={service.id || service.name}
              className="flex items-center justify-between py-4 sm:py-5 border-b border-ink/20"
            >
              <span className="font-sans text-sm sm:text-base tracking-wide font-normal uppercase text-ink">
                {service.name}
              </span>

              <span className="font-sans text-sm sm:text-base font-normal text-ink">
                {currencySymbol}
                {service.price}
              </span>
            </div>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

export default PriceList;
