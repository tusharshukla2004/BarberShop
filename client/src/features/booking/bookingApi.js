import { baseApi, normalizeError } from '@/app/baseApi';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Client Slot Discovery
    getSlots: builder.query({
      query: ({ barberId, serviceId, date }) => {
        const params = new URLSearchParams();
        if (barberId) params.append('barberId', barberId);
        if (serviceId) params.append('serviceId', serviceId);
        if (date) params.append('date', date);
        return `/bookings/slots?${params.toString()}`;
      },
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: ['Slots'],
    }),

    // Quick Appointment Request
    createBookingRequest: builder.mutation({
      query: (data) => ({
        url: '/bookings/request',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Booking', 'Slots'],
    }),

    // Confirmed Reservation Creation
    createBooking: builder.mutation({
      query: (data) => ({
        url: '/bookings',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Booking', 'Slots'],
    }),

    // Admin: Get all Bookings
    getBookings: builder.query({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.date) search.append('date', params.date);
        if (params?.barberId) search.append('barberId', params.barberId);
        if (params?.status) search.append('status', params.status);
        const queryStr = search.toString();
        return queryStr ? `/admin/bookings?${queryStr}` : '/admin/bookings';
      },
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Booking', id })), { type: 'Booking', id: 'LIST' }]
          : [{ type: 'Booking', id: 'LIST' }],
    }),

    // Admin: Update Booking Details & Reschedule (with optimistic update and rollback)
    updateBooking: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/bookings/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          bookingApi.util.updateQueryData('getBookings', undefined, (draft) => {
            if (Array.isArray(draft)) {
              const booking = draft.find((b) => b.id === id);
              if (booking) {
                Object.assign(booking, patch);
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
        'Slots',
      ],
    }),

    // Admin: Update Booking Status (with optimistic update and rollback)
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/bookings/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          bookingApi.util.updateQueryData('getBookings', undefined, (draft) => {
            if (Array.isArray(draft)) {
              const booking = draft.find((b) => b.id === id);
              if (booking) {
                booking.status = status;
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
        'Slots',
      ],
    }),

    // Admin: Cancel Booking
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `/admin/bookings/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Booking', 'Slots'],
    }),
  }),
});

export const {
  useGetSlotsQuery,
  useCreateBookingRequestMutation,
  useCreateBookingMutation,
  useGetBookingsQuery,
  useUpdateBookingMutation,
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
} = bookingApi;

export default bookingApi;
