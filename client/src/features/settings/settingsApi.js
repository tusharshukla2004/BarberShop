import { baseApi, normalizeError } from '@/app/baseApi';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => '/settings',
      transformResponse: (response) => response?.data || {},
      transformErrorResponse: normalizeError,
      providesTags: ['Settings'],
    }),

    updateSettings: builder.mutation({
      query: (data) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Settings', 'Slots'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;

export default settingsApi;
