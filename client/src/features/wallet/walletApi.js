import { baseApi, normalizeError } from '@/app/baseApi';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public Endpoints
    getPublicPackages: builder.query({
      query: () => '/packages',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: ['Package'],
    }),

    getPublicMemberships: builder.query({
      query: () => '/memberships',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: ['Membership'],
    }),

    getPublicWallet: builder.query({
      query: (token) => `/wallet/${token}`,
      transformResponse: (response) => response?.data || null,
      transformErrorResponse: normalizeError,
      providesTags: ['Wallet'],
    }),

    // Admin Packages & Plans CRUD
    getAdminPackages: builder.query({
      query: () => '/admin/packages',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: ['Package'],
    }),

    createPackage: builder.mutation({
      query: (data) => ({
        url: '/admin/packages',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Package'],
    }),

    updatePackage: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/packages/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Package'],
    }),

    deletePackage: builder.mutation({
      query: (id) => ({
        url: `/admin/packages/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Package'],
    }),

    getAdminMemberships: builder.query({
      query: () => '/admin/memberships',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: ['Membership'],
    }),

    createMembership: builder.mutation({
      query: (data) => ({
        url: '/admin/memberships',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Membership'],
    }),

    updateMembership: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/memberships/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Membership'],
    }),

    deleteMembership: builder.mutation({
      query: (id) => ({
        url: `/admin/memberships/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Membership'],
    }),

    // Customer Wallet & Operations
    getCustomerWallet: builder.query({
      query: (customerId) => `/admin/customers/${customerId}/wallet`,
      transformResponse: (response) => response?.data || {},
      transformErrorResponse: normalizeError,
      providesTags: (result, error, customerId) => [{ type: 'Wallet', id: customerId }],
    }),

    sellPackage: builder.mutation({
      query: ({ customerId, ...data }) => ({
        url: `/admin/customers/${customerId}/packages`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Wallet', id: customerId },
        'Customer',
        'Reports',
      ],
    }),

    sellMembership: builder.mutation({
      query: ({ customerId, ...data }) => ({
        url: `/admin/customers/${customerId}/memberships`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Wallet', id: customerId },
        'Customer',
        'Reports',
      ],
    }),

    consumePackageSession: builder.mutation({
      query: ({ customerId, ...data }) => ({
        url: `/admin/customers/${customerId}/consume-session`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Wallet', id: customerId },
        'Booking',
        'Reports',
      ],
    }),

    reversePackageSession: builder.mutation({
      query: ({ customerId, ...data }) => ({
        url: `/admin/customers/${customerId}/reverse-session`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Wallet', id: customerId },
        'Booking',
        'Reports',
      ],
    }),

    adjustLoyalty: builder.mutation({
      query: ({ customerId, ...data }) => ({
        url: `/admin/customers/${customerId}/loyalty/adjust`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { customerId }) => [{ type: 'Wallet', id: customerId }],
    }),

    redeemLoyaltyReward: builder.mutation({
      query: ({ customerId, ...data }) => ({
        url: `/admin/customers/${customerId}/loyalty/redeem`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Wallet', id: customerId },
        'Booking',
        'Reports',
      ],
    }),

    reverseLoyalty: builder.mutation({
      query: ({ customerId, ...data }) => ({
        url: `/admin/customers/${customerId}/loyalty/reverse`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { customerId }) => [{ type: 'Wallet', id: customerId }],
    }),

    generateWalletToken: builder.mutation({
      query: (customerId) => ({
        url: `/admin/customers/${customerId}/wallet-token`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, customerId) => [{ type: 'Wallet', id: customerId }],
    }),

    revokeWalletToken: builder.mutation({
      query: (customerId) => ({
        url: `/admin/customers/${customerId}/wallet-token`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, customerId) => [{ type: 'Wallet', id: customerId }],
    }),

    // Rebooking & Expiry
    getExpiringWalletItems: builder.query({
      query: (days = 7) => `/admin/wallet/expiring?days=${days}`,
      transformResponse: (response) =>
        response?.data || { expiringPackages: [], expiringMemberships: [] },
      transformErrorResponse: normalizeError,
      providesTags: ['Wallet'],
    }),

    getDueForVisitCustomers: builder.query({
      query: (days = 28) => `/admin/customers/due-for-visit?days=${days}`,
      transformResponse: (response) => response?.data || { customers: [], total: 0 },
      transformErrorResponse: normalizeError,
      providesTags: ['Customer'],
    }),

    getUpcomingBirthdays: builder.query({
      query: (days = 7) => `/admin/customers/upcoming-birthdays?days=${days}`,
      transformResponse: (response) => response?.data || { upcomingBirthdays: [], total: 0 },
      transformErrorResponse: normalizeError,
      providesTags: ['Customer'],
    }),

    getWalletReport: builder.query({
      query: ({ from, to }) => `/admin/reports/wallet?from=${from}&to=${to}`,
      transformResponse: (response) => response?.data || {},
      transformErrorResponse: normalizeError,
      providesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetPublicPackagesQuery,
  useGetPublicMembershipsQuery,
  useGetPublicWalletQuery,
  useGetAdminPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useGetAdminMembershipsQuery,
  useCreateMembershipMutation,
  useUpdateMembershipMutation,
  useDeleteMembershipMutation,
  useGetCustomerWalletQuery,
  useSellPackageMutation,
  useSellMembershipMutation,
  useConsumePackageSessionMutation,
  useReversePackageSessionMutation,
  useAdjustLoyaltyMutation,
  useRedeemLoyaltyRewardMutation,
  useReverseLoyaltyMutation,
  useGenerateWalletTokenMutation,
  useRevokeWalletTokenMutation,
  useGetExpiringWalletItemsQuery,
  useGetDueForVisitCustomersQuery,
  useGetUpcomingBirthdaysQuery,
  useGetWalletReportQuery,
} = walletApi;

