import { baseApi, normalizeError } from '@/app/baseApi';

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: () => '/reviews',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Review', id })), { type: 'Review', id: 'LIST' }]
          : [{ type: 'Review', id: 'LIST' }],
    }),

    createReview: builder.mutation({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),

    updateReview: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Review', id },
        { type: 'Review', id: 'LIST' },
      ],
    }),

    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/admin/reviews/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;

export default reviewsApi;
