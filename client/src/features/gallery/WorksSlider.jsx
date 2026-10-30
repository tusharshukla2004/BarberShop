import { useState, useRef } from 'react';
import { useGetGalleryQuery } from './galleryApi';
import { SectionHeading } from '@/components/ui';
import { Carousel } from '@/components/common/Carousel';
import { SlideControls } from '@/components/common/SlideControls';
import { QueryState } from '@/components/common/QueryState';
import { cn } from '@/lib/utils';

/**
 * Works Gallery Slider with 2-column layout and right viewport bleed
 * @returns {JSX.Element}
 */
export function WorksSlider() {
  const { data: galleryItems = [], isLoading, isError, error, refetch } = useGetGalleryQuery();
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  const total = galleryItems.length;
  const currentFormatted = String(total > 0 ? Math.min(currentSlide + 1, total) : 0).padStart(
    2,
    '0'
  );
  const totalFormatted = String(total).padStart(2, '0');

  const skeleton = (
    <div className="flex gap-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="w-[260px] sm:w-[300px] aspect-[4/5] rounded-lg bg-card border border-border-light animate-pulse shrink-0"
        />
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading, description, live counter, and arrow controls */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-left">
          <SectionHeading
            subtitle="Curated Portfolio"
            title="DISCOVER OUR WORKS"
            align="left"
            tone="light"
            className="gap-3"
          />

          <p className="text-sm sm:text-base text-ink/75 font-body leading-relaxed max-w-md">
            Explore our latest artisan cuts, skin fades, and beard tapers. Each look is customized
            to accentuate facial geometry and personal style.
          </p>

          {/* Live Slide Counter & Slide Controls */}
          <div className="flex items-center gap-6 pt-4 border-t border-border-light">
            <span className="font-mono text-lg font-bold tracking-widest text-ink select-none">
              ({currentFormatted}/{totalFormatted})
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
              containerClassName="gap-5"
              ariaLabel="Works Gallery Showcase"
            >
              {galleryItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    'w-[240px] sm:w-[280px] md:w-[320px] shrink-0 rounded-lg overflow-hidden group select-none relative',
                    'aspect-[4/5] bg-card border border-card-border shadow-sm transition-all duration-base hover:-translate-y-1 hover:shadow-md'
                  )}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption || item.category}
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover object-center transition-transform duration-slow group-hover:scale-105"
                  />
                  {/* Subtle bottom gradient & caption overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-90 transition-opacity p-4 flex flex-col justify-end text-left">
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-accent">
                      {item.category}
                    </span>
                    <h3 className="font-display text-lg sm:text-xl text-white uppercase tracking-wide leading-tight mt-0.5">
                      {item.caption}
                    </h3>
                  </div>
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
