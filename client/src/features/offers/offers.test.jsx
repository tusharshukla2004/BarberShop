import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HelmetProvider } from 'react-helmet-async';
import { baseApi } from '@/app/baseApi';
import uiReducer from '@/features/ui/uiSlice';
import bookingDraftReducer, {
  applyOffer,
  removeOffer,
} from '@/features/booking/bookingDraftSlice';
import OffersPage from '@/pages/OffersPage';
import { HomeOfferBanner } from './HomeOfferBanner';
import * as offersApiModule from './offersApi';

const mockOffersList = [
  {
    id: 'off-1',
    _id: 'off-1',
    title: { en: 'Festival Grooming 20% Off', hi: 'Special Special 20% Special' },
    description: { en: 'Get 20% off on premium haircuts', hi: 'Special Special Special 20% Special' },
    type: 'percent',
    value: 20,
    isActive: true,
    showOnHome: true,
    promoCode: 'FESTIVE20',
    startsAt: '2026-10-01T00:00:00.000Z',
    endsAt: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'off-2',
    _id: 'off-2',
    title: { en: 'Welcome Flat ₹100 Off', hi: '₹100 Special' },
    description: { en: 'Flat discount', hi: 'Special Special' },
    type: 'flat',
    value: 100,
    isActive: true,
    showOnHome: true,
    promoCode: 'WELCOME100',
    startsAt: '2026-10-01T00:00:00.000Z',
    endsAt: '2026-11-30T23:59:59.000Z',
  },
];

function renderWithStore(ui) {
  const store = configureStore({
    reducer: {
      ui: uiReducer,
      bookingDraft: bookingDraftReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  return {
    store,
    ...render(
      <HelmetProvider>
        <Provider store={store}>
          <MemoryRouter>{ui}</MemoryRouter>
        </Provider>
      </HelmetProvider>
    ),
  };
}

describe('Offers Feature & Redux Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('bookingDraftSlice offer actions', () => {
    it('applies offer and calculates discount correctly in draft state', () => {
      const store = configureStore({
        reducer: { bookingDraft: bookingDraftReducer },
      });

      store.dispatch(
        applyOffer({
          offer: { id: 'off-1', promoCode: 'FESTIVE20' },
          promoCode: 'FESTIVE20',
          discountAmount: 100,
        })
      );

      const state = store.getState().bookingDraft;
      expect(state.promoCode).toBe('FESTIVE20');
      expect(state.discountAmount).toBe(100);
      expect(state.appliedOffer.id).toBe('off-1');

      store.dispatch(removeOffer());
      const clearedState = store.getState().bookingDraft;
      expect(clearedState.promoCode).toBe('');
      expect(clearedState.discountAmount).toBe(0);
      expect(clearedState.appliedOffer).toBeNull();
    });
  });

  describe('OffersPage component', () => {
    it('renders page heading and offers list from mock hook', () => {
      vi.spyOn(offersApiModule, 'useGetPublicOffersQuery').mockReturnValue({
        data: mockOffersList,
        isLoading: false,
        isError: false,
      });

      renderWithStore(<OffersPage />);

      expect(
        screen.getByRole('heading', { name: /exclusive grooming offers/i })
      ).toBeInTheDocument();

      expect(screen.getByText(/Festival Grooming 20% Off/i)).toBeInTheDocument();
      expect(screen.getByText(/FESTIVE20/i)).toBeInTheDocument();
      expect(screen.getByText(/WELCOME100/i)).toBeInTheDocument();
    });
  });

  describe('HomeOfferBanner component', () => {
    it('renders promotional banner and allows dismissal', () => {
      sessionStorage.clear();
      vi.spyOn(offersApiModule, 'useGetPublicOffersQuery').mockReturnValue({
        data: mockOffersList,
        isLoading: false,
        isError: false,
      });

      renderWithStore(<HomeOfferBanner />);

      expect(screen.getByText(/Claim Offer/i)).toBeInTheDocument();
      expect(screen.getByText(/Festival Grooming 20% Off/i)).toBeInTheDocument();

      const dismissBtn = screen.getByTitle(/dismiss offer banner/i);
      fireEvent.click(dismissBtn);

      expect(screen.queryByText(/Claim Offer/i)).not.toBeInTheDocument();
    });
  });
});
