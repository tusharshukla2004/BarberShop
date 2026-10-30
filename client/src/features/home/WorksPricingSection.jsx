import { Container, Section } from '@/components/ui';
import { WorksSlider } from '@/features/gallery/WorksSlider';
import { TestimonialSlider } from '@/features/reviews/TestimonialSlider';
import { PriceList } from '@/features/services/PriceList';

/**
 * Combined Cream Section for Home Page:
 * 1. Part A: "DISCOVER OUR WORKS" Gallery Slider (with 4:5 image cards and slide counter)
 * 2. Parts B & C: Side-by-side Testimonial Card (accent-colored) + "OUR PRICES" list
 *
 * @returns {JSX.Element}
 */
export function WorksPricingSection() {
  return (
    <Section tone="cream" py="lg" id="works-pricing" className="overflow-hidden">
      <Container className="flex flex-col gap-16 sm:gap-20 md:gap-24">
        {/* Part A: Works Gallery Slider */}
        <WorksSlider />

        {/* Separator Divider */}
        <div className="h-px w-full bg-border-light" aria-hidden="true" />

        {/* Parts B & C: Testimonial Card (Left) and Price List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Part B: Testimonial Card */}
          <div className="lg:col-span-5 flex flex-col justify-stretch">
            <TestimonialSlider />
          </div>

          {/* Part C: Price List */}
          <div className="lg:col-span-7 flex flex-col justify-stretch">
            <PriceList />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default WorksPricingSection;
