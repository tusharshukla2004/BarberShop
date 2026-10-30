import { baseApi } from '@/app/baseApi';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBookingRequest: builder.mutation({
      query: (bookingData) => ({
        url: '/bookings/request',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking', 'Slots'],
    }),
  }),
});

export const { useCreateBookingRequestMutation } = bookingApi;

export default bookingApi;
