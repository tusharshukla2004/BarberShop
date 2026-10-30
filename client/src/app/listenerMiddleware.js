import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  saveBookingDraft,
  clearBookingDraft,
  setBookingStep,
  selectService,
  selectBarber,
  selectSlot,
  setConfirmedBooking,
} from '@/features/booking/bookingDraftSlice';

const STORAGE_KEY = 'barbershop_booking_draft';

export const listenerMiddleware = createListenerMiddleware();

// Synchronize booking draft changes to sessionStorage
listenerMiddleware.startListening({
  matcher: isAnyOf(
    saveBookingDraft,
    clearBookingDraft,
    setBookingStep,
    selectService,
    selectBarber,
    selectSlot,
    setConfirmedBooking
  ),
  effect: (action, listenerApi) => {
    if (typeof window === 'undefined') return;

    if (action.type === clearBookingDraft.type) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    } else {
      const draftState = listenerApi.getState().bookingDraft;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draftState));
      } catch {
        // Ignore storage errors
      }
    }
  },
});

export default listenerMiddleware;
