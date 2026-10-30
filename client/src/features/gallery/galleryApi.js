import { baseApi } from '@/app/baseApi';
import { mockGalleryItems } from '@/mocks/data';

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query({
      query: () => '/gallery',
      // Fallback transform to ensure data is always present even if server is offline
      transformResponse: (response) => response?.data || mockGalleryItems,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Gallery', id })), { type: 'Gallery', id: 'LIST' }]
          : [{ type: 'Gallery', id: 'LIST' }],
    }),
  }),
});

export const { useGetGalleryQuery } = galleryApi;

export default galleryApi;
