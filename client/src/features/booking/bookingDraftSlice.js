import { createSlice, createSelector } from '@reduxjs/toolkit';

const STORAGE_KEY = 'barbershop_booking_draft';

/**
 * Loads persisted initial draft from sessionStorage if available
 * @returns {Object}
 */
const loadInitialDraft = () => {
  const defaultState = {
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
    whatsappConsent: false,
    appliedOffer: null,
    promoCode: '',
    discountAmount: 0,
    confirmedBooking: null,
  };

  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      // Map legacy name property if present
      customerName: parsed.customerName || parsed.name || '',
    };
  } catch {
    return defaultState;
  }
};

const initialState = loadInitialDraft();

export const bookingDraftSlice = createSlice({
  name: 'bookingDraft',
  initialState,
  reducers: {
    setBookingStep: (state, action) => {
      state.currentStep = action.payload;
    },
    saveBookingDraft: (state, action) => {
      Object.assign(state, action.payload);
      if (action.payload.name && !action.payload.customerName) {
        state.customerName = action.payload.name;
      }
      if (action.payload.customerName && !action.payload.name) {
        state.name = action.payload.customerName;
      }
    },
    selectService: (state, action) => {
      state.serviceId = action.payload;
      // Invalidate existing slot if service duration changes
      state.startTime = '';
      state.endTime = '';
    },
    selectBarber: (state, action) => {
      state.barberId = action.payload;
      state.startTime = '';
      state.endTime = '';
    },
    selectSlot: (state, action) => {
      state.date = action.payload.date;
      state.startTime = action.payload.startTime;
      state.endTime = action.payload.endTime || action.payload.startTime;
    },
    setConfirmedBooking: (state, action) => {
      state.confirmedBooking = action.payload;
      state.currentStep = 5;
    },
    applyOffer: (state, action) => {
      const { offer, promoCode, discountAmount } = action.payload || {};
      state.appliedOffer = offer || null;
      state.promoCode = (promoCode || offer?.promoCode || '').toUpperCase();
      state.discountAmount = discountAmount || 0;
      // Always reset to Step 1 (Service Selection) and clear pre-selected barber/slot
      state.currentStep = 1;
      state.barberId = '';
      state.startTime = '';
      state.endTime = '';
    },
    removeOffer: (state) => {
      state.appliedOffer = null;
      state.promoCode = '';
      state.discountAmount = 0;
    },
    clearBookingDraft: (state) => {
      state.currentStep = 1;
      state.serviceId = '';
      state.barberId = '';
      state.date = '';
      state.startTime = '';
      state.endTime = '';
      state.name = '';
      state.customerName = '';
      state.phone = '';
      state.email = '';
      state.notes = '';
      state.agreedToPolicy = false;
      state.whatsappConsent = false;
      state.appliedOffer = null;
      state.promoCode = '';
      state.discountAmount = 0;
      state.confirmedBooking = null;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore storage error
        }
      }
    },
  },
});

export const {
  setBookingStep,
  saveBookingDraft,
  selectService,
  selectBarber,
  selectSlot,
  applyOffer,
  removeOffer,
  setConfirmedBooking,
  clearBookingDraft,
} = bookingDraftSlice.actions;

// Base Selectors
export const selectBookingDraft = (state) => state.bookingDraft;
export const selectCurrentStep = (state) => state.bookingDraft.currentStep;
export const selectConfirmedBooking = (state) => state.bookingDraft.confirmedBooking;

// Derived Selectors
export const selectIsDraftReady = createSelector([selectBookingDraft], (draft) =>
  Boolean((draft.customerName || draft.name) && draft.phone && (draft.date || draft.dateTime))
);

export const selectDraftSummary = createSelector([selectBookingDraft], (draft) => ({
  name: draft.customerName || draft.name || '',
  customerName: draft.customerName || draft.name || '',
  phone: draft.phone || '',
  email: draft.email || '',
  serviceId: draft.serviceId || '',
  barberId: draft.barberId || '',
  date: draft.date || '',
  startTime: draft.startTime || '',
  endTime: draft.endTime || '',
  notes: draft.notes || '',
  hasContactInfo: Boolean((draft.customerName || draft.name) && draft.phone),
}));

export default bookingDraftSlice.reducer;
