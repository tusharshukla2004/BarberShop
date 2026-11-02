import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Seo from '@/components/common/Seo';
import PageBanner from '@/components/common/PageBanner';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QueryState from '@/components/common/QueryState';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import {
  useGetPublicPackagesQuery,
  useGetPublicMembershipsQuery,
} from '@/features/wallet/walletApi';
import { useAppDispatch } from '@/app/hooks';
import { selectService, setBookingStep } from '@/features/booking/bookingDraftSlice';
import { formatPrice } from '@/lib/formatters';
import { ProductsShowcaseSection } from '@/features/shop/ProductsShowcaseSection';

export default function ServicesPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: services = [], isLoading, isError, error, refetch } = useGetServicesQuery();
  const { data: publicPackages = [] } = useGetPublicPackagesQuery();
  const { data: publicMemberships = [] } = useGetPublicMembershipsQuery();

  const [activeCategory, setActiveCategory] = useState('All');

  // Normalized categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    services.forEach((s) => {
      if (s.category) {
        set.add(s.category);
      }
    });
    return Array.from(set);
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (activeCategory === 'All') return services;
    return services.filter((s) => s.category.toLowerCase() === activeCategory.toLowerCase());
  }, [services, activeCategory]);

  // Grouped by category for structured display
  const groupedServices = useMemo(() => {
    const groups = {};
    services.forEach((s) => {
      const cat = s.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, [services]);

  const handleBookService = (serviceId) => {
    dispatch(selectService(serviceId));
    dispatch(setBookingStep(2)); // Advance to barber selection
    navigate('/book');
  };

  return (
    <>
      <Seo
        title="Services & Pricing | Sovereign Gentleman Grooming"
        description="Explore our artisanal barbershop services: classic haircutting, hot lather straight razor shaves, bespoke beard sculpts, and executive groom packages."
        canonical="/services"
      />

      <PageBanner
        eyebrow="Craft & Precision"
        title="OUR SERVICES & PRICING"
        description="Every treatment is a ritual of rejuvenation. We combine timeless barbering heritage with modern aesthetics and premium organic tonics."
      />

      <Section tone="cream" className="py-12 md:py-20">
        <Container>
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'bg-ink text-white shadow-md'
                      : 'bg-card text-ink hover:bg-ink/10'
                  }`}
                  aria-pressed={isSelected}
                >
                  {cat === 'Combo' ? 'Packages & Combos' : cat}
                </button>
              );
            })}
          </div>

          <QueryState
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
            isEmpty={!isLoading && filteredServices.length === 0}
            emptyMessage="No grooming services found for the selected category."
          >
            {activeCategory === 'All' ? (
              // Structured display by category groups
              <div className="space-y-16">
                {Object.entries(groupedServices).map(([categoryName, items]) => (
                  <div key={categoryName} className="space-y-6">
                    <div className="border-b border-border-light pb-3">
                      <SectionHeading
                        level={2}
                        tone="dark"
                        className="text-2xl sm:text-3xl text-ink"
                      >
                        {categoryName === 'Combo' ? 'PACKAGES & COMBOS' : categoryName}
                      </SectionHeading>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((service) => (
                        <ServiceItemCard
                          key={service.id}
                          service={service}
                          onBook={() => handleBookService(service.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Filtered list display
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceItemCard
                    key={service.id}
                    service={service}
                    onBook={() => handleBookService(service.id)}
                  />
                ))}
              </div>
            )}
          </QueryState>
        </Container>
      </Section>

      {/* Prepaid Packages & VIP Memberships Display-Only Section */}
      {(publicPackages.length > 0 || publicMemberships.length > 0) && (
        <Section tone="sand" className="py-12 border-t border-border-light">
          <Container>
            <SectionHeading
              eyebrow="Repeat Privilege"
              title="PREPAID PACKAGES & VIP CLUBS"
              description="Enjoy bundled savings and year-round grooming privileges. Available for enrollment at our studio."
              align="center"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {publicPackages.map((pkg) => (
                <Card key={pkg.id || pkg._id} className="p-6 flex flex-col justify-between border-accent/20 bg-white">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider block w-fit mb-2">
                      Prepaid Bundle
                    </span>
                    <h3 className="font-display text-xl text-ink">{pkg.name?.en}</h3>
                    <p className="text-xs text-muted mt-1">{pkg.description?.en}</p>
                    <div className="mt-4 pt-3 border-t border-border-light flex justify-between items-baseline">
                      <span className="text-xs text-muted">{pkg.sessions} sessions · {pkg.validityDays} days</span>
                      <span className="font-display text-2xl text-ink">₹{pkg.price}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border-light text-[11px] text-muted text-center italic">
                    Available for purchase at studio reception
                  </div>
                </Card>
              ))}

              {publicMemberships.map((plan) => (
                <Card key={plan.id || plan._id} className="p-6 flex flex-col justify-between border-amber-300 bg-amber-50/20">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider block w-fit mb-2">
                      VIP Club Plan
                    </span>
                    <h3 className="font-display text-xl text-ink">{plan.name?.en}</h3>
                    <p className="text-xs text-muted mt-1">{plan.description?.en}</p>
                    <div className="mt-4 pt-3 border-t border-amber-200 flex justify-between items-baseline">
                      <span className="text-xs text-muted">{plan.durationDays} days access</span>
                      <span className="font-display text-2xl text-amber-900">₹{plan.price}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-amber-200 text-[11px] text-muted text-center italic">
                    Available for enrollment at studio reception
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Artisanal Apothecary Products Section */}
      <ProductsShowcaseSection
        tone="white"
        eyebrow="Studio Formulations"
        title="THE GROOMING APOTHECARY"
        subtitle="Take home the master barber clays, oils, and straight razors used across our chair stations."
      />
    </>
  );
}

function ServiceItemCard({ service, onBook }) {
  return (
    <Card
      tone="light"
      className="p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 border border-border-light/60"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-xl sm:text-2xl text-ink tracking-wide leading-tight">
            {service.name}
          </h3>
          <span className="font-display text-xl sm:text-2xl text-ink whitespace-nowrap">
            {formatPrice(service.price)}
          </span>
        </div>

        <p className="text-muted text-sm leading-relaxed mb-6 font-normal">
          {service.description}
        </p>
      </div>

      <div className="pt-4 border-t border-border-light/40 flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted font-medium">
          <Clock className="w-3.5 h-3.5 text-accent" />
          {service.durationMinutes} mins
        </span>

        <Button
          variant="accent"
          size="sm"
          onClick={onBook}
          aria-label={`Book ${service.name}`}
        >
          Book now
        </Button>
      </div>
    </Card>
  );
}
