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
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi;
