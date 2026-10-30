import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable slide arrow controls with long thin aesthetics and accessible disabled states
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
          className="h-10 w-10 rounded-pill border border-ink/40 flex items-center justify-center text-ink transition-all duration-fast hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next testimonial"
          className="h-10 w-10 rounded-pill border border-ink/40 flex items-center justify-center text-ink transition-all duration-fast hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous slide"
        className="group flex items-center gap-2 py-2 px-1 text-ink transition-all duration-fast disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="h-9 w-9 rounded-pill border border-border-light flex items-center justify-center group-hover:border-ink transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </div>
        <div className="h-px w-8 bg-ink/30 group-hover:w-12 group-hover:bg-ink transition-all duration-fast" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next slide"
        className="group flex items-center gap-2 py-2 px-1 text-ink transition-all duration-fast disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="h-px w-8 bg-ink/30 group-hover:w-12 group-hover:bg-ink transition-all duration-fast" />
        <div className="h-9 w-9 rounded-pill border border-border-light flex items-center justify-center group-hover:border-ink transition-colors">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
}

export default SlideControls;
