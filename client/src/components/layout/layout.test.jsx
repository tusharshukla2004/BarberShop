import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '@/features/ui/uiSlice';
import authReducer from '@/features/auth/authSlice';
import { baseApi } from '@/app/baseApi';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageShell } from './PageShell';
import { siteConfig } from '@/config/site';

function renderWithProviders(ui, { route = '/' } = {}) {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      ui: uiReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>
  );
}

describe('Layout Components', () => {
  it('renders Navbar with brand logo and navigation links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByLabelText(`${siteConfig.name} Home`)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main Navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
  });

  it('renders Footer with columns and operational hours', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('Operational Hours')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reserve now/i })).toBeInTheDocument();
  });

  it('renders PageShell with skip link and main landmark', () => {
    renderWithProviders(<PageShell />);
    expect(screen.getByText('Skip to content')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
