import { baseApi } from '@/app/baseApi';

export const faqsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicFaqs: builder.query({
      query: () => ({
        url: '/faqs',
        method: 'GET',
      }),
      providesTags: ['Faqs'],
      transformResponse: (res) => res.data || res,
    }),

    getAdminFaqs: builder.query({
      query: () => ({
        url: '/admin/faqs',
        method: 'GET',
      }),
      providesTags: ['Faqs'],
      transformResponse: (res) => res.data || res,
    }),

    createFaq: builder.mutation({
      query: (body) => ({
        url: '/admin/faqs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Faqs'],
      transformResponse: (res) => res.data || res,
    }),

    updateFaq: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/faqs/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Faqs'],
      transformResponse: (res) => res.data || res,
    }),

    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/admin/faqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Faqs'],
      transformResponse: (res) => res.data || res,
    }),

    reorderFaqs: builder.mutation({
      query: (orders) => ({
        url: '/admin/faqs/reorder',
        method: 'PATCH',
        body: { orders },
      }),
      invalidatesTags: ['Faqs'],
      transformResponse: (res) => res.data || res,
    }),
  }),
});

export const {
  useGetPublicFaqsQuery,
  useGetAdminFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
} = faqsApi;

