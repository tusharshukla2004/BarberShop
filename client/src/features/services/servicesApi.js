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

    createService: builder.mutation({
      query: (data) => ({
        url: '/admin/services',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Service', id: 'LIST' }],
    }),

    updateService: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Service', id },
        { type: 'Service', id: 'LIST' },
      ],
    }),

    deleteService: builder.mutation({
      query: (id) => ({
        url: `/admin/services/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Service', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;

export default servicesApi;
