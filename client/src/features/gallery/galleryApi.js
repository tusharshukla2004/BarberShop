import { baseApi, normalizeError } from '@/app/baseApi';

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query({
      query: () => '/gallery',
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: normalizeError,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Gallery', id })), { type: 'Gallery', id: 'LIST' }]
          : [{ type: 'Gallery', id: 'LIST' }],
    }),
  }),
});

export const { useGetGalleryQuery } = galleryApi;

export default galleryApi;
