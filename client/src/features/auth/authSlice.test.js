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
    const user = { id: 'usr-1', name: 'Owner User', email: 'owner@blade.in', role: 'owner' };
    const state = authReducer(initial, setCredentials({ user }));

    expect(state.user).toEqual({
      id: 'usr-1',
      name: 'Owner User',
      role: 'owner',
      barberId: null,
      mustChangePassword: false,
    });
    expect(state.role).toBe('owner');
    expect(state.status).toBe('authenticated');

    expect(selectIsAuthenticated({ auth: state })).toBe(true);
    expect(selectIsAdmin({ auth: state })).toBe(true);
  });

  it('sets barber credentials and isAdmin is true for barber', () => {
    const user = { id: 'barb-1', name: 'Barber User', email: 'barber@blade.in', role: 'barber', barberId: 'b1' };
    const state = authReducer(initial, setCredentials({ user }));

    expect(state.user).toEqual({
      id: 'barb-1',
      name: 'Barber User',
      role: 'barber',
      barberId: 'b1',
      mustChangePassword: false,
    });
    expect(state.role).toBe('barber');
    expect(selectIsAdmin({ auth: state })).toBe(true);
  });

  it('clears state on logout', () => {
    const authenticatedState = {
      user: { id: 'usr-1', name: 'User', role: 'barber' },
      role: 'barber',
      status: 'authenticated',
    };

    const state = authReducer(authenticatedState, logout());
    expect(state.user).toBeNull();
    expect(state.role).toBe('guest');
    expect(state.status).toBe('unauthenticated');
    expect(selectIsAuthenticated({ auth: state })).toBe(false);
  });
});
