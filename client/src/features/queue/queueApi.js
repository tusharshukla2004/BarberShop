import { baseApi } from '@/app/baseApi';

/**
 * Queue RTK Query endpoint definitions
 */
export const queueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminQueue: builder.query({
      query: (params = {}) => ({
        url: '/admin/queue',
        method: 'GET',
        params,
      }),
      providesTags: ['Queue'],
      transformResponse: (response) => response.data || response,
    }),

    addWalkIn: builder.mutation({
      query: (body) => ({
        url: '/admin/queue',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Queue', 'Customer', 'Booking', 'QueueStatus'],
      transformResponse: (response) => response.data || response,
    }),

    updateQueueStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/queue/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Queue', 'Customer', 'Booking', 'QueueStatus'],
      transformResponse: (response) => response.data || response,
    }),

    getPublicQueueStatus: builder.query({
      query: () => ({
        url: '/queue/status',
        method: 'GET',
      }),
      providesTags: ['QueueStatus'],
      transformResponse: (response) => response.data || response,
    }),

    joinPublicQueue: builder.mutation({
      query: (body) => ({
        url: '/queue/join',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Queue', 'QueueStatus'],
      transformResponse: (response) => response.data || response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminQueueQuery,
  useAddWalkInMutation,
  useUpdateQueueStatusMutation,
  useGetPublicQueueStatusQuery,
  useJoinPublicQueueMutation,
} = queueApi;
