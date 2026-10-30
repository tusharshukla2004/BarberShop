import { baseApi, normalizeError } from '@/app/baseApi';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => '/settings',
      transformResponse: (response) => response?.data || {},
      transformErrorResponse: normalizeError,
      providesTags: ['Settings'],
    }),
  }),
});

export const { useGetSettingsQuery } = settingsApi;

export default settingsApi;
