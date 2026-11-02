import { baseApi, normalizeError } from '@/app/baseApi';
import { setCredentials, logout as logoutAction } from './authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(setCredentials({ user: data.user }));
          }
        } catch {
          // Handled in component
        }
      },
    }),

    refresh: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(setCredentials({ user: data.user }));
          }
        } catch {
          dispatch(logoutAction());
        }
      },
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logoutAction());
          dispatch(baseApi.util.resetApiState());
        } catch {
          dispatch(logoutAction());
        }
      },
    }),

    getMe: builder.query({
      query: () => '/auth/me',
      transformResponse: (response) => response?.data?.user || response?.data || response,
      transformErrorResponse: normalizeError,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setCredentials({ user: data }));
          }
        } catch {
          // If unauthenticated, keep guest
        }
      },
    }),

    changePassword: builder.mutation({
      query: (passwords) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwords,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(setCredentials({ user: data.user }));
          }
        } catch {
          // Handled in component
        }
      },
    }),

    // Owner Staff Management
    getStaffUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['Staff'],
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
    }),

    createStaffUser: builder.mutation({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Staff'],
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
    }),

    updateStaffUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Staff'],
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
    }),

    resetStaffPassword: builder.mutation({
      query: ({ id, temporaryPassword }) => ({
        url: `/admin/users/${id}/reset-password`,
        method: 'POST',
        body: { temporaryPassword },
      }),
      invalidatesTags: ['Staff'],
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
    }),

    // Audit Logs
    getAuditLogs: builder.query({
      query: (params) => ({
        url: '/admin/audit-logs',
        params,
      }),
      providesTags: ['AuditLogs'],
      transformResponse: (response) => response?.data || { logs: [], pagination: {} },
      transformErrorResponse: normalizeError,
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetMeQuery,
  useChangePasswordMutation,
  useGetStaffUsersQuery,
  useCreateStaffUserMutation,
  useUpdateStaffUserMutation,
  useResetStaffPasswordMutation,
  useGetAuditLogsQuery,
} = authApi;
