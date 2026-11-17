import { useState, useRef } from 'react';
import { useGetGalleryQuery } from './galleryApi';
import { Carousel } from '@/components/common/Carousel';
import { SlideControls } from '@/components/common/SlideControls';
import { QueryState } from '@/components/common/QueryState';
import { cn } from '@/lib/utils';
import { getShopImageDetailsForIndex } from '@/features/shop/productImages';

/**
 * Works Gallery Slider with 2-column layout and right viewport bleed
 * Exactly matches the reference design.
 *
 * @returns {JSX.Element}
 */
export function WorksSlider() {
  const { data: galleryItems = [], isLoading, isError, error, refetch } = useGetGalleryQuery();
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  const total = galleryItems.length || 15;
  const currentNum = Math.min(currentSlide + 1, total);

  const skeleton = (
    <div className="flex gap-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="w-[260px] sm:w-[300px] aspect-[4/5] rounded-2xl bg-card border border-border-light animate-pulse shrink-0"
        />
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading, description, live counter, and arrow controls */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink font-bold uppercase tracking-tight leading-[0.92]">
            DISCOVER<br />OUR WORKS
          </h2>

          <p className="text-xs sm:text-sm text-ink/80 font-body leading-relaxed max-w-[340px] mt-4 sm:mt-5">
            Our team of experienced barbers is dedicated to their craft. We stay updated with the
            latest techniques and styles to ensure you get the best service possible.
          </p>

          {/* Live Slide Counter & Slide Controls */}
          <div className="flex flex-col gap-2 mt-8 sm:mt-12">
            <span className="font-mono text-sm sm:text-base font-semibold tracking-wider text-ink select-none">
              ({total}/{currentNum})
            </span>

            <SlideControls
              onPrev={() => carouselRef.current?.scrollPrev()}
              onNext={() => carouselRef.current?.scrollNext()}
              canPrev={currentSlide > 0}
              canNext={currentSlide < total - 1}
            />
          </div>
        </div>

        {/* Right Column: Embla Carousel governed by QueryState */}
        <div className="lg:col-span-7 relative w-full overflow-hidden">
          <QueryState
            isLoading={isLoading}
            isError={isError}
            error={error}
            isEmpty={galleryItems.length === 0}
            emptyMessage="No gallery items found."
            skeleton={skeleton}
            onRetry={refetch}
          >
            <Carousel
              ref={carouselRef}
              options={{ loop: false, align: 'start', dragFree: false }}
              onSlideChange={(index) => setCurrentSlide(index)}
              className="overflow-visible"
              containerClassName="gap-5 sm:gap-6"
              ariaLabel="Works Gallery Showcase"
            >
              {galleryItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    'w-[240px] sm:w-[280px] md:w-[320px] shrink-0 rounded-2xl overflow-hidden group select-none relative',
                    'aspect-[4/5] bg-card border border-card-border/40 shadow-sm transition-all duration-base hover:-translate-y-1 hover:shadow-md'
                  )}
                >
                  <img
                    src={getShopImageDetailsForIndex(idx).src}
                    alt={getShopImageDetailsForIndex(idx).alt}
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover object-center transition-transform duration-slow group-hover:scale-105"
                  />
                </div>
              ))}
            </Carousel>
          </QueryState>
        </div>
      </div>
    </div>
  );
}

export default WorksSlider;
