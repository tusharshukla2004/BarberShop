import { useState, useMemo } from 'react';
import { Maximize2 } from 'lucide-react';
import Seo from '@/components/common/Seo';
import PageBanner from '@/components/common/PageBanner';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import QueryState from '@/components/common/QueryState';
import Lightbox from '@/components/common/Lightbox';
import { useGetGalleryQuery } from '@/features/gallery/galleryApi';
import { getShopImageDetailsForIndex } from '@/features/shop/productImages';

export default function GalleryPage() {
  const { data: galleryItems = [], isLoading, isError, error, refetch } = useGetGalleryQuery();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    galleryItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [galleryItems]);

  // Filtered gallery items
  const filteredItems = useMemo(() => {
    const itemsWithShopImages = galleryItems.map((item, index) => {
      const image = getShopImageDetailsForIndex(index);
      return { ...item, imageUrl: image.src, imageAlt: image.alt };
    });

    if (selectedCategory === 'All') return itemsWithShopImages;
    return itemsWithShopImages.filter(
      (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [galleryItems, selectedCategory]);

  return (
    <>
      <Seo
        title="Works & Portfolio Gallery | Sovereign Barbershop"
        description="Browse our portfolio of artisanal scissor fades, hot towel straight razor shaves, bespoke beard trims, and transformations."
        canonical="/gallery"
      />

      <PageBanner
        eyebrow="Craft In Pictures"
        title="OUR WORKS & PORTFOLIO"
        description="A curated look into our daily craft. Precision razor alignments, textured crops, and classic hot-towel grooming captured in our sanctuary."
      />

      <Section tone="cream" className="py-12 md:py-20">
        <Container>
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'bg-ink text-white shadow-md'
                      : 'bg-card text-ink hover:bg-ink/10'
                  }`}
                  aria-pressed={isSelected}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <QueryState
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
            isEmpty={!isLoading && filteredItems.length === 0}
            emptyMessage="No portfolio items found for this category."
          >
            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-border-light text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`View ${item.caption || item.category || 'work'} in fullscreen`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient Overlay & Details on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">
                      {item.category}
                    </span>
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {item.caption}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-white/80">
                      <Maximize2 className="w-3.5 h-3.5 text-accent" />
                      <span>Click to expand</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </QueryState>
        </Container>
      </Section>

      {/* Accessible Lightbox Modal */}
      <Lightbox
        isOpen={lightboxIndex >= 0}
        currentIndex={Math.max(0, lightboxIndex)}
        items={filteredItems}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={(newIndex) => setLightboxIndex(newIndex)}
      />
    </>
  );
}
