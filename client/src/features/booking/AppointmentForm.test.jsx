import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppointmentForm } from './AppointmentForm';
import { baseApi } from '@/app/baseApi';
import uiReducer from '@/features/ui/uiSlice';
import bookingDraftReducer from './bookingDraftSlice';

function renderForm() {
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
        <AppointmentForm />
      </MemoryRouter>
    </Provider>
  );
}

describe('AppointmentForm validation', () => {
  it('renders all form fields with accessible labels and placeholders', () => {
    renderForm();
    expect(screen.getByPlaceholderText(/john lennon/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred date and time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  it('displays inline validation errors when submitting empty form', async () => {
    renderForm();
    const submitBtn = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please select your preferred date & time/i)).toBeInTheDocument();
    });
  });
});
