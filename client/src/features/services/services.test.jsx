import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { formatPrice } from '@/lib/formatters';
import { PriceList } from './PriceList';
import { TestimonialSlider } from '@/features/reviews/TestimonialSlider';
import { baseApi } from '@/app/baseApi';
import uiReducer from '@/features/ui/uiSlice';
import bookingDraftReducer from '@/features/booking/bookingDraftSlice';

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
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  );
}

describe('Services & Pricing Features', () => {
  describe('formatPrice utility', () => {
    it('formats price in Indian currency format without decimals', () => {
      expect(formatPrice(850)).toBe('₹850');
      expect(formatPrice(1350)).toBe('₹1,350');
      expect(formatPrice(0)).toBe('₹0');
    });
  });

  describe('PriceList component', () => {
    it('renders heading "OUR PRICES"', () => {
      renderWithStore(<PriceList />);
      expect(screen.getByRole('heading', { name: /our prices/i })).toBeInTheDocument();
    });
  });

  describe('TestimonialSlider component', () => {
    it('renders loading state or carousel on mount', () => {
      renderWithStore(<TestimonialSlider />);
      const loadingOrRegion =
        screen.queryByText(/loading testimonials/i) ||
        screen.queryByRole('region', { name: /client testimonials/i });
      expect(loadingOrRegion).toBeInTheDocument();
    });
  });
});
