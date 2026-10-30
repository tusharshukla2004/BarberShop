import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '@/features/ui/uiSlice';
import bookingDraftReducer from '@/features/booking/bookingDraftSlice';
import { ServiceLocationSection } from './ServiceLocationSection';
import { siteConfig } from '@/config/site';

function renderWithProviders(ui) {
  const store = configureStore({
    reducer: {
      ui: uiReducer,
      bookingDraft: bookingDraftReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
}

describe('ServiceLocationSection', () => {
  it('renders section heading and cta button', () => {
    renderWithProviders(<ServiceLocationSection />);
    expect(
      screen.getByRole('heading', { name: /service beyond expectation/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /submit request/i })).toHaveAttribute('href', '/book');
  });

  it('renders contact details and telephone link from siteConfig', () => {
    renderWithProviders(<ServiceLocationSection />);
    expect(screen.getByText(siteConfig.address)).toBeInTheDocument();
    const telLink = screen.getByRole('link', { name: siteConfig.phone });
    expect(telLink).toHaveAttribute('href', `tel:${siteConfig.phone.replace(/\s+/g, '')}`);
  });

  it('renders all operational hours', () => {
    renderWithProviders(<ServiceLocationSection />);
    siteConfig.hours.forEach((schedule) => {
      expect(screen.getByText(schedule.days)).toBeInTheDocument();
    });
  });
});
