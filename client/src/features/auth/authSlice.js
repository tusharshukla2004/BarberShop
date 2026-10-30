import { createSlice, createSelector } from '@reduxjs/toolkit';

/**
 * @typedef {Object} AuthState
 * @property {import('@/types').AuthUser | null} user
 * @property {'guest' | 'client' | 'admin' | 'staff'} role
 * @property {'idle' | 'loading' | 'authenticated' | 'unauthenticated'} status
 */

const initialState = {
  user: null,
  role: 'guest',
  status: 'idle',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      state.role = user?.role || 'client';
      state.status = 'authenticated';
    },
    logout: (state) => {
      state.user = null;
      state.role = 'guest';
      state.status = 'unauthenticated';
    },
    setAuthLoading: (state) => {
      state.status = 'loading';
    },
  },
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;

// Base Selectors
export const selectAuthState = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.role;
export const selectAuthStatus = (state) => state.auth.status;

// Derived Selectors using createSelector
export const selectIsAuthenticated = createSelector([selectCurrentUser], (user) => Boolean(user));

export const selectIsAdmin = createSelector([selectUserRole], (role) => role === 'admin');

export default authSlice.reducer;
