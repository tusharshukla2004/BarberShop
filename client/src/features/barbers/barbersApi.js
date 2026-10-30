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

    createBarber: builder.mutation({
      query: (data) => ({
        url: '/admin/barbers',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Barber', id: 'LIST' }],
    }),

    updateBarber: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/barbers/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Barber', id },
        { type: 'Barber', id: 'LIST' },
        'Slots',
      ],
    }),

    deleteBarber: builder.mutation({
      query: (id) => ({
        url: `/admin/barbers/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Barber', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBarbersQuery,
  useCreateBarberMutation,
  useUpdateBarberMutation,
  useDeleteBarberMutation,
} = barbersApi;

export default barbersApi;
