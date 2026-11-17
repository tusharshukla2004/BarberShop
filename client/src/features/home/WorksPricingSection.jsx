import { motion } from 'framer-motion';
import { Container, Section } from '@/components/ui';
import { WorksSlider } from '@/features/gallery/WorksSlider';
import { TestimonialSlider } from '@/features/reviews/TestimonialSlider';
import { PriceList } from '@/features/services/PriceList';

/**
 * Combined Cream Section for Home Page:
 * 1. Part A: "DISCOVER OUR WORKS" Gallery Slider (with portrait cards, counter, and long arrows)
 * 2. Parts B & C: Side-by-side Orange Testimonial Card + "OUR PRICES" minimalist list
 * Enhanced with Framer Motion scroll entrance
 *
 * @returns {JSX.Element}
 */
export function WorksPricingSection() {
  return (
    <Section tone="cream" py="lg" id="works-pricing" className="overflow-hidden">
      <Container className="flex flex-col gap-12 sm:gap-16 md:gap-20">
        {/* Part A: Works Gallery Slider with smooth entrance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <WorksSlider />
        </motion.div>

        {/* Parts B & C: Testimonial Card (Left) and Price List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Part B: Testimonial Card */}
          <motion.div
            className="lg:col-span-5 flex flex-col justify-stretch"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <TestimonialSlider />
          </motion.div>

          {/* Part C: Price List */}
          <motion.div
            className="lg:col-span-7 flex flex-col justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <PriceList />
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}

export default WorksPricingSection;
