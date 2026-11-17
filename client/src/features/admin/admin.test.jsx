import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';
import { baseApi } from '@/app/baseApi';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import FormField from '@/components/admin/FormField';
import DataTable from '@/components/admin/DataTable';
import ProtectedRoute from './ProtectedRoute';



describe('Admin Feature Components & Guards', () => {
  describe('StatusBadge', () => {
    it('renders confirmed status with emerald theme', () => {
      render(<StatusBadge status="confirmed" />);
      const badge = screen.getByText('Confirmed');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('emerald');
    });

    it('renders pending status with amber theme', () => {
      render(<StatusBadge status="pending" />);
      const badge = screen.getByText('Pending');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('amber');
    });

    it('renders cancelled status with rose theme', () => {
      render(<StatusBadge status="cancelled" />);
      const badge = screen.getByText('Cancelled');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('rose');
    });
  });

  describe('EmptyState', () => {
    it('renders custom title, message and fires action', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="No Services"
          message="Please add a new haircut service."
          actionLabel="Add Service"
          onAction={onAction}
        />
      );

      expect(screen.getByText('No Services')).toBeInTheDocument();
      expect(screen.getByText('Please add a new haircut service.')).toBeInTheDocument();

      const btn = screen.getByRole('button', { name: 'Add Service' });
      fireEvent.click(btn);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('ConfirmDialog', () => {
    it('does not render when isOpen is false', () => {
      render(
        <ConfirmDialog
          isOpen={false}
          title="Confirm Delete"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });

    it('renders modal and triggers onConfirm and onCancel callbacks', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          title="Confirm Delete"
          message="Delete this barber?"
          confirmLabel="Delete"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText('Delete this barber?')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('FormField', () => {
    it('renders label, asterisk when required, and error message', () => {
      render(
        <FormField label="Service Price" required error="Price must be positive" id="price-input">
          <input id="price-input" type="number" />
        </FormField>
      );

      expect(screen.getByText(/Service Price/)).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Price must be positive')).toBeInTheDocument();
    });
  });

  describe('DataTable', () => {
    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
    ];

    const data = [
      { id: '1', name: 'Devraj', role: 'Master Barber' },
      { id: '2', name: 'Arbaaz', role: 'Senior Stylist' },
    ];

    it('renders column headers and row cells', () => {
      render(<DataTable columns={columns} data={data} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Devraj')).toBeInTheDocument();
      expect(screen.getByText('Arbaaz')).toBeInTheDocument();
    });

    it('filters rows by search term input', () => {
      render(<DataTable columns={columns} data={data} searchPlaceholder="Search..." />);

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Arbaaz' } });

      expect(screen.getByText('Arbaaz')).toBeInTheDocument();
      expect(screen.queryByText('Devraj')).not.toBeInTheDocument();
    });

    it('renders accessor columns and searches translated record fields', () => {
      render(
        <DataTable
          columns={[
            { header: 'Question', accessor: (row) => row.question.en },
            { header: 'Category', accessor: (row) => row.category },
          ]}
          data={[{ id: 'faq-1', question: { en: 'How do I book?', hi: 'कैसे बुक करें?' }, category: 'Booking' }]}
          searchKey="question"
          searchPlaceholder="Search questions..."
        />
      );

      expect(screen.getByRole('columnheader', { name: 'Question' })).toBeInTheDocument();
      expect(screen.getByText('How do I book?')).toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText('Search questions...'), {
        target: { value: 'book' },
      });
      expect(screen.getByText('How do I book?')).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute Route Guard', () => {
    it('redirects unauthenticated guest users to /admin/login', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          ui: uiReducer,
          [baseApi.reducerPath]: baseApi.reducer,
        },
        preloadedState: {
          auth: {
            user: null,
            role: 'guest',
            status: 'unauthenticated',
          },
        },
        middleware: (gDM) => gDM().concat(baseApi.middleware),
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/admin/login" element={<div>Admin Login Page View</div>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<div>Protected Dashboard</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Admin Login Page View')).toBeInTheDocument();
      expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
    });

    it('renders protected child routes for authenticated owner', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          ui: uiReducer,
          [baseApi.reducerPath]: baseApi.reducer,
        },
        preloadedState: {
          auth: {
            user: { id: 'admin-1', name: 'Owner', role: 'owner' },
            role: 'owner',
            status: 'authenticated',
          },
        },
        middleware: (gDM) => gDM().concat(baseApi.middleware),
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/admin/login" element={<div>Admin Login Page View</div>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<div>Protected Dashboard Content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument();
    });
  });
});
