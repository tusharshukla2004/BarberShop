import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

/**
 * Generic reusable Carousel wrapper powered by Embla Carousel
 *
 * @typedef {Object} CarouselProps
 * @property {React.ReactNode} children - Slide items
 * @property {Object} [options] - Embla configuration options
 * @property {(index: number) => void} [onSlideChange] - Callback fired on active slide change
 * @property {string} [className] - Viewport container classes
 * @property {string} [containerClassName] - Track container classes
 * @property {string} [ariaLabel] - Accessibility label
 */

export const Carousel = forwardRef(function Carousel(
  {
    children,
    options = { loop: false, align: 'start' },
    onSlideChange,
    className = '',
    containerClassName = '',
    ariaLabel = 'Carousel',
  },
  ref
) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    if (onSlideChange) onSlideChange(index);
  }, [emblaApi, onSlideChange]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Expose imperative API for parent components (e.g. SlideControls)
  useImperativeHandle(
    ref,
    () => ({
      scrollPrev: () => emblaApi && emblaApi.scrollPrev(),
      scrollNext: () => emblaApi && emblaApi.scrollNext(),
      scrollTo: (index) => emblaApi && emblaApi.scrollTo(index),
      selectedIndex,
      scrollSnaps,
      canScrollPrev,
      canScrollNext,
      emblaApi,
    }),
    [emblaApi, selectedIndex, scrollSnaps, canScrollPrev, canScrollNext]
  );

  // Keyboard navigation when an element inside the carousel is active
  useEffect(() => {
    if (!emblaApi) return;
    const handleKeyDown = (e) => {
      const containerNode = emblaApi.rootNode();
      if (containerNode && containerNode.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          emblaApi.scrollPrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          emblaApi.scrollNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emblaApi]);

  return (
    <div
      ref={emblaRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn(
        'overflow-hidden select-none outline-none rounded-lg',
        className
      )}
    >
      <div className={cn('flex', containerClassName)}>{children}</div>
    </div>
  );
});

Carousel.displayName = 'Carousel';

export default Carousel;
