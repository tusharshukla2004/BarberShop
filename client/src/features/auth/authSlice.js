import { createSlice, createSelector } from '@reduxjs/toolkit';

/**
 * @typedef {Object} AuthState
 * @property {import('@/types').AuthUser | null} user
 * @property {'guest' | 'client' | 'admin' | 'owner' | 'barber'} role
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

// Derived Selectors
export const selectIsAuthenticated = createSelector([selectCurrentUser], (user) => Boolean(user));

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === 'admin' || role === 'owner'
);

export const selectIsOwner = createSelector(
  [selectUserRole],
  (role) => role === 'owner' || role === 'admin'
);

export const selectIsBarber = createSelector(
  [selectUserRole],
  (role) => role === 'barber'
);

export const selectCanAccessAdmin = createSelector(
  [selectUserRole],
  (role) => ['owner', 'admin', 'barber'].includes(role)
);

export default authSlice.reducer;
