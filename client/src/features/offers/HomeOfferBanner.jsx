import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Tag, Sparkles, X, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui';
import { useGetPublicOffersQuery } from './offersApi';
import { applyOffer } from '@/features/booking/bookingDraftSlice';
import { formatPrice } from '@/lib/formatters';

const STORAGE_KEY = 'offer_banner_dismissed';

export function HomeOfferBanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: offers = [] } = useGetPublicOffersQuery();

  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Offers marked specifically to show on home page
  const homeOffers = offers.filter((o) => o.isActive && o.showOnHome);

  if (isDismissed || homeOffers.length === 0) {
    return null;
  }

  const currentOffer = homeOffers[currentIndex] || homeOffers[0];

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore storage error
    }
  };

  const handleClaim = () => {
    dispatch(
      applyOffer({
        offer: currentOffer,
        promoCode: currentOffer.promoCode,
        discountAmount: currentOffer.type === 'flat' ? currentOffer.value : 0,
      })
    );
    navigate('/book');
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % homeOffers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + homeOffers.length) % homeOffers.length);
  };

  const discountBadge =
    currentOffer.type === 'percent'
      ? `${currentOffer.value}% OFF`
      : currentOffer.type === 'flat'
      ? `FLAT ${formatPrice(currentOffer.value)} OFF`
      : 'SPECIAL OFFER';

  return (
    <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white border-b border-accent/30 relative py-3 px-4 shadow-inner">
      <Container className="flex items-center justify-between gap-4">
        {/* Left icon & badge */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="p-1.5 rounded-full bg-accent/20 text-accent hidden sm:inline-flex">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-accent text-white shadow-sm">
            {discountBadge}
          </span>
        </div>

        {/* Center message & promo code */}
        <div className="flex-1 text-center sm:text-left flex flex-col sm:flex-row items-center gap-2 overflow-hidden">
          <span className="font-semibold text-xs sm:text-sm text-neutral-100 truncate">
            {currentOffer.title?.en}
          </span>
          {currentOffer.promoCode && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
              <Tag className="w-3 h-3" />
              {currentOffer.promoCode}
            </span>
          )}
        </div>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {homeOffers.length > 1 && (
            <div className="hidden md:flex items-center gap-1 mr-2 text-muted">
              <button
                type="button"
                onClick={prevSlide}
                className="p-1 hover:text-white transition-colors"
                aria-label="Previous offer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-neutral-400">
                {currentIndex + 1}/{homeOffers.length}
              </span>
              <button
                type="button"
                onClick={nextSlide}
                className="p-1 hover:text-white transition-colors"
                aria-label="Next offer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleClaim}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <span>Claim Offer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded hover:bg-white/10"
            title="Dismiss offer banner"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </Container>
    </div>
  );
}

export default HomeOfferBanner;

