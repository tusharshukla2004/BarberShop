import { createSlice, createSelector } from '@reduxjs/toolkit';

/**
 * @typedef {Object} StaffUser
 * @property {string} id
 * @property {string} name
 * @property {'owner' | 'barber'} role
 * @property {string|null} [barberId]
 * @property {boolean} [mustChangePassword]
 *
 * @typedef {Object} AuthState
 * @property {StaffUser | null} user
 * @property {'guest' | 'owner' | 'barber'} role
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
      state.user = user ? {
        id: user.id || user._id,
        name: user.name,
        role: user.role === 'barber' ? 'barber' : 'owner',
        barberId: user.barberId || null,
        mustChangePassword: Boolean(user.mustChangePassword),
      } : null;
      state.role = state.user?.role || 'guest';
      state.status = state.user ? 'authenticated' : 'unauthenticated';
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
export const selectAuthState = (state) => state.auth || initialState;
export const selectCurrentUser = (state) => state.auth?.user || null;
export const selectUserRole = (state) => state.auth?.role || 'guest';
export const selectAuthStatus = (state) => state.auth?.status || 'idle';

// Derived Selectors
export const selectIsAuthenticated = createSelector([selectCurrentUser], (user) => Boolean(user));
export const selectIsOwner = createSelector([selectUserRole], (role) => role === 'owner');
export const selectIsBarber = createSelector([selectUserRole], (role) => role === 'barber');
export const selectCanAccessAdmin = createSelector(
  [selectUserRole],
  (role) => role === 'owner' || role === 'barber'
);
export const selectIsAdmin = selectCanAccessAdmin;

export default authSlice.reducer;
