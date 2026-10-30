import { useState, useEffect, useRef, useCallback } from 'react';
import { useGetReviewsQuery } from './reviewsApi';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlideControls } from '@/components/common/SlideControls';
import { QueryState } from '@/components/common/QueryState';

/**
 * Accent-colored Testimonial Card with 7s auto-advance, hover/focus pause, and progress dashes
 * @returns {JSX.Element}
 */
export function TestimonialSlider() {
  const { data: testimonials = [], isLoading, isError, error, refetch } = useGetReviewsQuery();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const total = testimonials.length;

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Check prefers-reduced-motion safely
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-advance every 7 seconds
  useEffect(() => {
    if (prefersReducedMotion || isPaused || total <= 1) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total, handleNext, prefersReducedMotion]);

  const current = testimonials[activeIndex] || testimonials[0];

  const skeleton = (
    <div className="w-full h-full min-h-[340px] rounded-xl bg-accent/40 p-8 flex items-center justify-center animate-pulse">
      <span className="text-xs uppercase tracking-widest text-ink/60 font-semibold">
        Loading Testimonials...
      </span>
    </div>
  );

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={total === 0}
      emptyMessage="No reviews published yet."
      skeleton={skeleton}
      onRetry={refetch}
    >
      {current && (
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Client Testimonials"
          aria-live="polite"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          className="relative w-full h-full min-h-[360px] rounded-xl bg-accent text-ink p-8 sm:p-10 flex flex-col justify-between shadow-xl"
        >
          {/* Decorative Quote Mark */}
          <Quote
            className="absolute top-6 right-6 h-16 w-16 text-ink/10 pointer-events-none"
            aria-hidden="true"
          />

          {/* Quote Body */}
          <div className="relative z-10">
            <span className="text-xs font-semibold tracking-widest uppercase text-ink/80 block mb-3">
              Client Review {current.role ? `• ${current.role}` : ''}
            </span>
            <blockquote className="font-body text-xl sm:text-2xl font-medium leading-snug text-ink">
              &ldquo;{current.text}&rdquo;
            </blockquote>
          </div>

          {/* Bottom Bar: Author & Progress Dashes on Left | Circular Controls on Right */}
          <div className="relative z-10 pt-6 border-t border-ink/15 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
            <div className="flex flex-col gap-2.5">
              <cite className="font-serif italic font-bold text-base sm:text-lg not-italic text-ink">
                {current.customerName}
              </cite>

              {/* Progress Dashes reflecting current active slide */}
              <div
                className="flex items-center gap-2"
                aria-label={`Slide ${activeIndex + 1} of ${total}`}
              >
                {testimonials.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      'h-1 rounded-pill transition-all duration-base cursor-pointer',
                      idx === activeIndex ? 'w-8 bg-ink' : 'w-3 bg-ink/30 hover:bg-ink/50'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Circular outline arrow controls */}
            <SlideControls
              variant="circular"
              onPrev={handlePrev}
              onNext={handleNext}
              canPrev={true}
              canNext={true}
            />
          </div>
        </div>
      )}
    </QueryState>
  );
}

export default TestimonialSlider;
