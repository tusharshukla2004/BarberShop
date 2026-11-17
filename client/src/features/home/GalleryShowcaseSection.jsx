import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { BARBER_GALLERY_IMAGES } from '@/assets';

const galleryRows = [
  [0, 1, 2, 3, 4, 5],
  [6, 3, 7, 2, 5, 0],
];

const imageWidths = [
  'w-[72vw] sm:w-[42vw] lg:w-[34vw] max-w-[560px] min-w-[280px]',
  'w-[58vw] sm:w-[32vw] lg:w-[25vw] max-w-[420px] min-w-[220px]',
  'w-[68vw] sm:w-[38vw] lg:w-[30vw] max-w-[500px] min-w-[260px]',
  'w-[58vw] sm:w-[32vw] lg:w-[25vw] max-w-[420px] min-w-[220px]',
  'w-[68vw] sm:w-[38vw] lg:w-[30vw] max-w-[500px] min-w-[260px]',
  'w-[58vw] sm:w-[32vw] lg:w-[25vw] max-w-[420px] min-w-[220px]',
];

export function GalleryShowcaseSection() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const topRowX = useTransform(scrollYProgress, [0, 1], [-90, 90]);
  const bottomRowX = useTransform(scrollYProgress, [0, 1], [90, -90]);

  return (
    <section
      ref={sectionRef}
      aria-label="Barbershop gallery"
      className="overflow-hidden bg-black py-8 sm:py-10 lg:py-12"
    >
      <h2 className="sr-only">Inside our barbershop</h2>
      <div className="space-y-3 sm:space-y-5">
        {galleryRows.map((row, rowIndex) => (
          <motion.ul
            key={rowIndex}
            aria-label={rowIndex === 0 ? 'Gallery photos, moving right' : 'Gallery photos, moving left'}
            data-scroll-direction={rowIndex === 0 ? 'right' : 'left'}
            className="flex w-max gap-3 sm:gap-5"
            style={{
              x: prefersReducedMotion ? 0 : rowIndex === 0 ? topRowX : bottomRowX,
            }}
          >
            {row.map((imageIndex, imageIndexInRow) => {
              const image = BARBER_GALLERY_IMAGES[imageIndex];

              return (
                <li
                  key={`${rowIndex}-${imageIndexInRow}`}
                  className={`${imageWidths[imageIndexInRow]} h-[190px] shrink-0 overflow-hidden rounded-xl sm:h-[260px] sm:rounded-2xl lg:h-[340px]`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    className="h-full w-full object-cover"
                  />
                </li>
              );
            })}
          </motion.ul>
        ))}
      </div>
    </section>
  );
}

export default GalleryShowcaseSection;
