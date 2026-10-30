import { baseApi } from '@/app/baseApi';
import { mockServices } from '@/mocks/data';

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => '/services',
      transformResponse: (response) => response?.data || mockServices,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Service', id })), { type: 'Service', id: 'LIST' }]
          : [{ type: 'Service', id: 'LIST' }],
    }),
  }),
});

export const { useGetServicesQuery } = servicesApi;

export default servicesApi;
