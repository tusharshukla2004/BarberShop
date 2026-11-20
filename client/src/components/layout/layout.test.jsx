import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getByRole('link', { name: /admin sign in/i })).toHaveAttribute(
      'href',
      '/admin/login'
    );
  });

  it('links the mobile Admin Sign In button to the authentication page', () => {
    renderWithProviders(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));

    expect(screen.getAllByRole('link', { name: /admin sign in/i })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /admin sign in/i })[1]).toHaveAttribute(
      'href',
      '/admin/login'
    );
  });

  it('keeps the mobile navigation open until the user closes it', () => {
    renderWithProviders(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('dialog', { name: 'Navigation Menu' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Navigation Menu' })).not.toBeInTheDocument();
  });

  it('renders Footer with columns and operational hours', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('Operational Hours')).toBeInTheDocument();
    expect(screen.getByText('Visit Us')).toBeInTheDocument();
    expect(screen.getByText(siteConfig.address)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get directions/i })).toHaveAttribute(
      'href',
      `https://www.google.com/maps/dir/?api=1&destination=${siteConfig.location.lat},${siteConfig.location.lng}`
    );
    expect(screen.queryByRole('link', { name: /reserve now/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /chat on whatsapp/i })).not.toBeInTheDocument();
  });

  it('renders PageShell with skip link and main landmark', () => {
    renderWithProviders(<PageShell />);
    expect(screen.getByText('Skip to content')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
