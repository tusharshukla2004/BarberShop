import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GalleryShowcaseSection } from './GalleryShowcaseSection';

describe('GalleryShowcaseSection', () => {
  it('renders the supplied barber photos in two oppositely moving rows', () => {
    render(<GalleryShowcaseSection />);

    const gallery = screen.getByRole('region', { name: /barbershop gallery/i });
    const rows = within(gallery).getAllByRole('list');

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute('data-scroll-direction', 'right');
    expect(rows[1]).toHaveAttribute('data-scroll-direction', 'left');
    expect(within(gallery).getAllByRole('img')).toHaveLength(12);
    expect(
      within(gallery).getAllByRole('img', { name: /brick-walled barbershop interior/i })[0]
    ).toHaveAttribute('src', expect.stringContaining('/assets/gallery/'));
  });
});
