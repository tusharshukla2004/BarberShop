import { baseApi } from '@/app/baseApi';

export const offersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicOffers: builder.query({
      query: () => ({
        url: '/offers',
        method: 'GET',
      }),
      providesTags: ['Offers'],
      transformResponse: (res) => res.data || res,
    }),

    validateOfferCode: builder.mutation({
      query: (body) => ({
        url: '/offers/validate',
        method: 'POST',
        body,
      }),
      transformResponse: (res) => res.data || res,
    }),

    getAdminOffers: builder.query({
      query: () => ({
        url: '/admin/offers',
        method: 'GET',
      }),
      providesTags: ['Offers'],
      transformResponse: (res) => res.data || res,
    }),

    createOffer: builder.mutation({
      query: (body) => ({
        url: '/admin/offers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Offers', 'Reports'],
      transformResponse: (res) => res.data || res,
    }),

    updateOffer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/offers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Offers', 'Reports'],
      transformResponse: (res) => res.data || res,
    }),

    deleteOffer: builder.mutation({
      query: (id) => ({
        url: `/admin/offers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Offers', 'Reports'],
      transformResponse: (res) => res.data || res,
    }),

    duplicateOffer: builder.mutation({
      query: (id) => ({
        url: `/admin/offers/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Offers'],
      transformResponse: (res) => res.data || res,
    }),

    getOffersReport: builder.query({
      query: (params = {}) => ({
        url: '/admin/reports/offers',
        method: 'GET',
        params,
      }),
      providesTags: ['Reports'],
      transformResponse: (res) => res.data || res,
    }),
  }),
});

export const {
  useGetPublicOffersQuery,
  useValidateOfferCodeMutation,
  useGetAdminOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useDuplicateOfferMutation,
  useGetOffersReportQuery,
} = offersApi;

