import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {'success' | 'error' | 'info'} ToastType
 *
 * @typedef {Object} ToastItem
 * @property {string} id - Unique identifier
 * @property {string} message - User-facing text
 * @property {ToastType} [type='info'] - Severity variant
 * @property {number} [duration=4000] - Auto-dismiss duration in ms
 */

/**
 * @typedef {Object} UiState
 * @property {boolean} mobileMenuOpen - Mobile drawer toggle
 * @property {ToastItem[]} toasts - Active toasts queue
 */

const initialState = {
  mobileMenuOpen: false,
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openMobileMenu: (state) => {
      state.mobileMenuOpen = true;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = Boolean(action.payload);
    },
    addToast: {
      reducer: (state, action) => {
        state.toasts.push(action.payload);
      },
      prepare: ({ message, type = 'info', duration = 4000 }) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        return { payload: { id, message, type, duration } };
      },
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const {
  openMobileMenu,
  closeMobileMenu,
  toggleMobileMenu,
  setMobileMenuOpen,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectToasts = (state) => state.ui.toasts;

export default uiSlice.reducer;
