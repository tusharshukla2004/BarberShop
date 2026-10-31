import { baseApi, normalizeError } from '@/app/baseApi';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/products',
        params,
      }),
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Product', id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation({
      query: (data) => ({
        url: '/admin/products',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
