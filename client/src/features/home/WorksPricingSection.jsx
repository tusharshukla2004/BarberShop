import { Container, Section } from '@/components/ui';
import { WorksSlider } from '@/features/gallery/WorksSlider';
import { TestimonialSlider } from '@/features/reviews/TestimonialSlider';
import { PriceList } from '@/features/services/PriceList';

/**
 * Combined Cream Section for Home Page:
 * 1. Part A: "DISCOVER OUR WORKS" Gallery Slider (with portrait cards, counter, and long arrows)
 * 2. Parts B & C: Side-by-side Orange Testimonial Card + "OUR PRICES" minimalist list
 *
 * @returns {JSX.Element}
 */
export function WorksPricingSection() {
  return (
    <Section tone="cream" py="lg" id="works-pricing" className="overflow-hidden">
      <Container className="flex flex-col gap-14 sm:gap-20 md:gap-24">
        {/* Part A: Works Gallery Slider */}
        <WorksSlider />

        {/* Parts B & C: Testimonial Card (Left) and Price List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Part B: Testimonial Card */}
          <div className="lg:col-span-5 flex flex-col justify-stretch">
            <TestimonialSlider />
          </div>

          {/* Part C: Price List */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <PriceList />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default WorksPricingSection;
