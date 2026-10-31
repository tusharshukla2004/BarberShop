import { baseApi, normalizeError } from '@/app/baseApi';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentOrder: builder.mutation({
      query: (data) => ({
        url: '/payments/create-order',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Slots'],
    }),

    verifyPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/verify',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Booking', 'Slots', 'Customer', 'Report', 'Payment'],
    }),

    getAdminPayments: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page);
        if (params.limit) queryParams.set('limit', params.limit);
        if (params.status && params.status !== 'all') queryParams.set('status', params.status);
        if (params.method && params.method !== 'all') queryParams.set('method', params.method);
        if (params.purpose && params.purpose !== 'all') queryParams.set('purpose', params.purpose);
        if (params.search) queryParams.set('search', params.search);
        if (params.from) queryParams.set('from', params.from);
        if (params.to) queryParams.set('to', params.to);

        const qs = queryParams.toString();
        return `/admin/payments${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response) => response?.data || { payments: [], pagination: {} },
      transformErrorResponse: normalizeError,
      providesTags: ['Payment'],
    }),

    getReconciliation: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.from) queryParams.set('from', params.from);
        if (params.to) queryParams.set('to', params.to);
        const qs = queryParams.toString();
        return `/admin/payments/reconciliation${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response) => response?.data || {},
      transformErrorResponse: normalizeError,
      providesTags: ['Payment', 'Booking'],
    }),

    refundPayment: builder.mutation({
      query: ({ id, amountPaise, reason, bypassPolicy }) => ({
        url: `/admin/payments/${id}/refund`,
        method: 'POST',
        body: { amountPaise, reason, bypassPolicy },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Payment', 'Booking', 'Report'],
    }),

    markPaidAtShop: builder.mutation({
      query: (id) => ({
        url: `/admin/bookings/${id}/mark-paid`,
        method: 'PATCH',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Payment', 'Booking', 'Report'],
    }),
  }),
});

export const {
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useGetAdminPaymentsQuery,
  useGetReconciliationQuery,
  useRefundPaymentMutation,
  useMarkPaidAtShopMutation,
} = paymentsApi;

export default paymentsApi;
