import { useState, useEffect, useRef, useCallback } from 'react';
import { useGetReviewsQuery } from './reviewsApi';
import { cn } from '@/lib/utils';
import { SlideControls } from '@/components/common/SlideControls';
import { QueryState } from '@/components/common/QueryState';

/**
 * Orange Testimonial Card with 7s auto-advance, hover/focus pause, and progress dashes
 * Exactly matches the reference design.
 *
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

  const current = testimonials[activeIndex] || testimonials[0] || {
    customerName: 'John D.',
    text: "I've been coming to this barbershop for over five years now, and I've never been disappointed. The barbers here are skilled, friendly, and always know the latest trends. Every visit is a great experience!",
  };

  const skeleton = (
    <div className="w-full h-full min-h-[320px] rounded-3xl bg-[#f9a55a]/70 p-8 sm:p-10 flex items-center justify-center animate-pulse">
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
      isEmpty={total === 0 && !current}
      emptyMessage="No reviews published yet."
      skeleton={skeleton}
      onRetry={refetch}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Client Testimonials"
        aria-live="polite"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
        className="relative w-full h-full min-h-[320px] sm:min-h-[350px] rounded-3xl bg-[#f9a55a] text-ink p-8 sm:p-10 flex flex-col justify-between shadow-lg"
      >
        {/* Quote Body */}
        <div className="relative z-10">
          <blockquote className="font-body text-base sm:text-lg md:text-xl font-normal leading-relaxed text-ink">
            &ldquo;{current.text}&rdquo;
          </blockquote>

          {/* Progress Dashes reflecting current active slide */}
          <div
            className="flex items-center gap-3 mt-6 sm:mt-8"
            aria-label={`Slide ${activeIndex + 1} of ${Math.max(total, 3)}`}
          >
            {(testimonials.length >= 3 ? testimonials.slice(0, 3) : [0, 1, 2]).map((item, idx) => (
              <button
                key={typeof item === 'object' ? item.id : idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={cn(
                  'h-0.5 rounded-full transition-all duration-base cursor-pointer',
                  idx === activeIndex % 3 ? 'w-10 bg-ink' : 'w-8 bg-ink/30 hover:bg-ink/50'
                )}
              />
            ))}
          </div>
        </div>

        {/* Bottom Bar: Author on Left | Circular Controls on Right */}
        <div className="relative z-10 pt-6 flex items-center justify-between gap-4 mt-4">
          <cite className="font-serif italic font-bold text-base sm:text-lg not-italic text-ink">
            {current.customerName}
          </cite>

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
    </QueryState>
  );
}

export default TestimonialSlider;
