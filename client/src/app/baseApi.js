import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '@/features/auth/authSlice';

/**
 * Normalized API error converter
 * @param {import('@reduxjs/toolkit/query').FetchBaseQueryError} response
 * @returns {import('@/types').ApiError}
 */
export const normalizeError = (response) => {
  const status = typeof response.status === 'number' ? response.status : 500;
  let message = 'An unexpected error occurred. Please try again.';

  if (typeof response.data?.error === 'string') {
    message = response.data.error;
  } else if (typeof response.data?.error?.message === 'string') {
    message = response.data.error.message;
  } else if (typeof response.data?.message === 'string') {
    message = response.data.message;
  } else if (typeof response.error === 'string') {
    message = response.error;
  }

  const details = response.data?.details || response.data?.error?.details || response.data || null;

  return { status, message, details };
};

export const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.startsWith('http')) {
    const trimmed = envUrl.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5173/api';
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers) => {
    // CSRF header for state-changing cookie requests
    headers.set('X-Requested-With', 'XMLHttpRequest');
    return headers;
  },
});

/**
 * Automatic 401 token refresh interceptor with single retry
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    // Don't loop refresh on login or refresh failures
    if (!url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      if (refreshResult?.data) {
        const user = refreshResult.data?.data?.user || refreshResult.data?.user;
        if (user) {
          api.dispatch(setCredentials({ user }));
        }
        // Retry initial request once
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        if (
          typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login'
        ) {
          const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/admin/login?returnTo=${returnTo}`;
        }
      }
    }
  }

  return result;
};

/**
 * Global RTK Query Base API
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Service',
    'Barber',
    'Gallery',
    'Review',
    'Booking',
    'Settings',
    'Slots',
    'Product',
    'Customer',
    'Reminders',
    'Queue',
    'QueueStatus',
    'Reports',
    'Offers',
    'Faqs',
    'Payment',
    'Package',
    'Membership',
    'Wallet',
    'Area',
    'Post',
    'Redirect',
    'SeoHealth',
    'Staff',
    'AuditLogs',
  ],
  endpoints: () => ({}),
});

export default baseApi;
