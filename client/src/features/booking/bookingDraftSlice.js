import { createSlice, createSelector } from '@reduxjs/toolkit';

const STORAGE_KEY = 'barbershop_booking_draft';

/**
 * Loads persisted initial draft from sessionStorage if available
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
      Object.assign(state, action.payload);
    },
    clearBookingDraft: (state) => {
      state.name = '';
      state.phone = '';
      state.email = '';
      state.dateTime = '';
      state.serviceId = '';
      state.barberId = '';
    },
  },
});

export const { saveBookingDraft, clearBookingDraft } = bookingDraftSlice.actions;

// Base Selector
export const selectBookingDraft = (state) => state.bookingDraft;

// Derived Selectors using createSelector
export const selectIsDraftReady = createSelector([selectBookingDraft], (draft) =>
  Boolean(draft.name && draft.phone && draft.dateTime)
);

export const selectDraftSummary = createSelector([selectBookingDraft], (draft) => ({
  name: draft.name,
  phone: draft.phone,
  dateTime: draft.dateTime,
  hasContactInfo: Boolean(draft.name && draft.phone),
}));

export default bookingDraftSlice.reducer;
