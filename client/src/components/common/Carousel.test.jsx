import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlideControls } from './SlideControls';
import { Carousel } from './Carousel';

describe('Carousel and SlideControls Component Suite', () => {
  it('renders SlideControls in default variant with accessible previous and next buttons', async () => {
    const handlePrev = vi.fn();
    const handleNext = vi.fn();

    render(
      <SlideControls
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={true}
        canNext={true}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /previous slide/i });
    const nextBtn = screen.getByRole('button', { name: /next slide/i });

    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    await userEvent.click(prevBtn);
    expect(handlePrev).toHaveBeenCalledTimes(1);

    await userEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('correctly disables navigation buttons when canPrev or canNext is false', () => {
    render(
      <SlideControls
        onPrev={vi.fn()}
        onNext={vi.fn()}
        canPrev={false}
        canNext={true}
      />
    );

    expect(screen.getByRole('button', { name: /previous slide/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next slide/i })).not.toBeDisabled();
  });

  it('renders SlideControls in circular variant for testimonials', async () => {
    const handlePrev = vi.fn();
    const handleNext = vi.fn();

    render(
      <SlideControls
        variant="circular"
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={true}
        canNext={false}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /previous testimonial/i });
    const nextBtn = screen.getByRole('button', { name: /next testimonial/i });

    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });

  it('renders Carousel container with accessible region and children items', () => {
    render(
      <Carousel ariaLabel="Test Portfolio Carousel">
        <div>Slide 1</div>
        <div>Slide 2</div>
        <div>Slide 3</div>
      </Carousel>
    );

    const carouselRegion = screen.getByRole('region', { name: /test portfolio carousel/i });
    expect(carouselRegion).toBeInTheDocument();
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });
});
