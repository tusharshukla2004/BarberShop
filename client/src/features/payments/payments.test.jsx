import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';
import { baseApi } from '@/app/baseApi';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';

// Mock payments API hooks
vi.mock('@/features/payments/paymentsApi', async () => {
  const actual = await vi.importActual('@/features/payments/paymentsApi');
  return {
    ...actual,
    useGetAdminPaymentsQuery: vi.fn(),
    useGetReconciliationQuery: vi.fn(),
    useRefundPaymentMutation: vi.fn(),
    useMarkPaidAtShopMutation: vi.fn(),
  };
});

import {
  useGetAdminPaymentsQuery,
  useGetReconciliationQuery,
  useRefundPaymentMutation,
  useMarkPaidAtShopMutation,
} from '@/features/payments/paymentsApi';

describe('Payments & Deposits Feature Suite', () => {
  let store;
  const mockRefundMutate = vi.fn();
  const mockMarkPaidMutate = vi.fn();

  const mockPaymentsList = [
    {
      id: 'pay-1',
      bookingId: 'bk-1',
      razorpayOrderId: 'order_123',
      razorpayPaymentId: 'pay_123',
      amount: 20000, // ₹200
      refundedAmount: 0,
      currency: 'INR',
      purpose: 'deposit',
      status: 'captured',
      method: 'upi',
      createdAt: '2026-11-01T10:00:00.000Z',
      booking: {
        id: 'bk-1',
        customerName: 'Aman Gupta',
        phone: '9876543210',
        date: '2026-11-05',
        startTime: '10:00 AM',
        priceAtBooking: 1000,
        status: 'confirmed',
      },
    },
    {
      id: 'pay-2',
      bookingId: 'bk-2',
      razorpayOrderId: 'order_456',
      razorpayPaymentId: 'pay_456',
      amount: 15000, // ₹150
      refundedAmount: 15000,
      currency: 'INR',
      purpose: 'deposit',
      status: 'refunded',
      method: 'card',
      createdAt: '2026-10-31T12:00:00.000Z',
      booking: {
        id: 'bk-2',
        customerName: 'Rohan Mehra',
        phone: '9123456789',
        date: '2026-11-06',
        startTime: '02:00 PM',
        priceAtBooking: 750,
        status: 'cancelled',
      },
    },
  ];

  const mockReconciliation = {
    totalExpected: 1750,
    collectedOnline: 200,
    collectedAtShop: 500,
    pendingBalance: 800,
    refundedOnline: 150,
    totalCollected: 700,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    store = configureStore({
      reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
        ui: uiReducer,
      },
      middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    });

    useGetAdminPaymentsQuery.mockReturnValue({
      data: {
        payments: mockPaymentsList,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    useGetReconciliationQuery.mockReturnValue({
      data: mockReconciliation,
      isLoading: false,
      isError: false,
    });

    mockRefundMutate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    useRefundPaymentMutation.mockReturnValue([mockRefundMutate, { isLoading: false }]);

    mockMarkPaidMutate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    useMarkPaidAtShopMutation.mockReturnValue([mockMarkPaidMutate, { isLoading: false }]);
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminPaymentsPage />
        </MemoryRouter>
      </Provider>
    );

  it('renders reconciliation KPI summary cards with formatted metrics', () => {
    renderComponent();

    expect(screen.getByText('Payments & Financial Ledger')).toBeInTheDocument();
    expect(screen.getByText('Total Expected')).toBeInTheDocument();
    expect(screen.getByText('Collected Online')).toBeInTheDocument();
    expect(screen.getByText('Collected at Studio')).toBeInTheDocument();
    expect(screen.getByText('Pending Balances')).toBeInTheDocument();
    expect(screen.getAllByText('Refunded').length).toBeGreaterThan(0);
    expect(screen.getByText('₹1,750')).toBeInTheDocument();
    expect(screen.getAllByText('₹150').length).toBeGreaterThan(0);
  });

  it('renders payments transactions table with customers and order IDs', () => {
    renderComponent();

    expect(screen.getByText('Aman Gupta')).toBeInTheDocument();
    expect(screen.getByText('Rohan Mehra')).toBeInTheDocument();
    expect(screen.getByText('order_123')).toBeInTheDocument();
    expect(screen.getByText('order_456')).toBeInTheDocument();
  });

  it('opens refund modal when clicking refund button and confirms refund', async () => {
    renderComponent();

    const refundButtons = screen.getAllByRole('button', { name: /refund/i });
    fireEvent.click(refundButtons[0]);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText('Process Refund')).toBeInTheDocument();
      expect(screen.getByText(/Original Paid:/)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm refund/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRefundMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay-1',
          amountPaise: 20000,
        })
      );
    });
  });

  it('handles "Paid at Shop" button click to clear remaining balance', async () => {
    renderComponent();

    const paidAtShopBtn = screen.getByRole('button', { name: /paid at shop/i });
    fireEvent.click(paidAtShopBtn);

    await waitFor(() => {
      expect(mockMarkPaidMutate).toHaveBeenCalledWith('bk-1');
    });
  });
});
