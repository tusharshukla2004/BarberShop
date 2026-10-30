import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query Base API
 * Features inject specific endpoints via baseApi.injectEndpoints()
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    credentials: 'include',
  }),
  tagTypes: ['Service', 'Barber', 'Gallery', 'Review', 'Booking', 'Settings', 'Slots'],
  endpoints: () => ({}),
});

export default baseApi;
