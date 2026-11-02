import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HelmetProvider } from 'react-helmet-async';
import uiReducer from '@/features/ui/uiSlice';
import bookingDraftReducer from '@/features/booking/bookingDraftSlice';
import FaqPage from '@/pages/FaqPage';
import * as faqsApiModule from './faqsApi';

const mockFaqsList = [
  {
    id: 'faq-1',
    _id: 'faq-1',
    question: {
      en: 'Do I need an appointment or can I walk in?',
      hi: 'Special Special Special Special Special Special?',
    },
    answer: {
      en: 'Both! You can book in advance for guaranteed zero-wait chair time, or visit us directly.',
      hi: 'Special! Special Special Special Special Special Special Special Special Special Special Special Special',
    },
    category: 'Booking',
    order: 1,
    isPublished: true,
  },
  {
    id: 'faq-2',
    _id: 'faq-2',
    question: {
      en: 'What payment methods are accepted?',
      hi: 'Special Special Special Special Special Special Special?',
    },
    answer: {
      en: 'We accept UPI, cash, credit/debit cards, and mobile wallets.',
      hi: 'Special UPI, Special Special Special Special Special Special',
    },
    category: 'Pricing',
    order: 2,
    isPublished: true,
  },
  {
    id: 'faq-3',
    _id: 'faq-3',
    question: {
      en: 'What is your cancellation and reschedule policy?',
      hi: 'Special Special Special Special Special?',
    },
    answer: {
      en: 'You can reschedule or cancel free of charge up to 2 hours before your appointment.',
      hi: 'Special 2 Special Special Special Special:Special Special Special Special Special',
    },
    category: 'Policies',
    order: 3,
    isPublished: true,
  },
];

function renderWithStore(ui) {
  const store = configureStore({
    reducer: {
      ui: uiReducer,
      bookingDraft: bookingDraftReducer,
    },
  });

  return render(
    <HelmetProvider>
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    </HelmetProvider>
  );
}

describe('FAQ Page Feature', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(faqsApiModule, 'useGetPublicFaqsQuery').mockReturnValue({
      data: mockFaqsList,
      isLoading: false,
      isError: false,
    });
  });

  it('renders heading and accordion items', () => {
    renderWithStore(<FaqPage />);

    expect(
      screen.getByRole('heading', { name: /frequently asked questions/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Do I need an appointment or can I walk in\?/i)
    ).toBeInTheDocument();
  });

  it('filters questions via category pill filter', () => {
    renderWithStore(<FaqPage />);

    expect(screen.getByText(/Do I need an appointment or can I walk in\?/i)).toBeInTheDocument();

    const pricingTab = screen.getByRole('button', { name: 'Pricing' });
    fireEvent.click(pricingTab);

    expect(screen.getByText(/What payment methods are accepted\?/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Do I need an appointment or can I walk in\?/i)
    ).not.toBeInTheDocument();
  });

  it('filters questions via search input', () => {
    renderWithStore(<FaqPage />);

    const searchInput = screen.getByPlaceholderText(/search questions or keywords/i);
    fireEvent.change(searchInput, { target: { value: 'cancellation' } });

    expect(screen.getByText(/cancellation and reschedule policy/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Do I need an appointment or can I walk in\?/i)
    ).not.toBeInTheDocument();
  });

  it('expands answer on accordion question click', () => {
    renderWithStore(<FaqPage />);

    const accordionBtn = screen
      .getByText(/Do I need an appointment or can I walk in\?/i)
      .closest('button');
    fireEvent.click(accordionBtn);

    expect(
      screen.getByText(/You can book in advance for guaranteed zero-wait chair time/i)
    ).toBeInTheDocument();
  });
});
