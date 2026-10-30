import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BarberCard } from './BarberCard';
import { JoinTeamCard } from './JoinTeamCard';
import { TeamSection } from './TeamSection';
import { siteConfig } from '@/config/site';
import { baseApi } from '@/app/baseApi';
import uiReducer from '@/features/ui/uiSlice';
import bookingDraftReducer from '@/features/booking/bookingDraftSlice';

const mockBarberItem = {
  id: 'barb-test-1',
  name: 'Devraj Saxena',
  role: 'Master Craftsman',
  imageUrl: 'https://example.com/barber.jpg',
  specialties: ['Scissor Cuts'],
  socials: {
    instagram: 'https://instagram.com/devraj',
  },
};

function renderWithStore(ui) {
  const store = configureStore({
    reducer: {
      ui: uiReducer,
      bookingDraft: bookingDraftReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (gDM) => gDM().concat(baseApi.middleware),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
}

describe('Barbers Feature', () => {
  describe('BarberCard', () => {
    it('renders barber portrait, name, and role', () => {
      render(
        <MemoryRouter>
          <BarberCard barber={mockBarberItem} />
        </MemoryRouter>
      );

      expect(screen.getByAltText(/portrait of devraj saxena/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Devraj Saxena' })).toBeInTheDocument();
      expect(screen.getByText('Master Craftsman')).toBeInTheDocument();
    });

    it('renders only existing social icon links', () => {
      render(
        <MemoryRouter>
          <BarberCard barber={mockBarberItem} />
        </MemoryRouter>
      );

      expect(
        screen.getByRole('button', { name: /visit devraj saxena's instagram profile/i })
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /twitter profile/i })).not.toBeInTheDocument();
    });
  });

  describe('JoinTeamCard', () => {
    it('renders recruitment title and careers link from siteConfig', () => {
      render(<JoinTeamCard />);
      expect(screen.getByText(siteConfig.careers.title)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: siteConfig.careers.label })).toHaveAttribute(
        'href',
        siteConfig.careers.href
      );
    });
  });

  describe('TeamSection', () => {
    it('renders heading "MEET OUR EXPERTS" and view all CTA', () => {
      renderWithStore(<TeamSection showAll={false} />);
      expect(screen.getByRole('heading', { name: /meet our experts/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view all barbers/i })).toHaveAttribute(
        'href',
        '/barbers'
      );
    });
  });
});
