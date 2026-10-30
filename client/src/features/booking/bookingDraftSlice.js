import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'barbershop_booking_draft';

/**
 * Safely reads the draft from sessionStorage
 * @returns {Object}
 */
const loadInitialDraft = () => {
  if (typeof window === 'undefined') {
    return {
      name: '',
      phone: '',
      email: '',
      dateTime: '',
      serviceId: '',
      barberId: '',
    };
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        name: '',
        phone: '',
        email: '',
        dateTime: '',
        serviceId: '',
        barberId: '',
      };
    }
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || '',
      phone: parsed.phone || '',
      email: parsed.email || '',
      dateTime: parsed.dateTime || '',
      serviceId: parsed.serviceId || '',
      barberId: parsed.barberId || '',
    };
  } catch {
    return {
      name: '',
      phone: '',
      email: '',
      dateTime: '',
      serviceId: '',
      barberId: '',
    };
  }
};

const initialState = loadInitialDraft();

export const bookingDraftSlice = createSlice({
  name: 'bookingDraft',
  initialState,
  reducers: {
    saveBookingDraft: (state, action) => {
      const updated = { ...state, ...action.payload };
      Object.assign(state, updated);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // sessionStorage may fail in private mode or full quota
        }
      }
    },
    clearBookingDraft: (state) => {
      state.name = '';
      state.phone = '';
      state.email = '';
      state.dateTime = '';
      state.serviceId = '';
      state.barberId = '';
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore removal error
        }
      }
    },
  },
});

export const { saveBookingDraft, clearBookingDraft } = bookingDraftSlice.actions;

export const selectBookingDraft = (state) => state.bookingDraft;

export default bookingDraftSlice.reducer;
