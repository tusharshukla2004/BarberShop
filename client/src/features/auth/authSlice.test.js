import { describe, it, expect } from 'vitest';
import authReducer, {
  setCredentials,
  logout,
  selectIsAuthenticated,
  selectIsAdmin,
} from './authSlice';

describe('authSlice', () => {
  const initial = {
    user: null,
    role: 'guest',
    status: 'idle',
  };

  it('sets user credentials and authenticated status', () => {
    const user = { id: 'usr-1', name: 'Admin User', email: 'admin@blade.in', role: 'admin' };
    const state = authReducer(initial, setCredentials({ user }));

    expect(state.user).toEqual(user);
    expect(state.role).toBe('admin');
    expect(state.status).toBe('authenticated');

    expect(selectIsAuthenticated({ auth: state })).toBe(true);
    expect(selectIsAdmin({ auth: state })).toBe(true);
  });

  it('clears state on logout', () => {
    const authenticatedState = {
      user: { id: 'usr-1', name: 'User', role: 'client' },
      role: 'client',
      status: 'authenticated',
    };

    const state = authReducer(authenticatedState, logout());
    expect(state.user).toBeNull();
    expect(state.role).toBe('guest');
    expect(state.status).toBe('unauthenticated');
    expect(selectIsAuthenticated({ auth: state })).toBe(false);
  });
});
