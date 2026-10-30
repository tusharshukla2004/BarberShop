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

    createGalleryItem: builder.mutation({
      query: (data) => ({
        url: '/admin/gallery',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Gallery', id: 'LIST' }],
    }),

    updateGalleryItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/gallery/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Gallery', id },
        { type: 'Gallery', id: 'LIST' },
      ],
    }),

    deleteGalleryItem: builder.mutation({
      query: (id) => ({
        url: `/admin/gallery/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: normalizeError,
      invalidatesTags: [{ type: 'Gallery', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetGalleryQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = galleryApi;

export default galleryApi;
