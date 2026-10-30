import { baseApi } from '@/app/baseApi';
import { mockBarbers } from '@/mocks/data';

export const barbersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBarbers: builder.query({
      query: () => '/barbers',
      transformResponse: (response) => response?.data || mockBarbers,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Barber', id })), { type: 'Barber', id: 'LIST' }]
          : [{ type: 'Barber', id: 'LIST' }],
    }),
  }),
});

export const { useGetBarbersQuery } = barbersApi;

export default barbersApi;
