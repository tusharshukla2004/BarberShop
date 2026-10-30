import { baseApi } from '@/app/baseApi';
import { mockTestimonials } from '@/mocks/data';

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: () => '/reviews',
      transformResponse: (response) => response?.data || mockTestimonials,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Review', id })), { type: 'Review', id: 'LIST' }]
          : [{ type: 'Review', id: 'LIST' }],
    }),
  }),
});

export const { useGetReviewsQuery } = reviewsApi;

export default reviewsApi;
