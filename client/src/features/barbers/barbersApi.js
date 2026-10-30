import { baseApi, normalizeError } from '@/app/baseApi';

export const barbersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBarbers: builder.query({
      query: () => '/barbers',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Barber', id })), { type: 'Barber', id: 'LIST' }]
          : [{ type: 'Barber', id: 'LIST' }],
    }),
  }),
});

export const { useGetBarbersQuery } = barbersApi;

export default barbersApi;
