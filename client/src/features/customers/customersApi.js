import { baseApi } from '@/app/baseApi';

/**
 * Customers RTK Query endpoint definitions
 */
export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params = {}) => ({
        url: '/admin/customers',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.customers
          ? [
              ...result.data.customers.map((c) => ({ type: 'Customer', id: c.id || c._id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
      transformResponse: (response) => response.data || response,
    }),

    getCustomer: builder.query({
      query: (id) => ({
        url: `/admin/customers/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
      transformResponse: (response) => response.data || response,
    }),

    createCustomer: builder.mutation({
      query: (body) => ({
        url: '/admin/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
      transformResponse: (response) => response.data || response,
    }),

    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/customers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
      transformResponse: (response) => response.data || response,
    }),

    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/admin/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Customer', id: 'LIST' },
        { type: 'Booking' },
      ],
      transformResponse: (response) => response.data || response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;

export default customersApi;

