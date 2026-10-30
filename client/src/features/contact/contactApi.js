import { baseApi, normalizeError } from '@/app/baseApi';

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApi;
