import { baseApi, normalizeError } from '@/app/baseApi';

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => '/services',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Service', id })), { type: 'Service', id: 'LIST' }]
          : [{ type: 'Service', id: 'LIST' }],
    }),
  }),
});

export const { useGetServicesQuery } = servicesApi;

export default servicesApi;
