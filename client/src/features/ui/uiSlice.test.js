import { describe, it, expect } from 'vitest';
import uiReducer, {
  openMobileMenu,
  closeMobileMenu,
  toggleMobileMenu,
  addToast,
  removeToast,
  clearToasts,
  selectMobileMenuOpen,
  selectToasts,
} from './uiSlice';

describe('uiSlice', () => {
  const initial = {
    mobileMenuOpen: false,
    toasts: [],
  };

  it('manages mobile drawer toggle states', () => {
    let state = uiReducer(initial, openMobileMenu());
    expect(state.mobileMenuOpen).toBe(true);

    state = uiReducer(state, toggleMobileMenu());
    expect(state.mobileMenuOpen).toBe(false);

    state = uiReducer(state, openMobileMenu());
    state = uiReducer(state, closeMobileMenu());
    expect(selectMobileMenuOpen({ ui: state })).toBe(false);
  });

  it('manages toast notifications queue', () => {
    let state = uiReducer(initial, addToast({ message: 'Saved successfully', type: 'success' }));
    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].message).toBe('Saved successfully');
    expect(state.toasts[0].type).toBe('success');

    const toastId = state.toasts[0].id;
    state = uiReducer(state, removeToast(toastId));
    expect(selectToasts({ ui: state }).length).toBe(0);

    state = uiReducer(state, addToast({ message: 'Toast 1' }));
    state = uiReducer(state, addToast({ message: 'Toast 2' }));
    expect(state.toasts.length).toBe(2);

    state = uiReducer(state, clearToasts());
    expect(state.toasts.length).toBe(0);
  });
});
