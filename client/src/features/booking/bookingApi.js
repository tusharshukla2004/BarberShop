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
      query: () => '/admin/bookings',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Booking', id })), { type: 'Booking', id: 'LIST' }]
          : [{ type: 'Booking', id: 'LIST' }],
    }),

    // Admin: Update Booking Status
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/bookings/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: ['Booking', 'Slots'],
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
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
} = bookingApi;

export default bookingApi;
