import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable slide arrow controls with long thin architectural line arrows (default)
 * or circular border buttons (variant="circular").
 *
 * @param {Object} props
 * @param {() => void} props.onPrev - Previous slide handler
 * @param {() => void} props.onNext - Next slide handler
 * @param {boolean} [props.canPrev=false] - Can navigate backwards
 * @param {boolean} [props.canNext=false] - Can navigate forwards
 * @param {'default' | 'circular'} [props.variant='default'] - Visual style
 * @param {string} [props.className] - Extra class names
 * @returns {JSX.Element}
 */
export function SlideControls({
  onPrev,
  onNext,
  canPrev = false,
  canNext = false,
  variant = 'default',
  className = '',
}) {
  if (variant === 'circular') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous testimonial"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-ink/40 flex items-center justify-center text-ink transition-all duration-fast hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next testimonial"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-ink/40 flex items-center justify-center text-ink/50 hover:text-white transition-all duration-fast hover:bg-ink disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
        >
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous slide"
        className="group flex items-center py-2 text-ink transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
      >
        <svg
          width="48"
          height="12"
          viewBox="0 0 48 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current stroke-[1.5]"
          aria-hidden="true"
        >
          <path d="M48 6H2M2 6L7 1M2 6L7 11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next slide"
        className="group flex items-center py-2 text-ink/40 hover:text-ink transition-colors disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
      >
        <svg
          width="48"
          height="12"
          viewBox="0 0 48 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current stroke-[1.5]"
          aria-hidden="true"
        >
          <path d="M0 6H46M46 6L41 1M46 6L41 11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export default SlideControls;
