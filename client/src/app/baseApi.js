import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Normalized API error converter
 * @param {import('@reduxjs/toolkit/query').FetchBaseQueryError} response
 * @returns {import('@/types').ApiError}
 */
export const normalizeError = (response) => {
  const status = typeof response.status === 'number' ? response.status : 500;
  const message =
    response.data?.error ||
    response.data?.message ||
    response.error ||
    'An unexpected error occurred. Please try again.';
  const details = response.data?.details || response.data || null;

  return { status, message, details };
};

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.startsWith('http')) return envUrl;
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5173/api';
};

/**
 * Global RTK Query Base API
 * Tags: Service, Barber, Gallery, Review, Booking, Settings, Slots
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    credentials: 'include',
  }),
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
  ],
  endpoints: () => ({}),
});

export default baseApi;
