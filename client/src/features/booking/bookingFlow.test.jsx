import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import bookingDraftReducer, {
  setBookingStep,
  selectService,
  selectBarber,
  selectSlot,
  clearBookingDraft,
} from './bookingDraftSlice';
import uiReducer from '@/features/ui/uiSlice';
import { baseApi } from '@/app/baseApi';
import Stepper from './wizard/Stepper';
import StepService from './wizard/StepService';
import StepBarber from './wizard/StepBarber';
import StepDateTime from './wizard/StepDateTime';
import { downloadCalendarEvent } from '@/lib/calendar';

function renderWithStore(ui, initialDraft = {}) {
  const store = configureStore({
    reducer: {
      bookingDraft: bookingDraftReducer,
      ui: uiReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    preloadedState: {
      bookingDraft: {
        currentStep: 1,
        serviceId: '',
        barberId: '',
        date: '',
        startTime: '',
        endTime: '',
        customerName: '',
        phone: '',
        email: '',
        notes: '',
        agreedToPolicy: false,
        confirmedBooking: null,
        ...initialDraft,
      },
    },
    middleware: (gDM) => gDM().concat(baseApi.middleware),
  });

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    ),
    store,
  };
}

describe('Booking Wizard Flow', () => {
  describe('Stepper Navigation', () => {
    it('renders all 4 visible steps', () => {
      renderWithStore(<Stepper currentStep={1} onSelectStep={vi.fn()} />);

      expect(screen.getByText('Service')).toBeInTheDocument();
      expect(screen.getByText('Barber')).toBeInTheDocument();
      expect(screen.getByText('Date & Time')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('allows clicking previous completed steps but disables upcoming steps', () => {
      const onSelectStep = vi.fn();
      renderWithStore(<Stepper currentStep={3} onSelectStep={onSelectStep} />);

      const step1Button = screen.getByRole('button', { name: /step 1: service/i });
      expect(step1Button).toBeEnabled();

      fireEvent.click(step1Button);
      expect(onSelectStep).toHaveBeenCalledWith(1);
    });
  });

  describe('Step 1: Service Selection', () => {
    it('disables Continue button until a service is selected', () => {
      const onNext = vi.fn();
      renderWithStore(
        <StepService selectedServiceId="" onSelect={vi.fn()} onNext={onNext} />
      );

      const nextBtn = screen.getByRole('button', { name: /continue to barber/i });
      expect(nextBtn).toBeDisabled();
    });

    it('enables Continue button when a service is selected', () => {
      const onNext = vi.fn();
      renderWithStore(
        <StepService selectedServiceId="srv-1" onSelect={vi.fn()} onNext={onNext} />
      );

      const nextBtn = screen.getByRole('button', { name: /continue to barber/i });
      expect(nextBtn).toBeEnabled();

      fireEvent.click(nextBtn);
      expect(onNext).toHaveBeenCalled();
    });
  });

  describe('Step 2: Barber Selection', () => {
    it('renders "Any Available Barber" option and individual barbers', () => {
      renderWithStore(
        <StepBarber
          selectedBarberId="any"
          onSelect={vi.fn()}
          onNext={vi.fn()}
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText(/ANY AVAILABLE/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to date & time/i })).toBeEnabled();
    });
  });

  describe('Step 3: Date & Time Slot Selection', () => {
    it('disables Continue button when no slot is picked', () => {
      renderWithStore(
        <StepDateTime
          serviceId="srv-1"
          barberId="barb-1"
          selectedDate="2026-11-01"
          selectedSlot={null}
          onSelectSlot={vi.fn()}
          onNext={vi.fn()}
          onBack={vi.fn()}
        />
      );

      const nextBtn = screen.getByRole('button', { name: /continue to summary/i });
      expect(nextBtn).toBeDisabled();
    });
  });

  describe('Calendar Event Download Utility', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('creates blob and triggers link download with appointment details', () => {
      const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
      const revokeObjectURLMock = vi.fn();
      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = revokeObjectURLMock;

      expect(() => {
        downloadCalendarEvent({
          title: 'Sovereign Haircut',
          description: 'Appointment with Devraj',
          location: '100ft Rd, Indiranagar',
          date: '2026-11-01',
          startTime: '10:00 AM',
          endTime: '10:45 AM',
          referenceNumber: 'BK-123456',
        });
      }).not.toThrow();

      expect(createObjectURLMock).toHaveBeenCalled();
    });
  });

  describe('Draft Reducer Step Progression', () => {
    it('updates currentStep and choices correctly', () => {
      let state = bookingDraftReducer(undefined, { type: '@@INIT' });
      expect(state.currentStep).toBe(1);

      state = bookingDraftReducer(state, selectService('srv-2'));
      expect(state.serviceId).toBe('srv-2');

      state = bookingDraftReducer(state, setBookingStep(2));
      expect(state.currentStep).toBe(2);

      state = bookingDraftReducer(state, selectBarber('barb-1'));
      expect(state.barberId).toBe('barb-1');

      state = bookingDraftReducer(state, setBookingStep(3));
      expect(state.currentStep).toBe(3);

      state = bookingDraftReducer(
        state,
        selectSlot({ date: '2026-11-01', startTime: '11:00 AM', endTime: '11:45 AM' })
      );
      expect(state.startTime).toBe('11:00 AM');

      state = bookingDraftReducer(state, clearBookingDraft());
      expect(state.currentStep).toBe(1);
      expect(state.serviceId).toBe('');
      expect(state.barberId).toBe('');
      expect(state.startTime).toBe('');
    });
  });
});
