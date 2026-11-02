import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Tag, Calendar, Copy, Check, Scissors, ArrowRight, Sparkles } from 'lucide-react';
import { Container, Button, Card } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { useGetPublicOffersQuery } from '@/features/offers/offersApi';
import {
  useGetPublicPackagesQuery,
  useGetPublicMembershipsQuery,
} from '@/features/wallet/walletApi';
import { applyOffer } from '@/features/booking/bookingDraftSlice';
import { addToast } from '@/features/ui/uiSlice';
import { formatPrice } from '@/lib/formatters';

export default function OffersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: offers = [], isLoading, isError } = useGetPublicOffersQuery();
  const { data: publicPackages = [] } = useGetPublicPackagesQuery();
  const { data: publicMemberships = [] } = useGetPublicMembershipsQuery();
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      dispatch(addToast({ message: `Promo code "${code}" copied to clipboard!`, type: 'success' }));
      setTimeout(() => setCopiedCode(null), 3000);
    });
  };

  const handleBookWithOffer = (offer) => {
    dispatch(
      applyOffer({
        offer,
        promoCode: offer.promoCode,
        discountAmount: offer.type === 'flat' ? offer.value : 0,
      })
    );
    dispatch(
      addToast({
        message: `Offer "${offer.title?.en || 'Offer'}" applied to your booking!`,
        type: 'success',
      })
    );
    navigate('/book');
  };

  // Structured Data Schema for Offers
  const offersSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Exclusive Barbershop Promotional Offers',
    itemListElement: offers.map((offer, idx) => ({
      '@type': 'Offer',
      position: idx + 1,
      name: offer.title?.en || 'Barbershop Special Offer',
      description: offer.description?.en || '',
      priceCurrency: 'INR',
      price: offer.value || '0',
      availability: 'https://schema.org/InStock',
      validFrom: offer.startsAt,
      validThrough: offer.endsAt,
    })),
  };

  return (
    <>
      <Seo
        title="Promotions & Exclusive Offers"
        description="Discover exclusive grooming packages, festive discounts, and limited-time deals at Modern Mane Barbershop."
        canonical="/offers"
        includeSchema
        schema={offersSchema}
      />

      <section className="py-12 md:py-20 bg-neutral-50/50">
        <Container>
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/10 text-accent mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Limited-Time Packages
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-ink">
              Exclusive Grooming Offers
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted">
              Premium haircuts, signature shaves, and artisanal beard grooming packages crafted for discerning gentlemen.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border-light bg-card p-6 h-80" />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-16">
              <p className="text-sm text-red-600 mb-4">Unable to load active offers at this moment.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && offers.length === 0 && (
            <div className="text-center py-16 max-w-md mx-auto">
              <Tag className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="font-display text-xl uppercase tracking-wider text-ink mb-1">
                No Active Offers Right Now
              </h3>
              <p className="text-xs text-muted mb-6">
                All our current seasonal specials have wrapped up. Check back soon for upcoming festivals and promotions!
              </p>
              <Button variant="accent" onClick={() => navigate('/book')}>
                Book Standard Appointment
              </Button>
            </div>
          )}

          {/* Offers Grid */}
          {!isLoading && !isError && offers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer) => {
                const endsDate = offer.endsAt ? new Date(offer.endsAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }) : null;

                const discountBadge =
                  offer.type === 'percent'
                    ? `${offer.value}% OFF`
                    : offer.type === 'flat'
                    ? `FLAT ${formatPrice(offer.value)} OFF`
                    : offer.type === 'free_addon'
                    ? 'COMPLIMENTARY ADD-ON'
                    : offer.type === 'combo'
                    ? 'SIGNATURE COMBO'
                    : 'SPECIAL DEAL';

                return (
                  <Card
                    key={offer.id || offer._id}
                    tone="light"
                    className="flex flex-col border border-border-light shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Offer Image Header */}
                    <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={
                          offer.imageUrl ||
                          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={offer.title?.en || 'Offer'}
                        className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded bg-accent text-white text-xs font-bold uppercase tracking-wider shadow-md">
                          {discountBadge}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h2 className="font-display text-xl uppercase tracking-wider text-ink mb-1">
                          {offer.title?.en || 'Special Offer'}
                        </h2>

                        <p className="text-xs text-muted leading-relaxed line-clamp-3">
                          {offer.description?.en || ''}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-border-light/60">
                        {/* Validity Dates */}
                        {endsDate && (
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>Valid until {endsDate}</span>
                          </div>
                        )}

                        {/* Promo Code Box */}
                        {offer.promoCode && (
                          <div className="flex items-center justify-between p-2.5 rounded-md bg-neutral-100 border border-dashed border-border-light">
                            <div className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-accent" />
                              <span className="font-mono text-xs font-bold tracking-widest uppercase text-ink">
                                {offer.promoCode}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(offer.promoCode)}
                              className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
                              title="Copy promo code"
                            >
                              {copiedCode === offer.promoCode ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Action CTA */}
                        <Button
                          variant="accent"
                          size="md"
                          onClick={() => handleBookWithOffer(offer)}
                          className="w-full uppercase tracking-wider text-xs font-bold py-2.5 flex items-center justify-center gap-2"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Book with this Offer</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* Prepaid Packages & VIP Membership Perks */}
      {(publicPackages.length > 0 || publicMemberships.length > 0) && (
        <section className="py-14 bg-sand/40 border-t border-border-light">
          <Container>
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase font-bold tracking-widest text-accent mb-2 block">
                Recurring Loyalty & Memberships
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-ink uppercase tracking-wide">
                VIP Memberships & Prepaid Packages
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-2">
                Long-term privileges, bundled discounts, and complimentary treatments. Inquire at our studio reception.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicPackages.map((pkg) => (
                <Card key={pkg.id || pkg._id} className="p-6 flex flex-col justify-between border-accent/20 bg-white">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider block w-fit mb-2">
                      Prepaid Pack
                    </span>
                    <h3 className="font-display text-xl text-ink">{pkg.name?.en}</h3>
                    <p className="text-xs text-muted mt-1">{pkg.description?.en}</p>
                    <div className="mt-4 pt-3 border-t border-border-light flex justify-between items-baseline">
                      <span className="text-xs text-muted">{pkg.sessions} sessions · {pkg.validityDays} days</span>
                      <span className="font-display text-2xl text-ink">₹{pkg.price}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border-light text-[11px] text-muted text-center italic">
                    Enroll at studio reception
                  </div>
                </Card>
              ))}

              {publicMemberships.map((plan) => (
                <Card key={plan.id || plan._id} className="p-6 flex flex-col justify-between border-amber-300 bg-amber-50/20">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider block w-fit mb-2">
                      VIP Club
                    </span>
                    <h3 className="font-display text-xl text-ink">{plan.name?.en}</h3>
                    <p className="text-xs text-muted mt-1">{plan.description?.en}</p>
                    <div className="mt-4 pt-3 border-t border-amber-200 flex justify-between items-baseline">
                      <span className="text-xs text-muted">{plan.durationDays} days validity</span>
                      <span className="font-display text-2xl text-amber-900">₹{plan.price}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-amber-200 text-[11px] text-muted text-center italic">
                    Enroll at studio reception
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

