import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminPackagesPlansPage from '@/pages/admin/AdminPackagesPlansPage';
import CustomerWalletSection from '@/features/wallet/CustomerWalletSection';
import PublicWalletPage from '@/pages/public/PublicWalletPage';
import { baseApi } from '@/app/baseApi';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';

// Mock wallet API hooks
vi.mock('@/features/wallet/walletApi', async () => {
  const actual = await vi.importActual('@/features/wallet/walletApi');
  return {
    ...actual,
    useGetAdminPackagesQuery: vi.fn(),
    useGetAdminMembershipsQuery: vi.fn(),
    useGetExpiringWalletItemsQuery: vi.fn(),
    useGetCustomerWalletQuery: vi.fn(),
    useGetPublicWalletQuery: vi.fn(),
    useCreatePackageMutation: vi.fn(),
    useUpdatePackageMutation: vi.fn(),
    useDeletePackageMutation: vi.fn(),
    useCreateMembershipMutation: vi.fn(),
    useUpdateMembershipMutation: vi.fn(),
    useDeleteMembershipMutation: vi.fn(),
    useSellPackageMutation: vi.fn(),
    useSellMembershipMutation: vi.fn(),
    useConsumePackageSessionMutation: vi.fn(),
    useAdjustLoyaltyMutation: vi.fn(),
    useRedeemLoyaltyRewardMutation: vi.fn(),
    useGenerateWalletTokenMutation: vi.fn(),
    useRevokeWalletTokenMutation: vi.fn(),
  };
});

import {
  useGetAdminPackagesQuery,
  useGetAdminMembershipsQuery,
  useGetExpiringWalletItemsQuery,
  useGetCustomerWalletQuery,
  useGetPublicWalletQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useCreateMembershipMutation,
  useUpdateMembershipMutation,
  useDeleteMembershipMutation,
  useSellPackageMutation,
  useSellMembershipMutation,
  useConsumePackageSessionMutation,
  useAdjustLoyaltyMutation,
  useRedeemLoyaltyRewardMutation,
  useGenerateWalletTokenMutation,
  useRevokeWalletTokenMutation,
} from '@/features/wallet/walletApi';

describe('Prompt 19: Wallet, Packages & Memberships Client Suite', () => {
  let store;

  beforeEach(() => {
    vi.restoreAllMocks();

    store = configureStore({
      reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          user: { id: 'admin-1', role: 'owner', name: 'Devraj Owner' },
          role: 'owner',
          token: 'mock-token',
          status: 'authenticated',
        },
      },
      middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    });

    useCreatePackageMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useUpdatePackageMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useDeletePackageMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useCreateMembershipMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useUpdateMembershipMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useDeleteMembershipMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useSellPackageMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useSellMembershipMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useConsumePackageSessionMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useAdjustLoyaltyMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useRedeemLoyaltyRewardMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useGenerateWalletTokenMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    useRevokeWalletTokenMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  });

  describe('AdminPackagesPlansPage', () => {
    it('renders package items and open Add Package modal', () => {
      useGetAdminPackagesQuery.mockReturnValue({
        data: [
          {
            id: 'pkg-1',
            name: { en: '5x Grooming Pack', hi: '5x Special Special' },
            price: 2500,
            sessions: 5,
            validityDays: 90,
            isActive: true,
          },
        ],
        isLoading: false,
      });

      useGetAdminMembershipsQuery.mockReturnValue({
        data: [
          {
            id: 'plan-1',
            name: { en: 'VIP Club Monthly', hi: 'Special Special' },
            price: 999,
            durationDays: 30,
            benefits: [{ type: 'discount_percent', value: 20 }],
            isActive: true,
          },
        ],
        isLoading: false,
      });

      useGetExpiringWalletItemsQuery.mockReturnValue({
        data: { expiringPackages: [], expiringMemberships: [] },
        isLoading: false,
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <AdminPackagesPlansPage />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText(/5x Grooming Pack/i)).toBeInTheDocument();
      expect(screen.getByText('₹2500')).toBeInTheDocument();

      // Click Add Package button
      const addBtn = screen.getByRole('button', { name: /Add Package/i });
      fireEvent.click(addBtn);

      expect(screen.getByText(/Create New Prepaid Package/i)).toBeInTheDocument();
    });
  });

  describe('CustomerWalletSection', () => {
    it('renders customer active packages and loyalty stamp card progress', () => {
      useGetCustomerWalletQuery.mockReturnValue({
        data: {
          walletToken: 'valid-token-777',
          packages: [
            {
              id: 'cust-pkg-1',
              packageName: { en: 'Executive 5x Haircut Pack' },
              sessionsTotal: 5,
              sessionsUsed: 2,
              sessionsRemaining: 3,
              expiresAt: '2026-12-31',
              status: 'active',
            },
          ],
          membership: null,
          loyalty: {
            balance: 8,
            stampsForReward: 10,
            isRewardReady: false,
          },
        },
        isLoading: false,
        refetch: vi.fn(),
      });

      useGetAdminPackagesQuery.mockReturnValue({ data: [], isLoading: false });
      useGetAdminMembershipsQuery.mockReturnValue({ data: [], isLoading: false });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <CustomerWalletSection
              customerId="cust-123"
              customerPhone="9876543210"
              customerName="Sameer Verma"
            />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText(/Executive 5x Haircut Pack/i)).toBeInTheDocument();
      expect(screen.getByText(/3 \/ 5 remaining/i)).toBeInTheDocument();
      expect(screen.getByText(/8 of 10 stamps/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy Pass Link/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Share Pass/i })).toBeInTheDocument();
    });
  });

  describe('PublicWalletPage', () => {
    it('renders customer public digital pass with stamp progress', () => {
      useGetPublicWalletQuery.mockReturnValue({
        data: {
          customerName: 'Aakash Verma',
          walletToken: 'token-pass-123',
          packages: [
            {
              id: 'pkg-1',
              name: { en: 'Signature Grooming Pack' },
              sessionsRemaining: 4,
              sessionsTotal: 5,
              expiresAt: '2026-12-31',
            },
          ],
          membership: {
            name: { en: 'VIP Gold Club' },
            endsAt: '2026-11-30',
            benefits: [{ type: 'discount_percent', value: 20 }],
          },
          loyalty: {
            enabled: true,
            balance: 10,
            stampsForReward: 10,
            isRewardReady: true,
          },
          shop: {
            name: 'Modern Mane Luxury Barber Studio',
            phone: '919876543210',
          },
        },
        isLoading: false,
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/wallet/token-pass-123']}>
            <Routes>
              <Route path="/wallet/:token" element={<PublicWalletPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText(/Welcome, Aakash Verma!/i)).toBeInTheDocument();
      expect(screen.getByText(/VIP Member/i)).toBeInTheDocument();
      expect(screen.getByText(/★ Free Haircut Ready!/i)).toBeInTheDocument();
      expect(screen.getByText(/4 sessions left/i)).toBeInTheDocument();
    });
  });
});
