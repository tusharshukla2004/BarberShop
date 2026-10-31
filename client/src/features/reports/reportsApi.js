import { baseApi } from '@/app/baseApi';

/**
 * Reports & Analytics RTK Query endpoints
 */
export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportsSummary: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/summary',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (response) => response.data || response,
    }),

    getBookingsOverTime: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/bookings-over-time',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (response) => response.data || response,
    }),

    getServicesReport: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/services',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (response) => response.data || response,
    }),

    getBarbersReport: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/barbers',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (response) => response.data || response,
    }),

    getPeakHoursReport: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/peak-hours',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (response) => response.data || response,
    }),

    getCustomersReport: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/customers',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (response) => response.data || response,
    }),

    getNoShowsReport: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/no-shows',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (response) => response.data || response,
    }),

    getSourcesReport: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/sources',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (response) => response.data || response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReportsSummaryQuery,
  useGetBookingsOverTimeQuery,
  useGetServicesReportQuery,
  useGetBarbersReportQuery,
  useGetPeakHoursReportQuery,
  useGetCustomersReportQuery,
  useGetNoShowsReportQuery,
  useGetSourcesReportQuery,
} = reportsApi;

