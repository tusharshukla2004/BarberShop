import { baseApi } from '@/app/baseApi';

export const seoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public Endpoints
    getPublicAreas: builder.query({
      query: () => '/areas',
      transformResponse: (res) => res.data || [],
      providesTags: ['Area'],
    }),
    getAreaBySlug: builder.query({
      query: ({ areaSlug, serviceSlug }) =>
        serviceSlug ? `/locations/${areaSlug}/${serviceSlug}` : `/locations/${areaSlug}`,
      transformResponse: (res) => res.data || {},
      providesTags: (_result, _error, { areaSlug }) => [{ type: 'Area', id: areaSlug }],
    }),
    getPublicPosts: builder.query({
      query: (params = {}) => ({
        url: '/posts',
        params,
      }),
      transformResponse: (res) => res.data || { posts: [], pagination: {} },
      providesTags: ['Post'],
    }),
    getPostBySlug: builder.query({
      query: ({ slug, preview }) => ({
        url: `/posts/${slug}`,
        params: preview ? { preview: true } : {},
      }),
      transformResponse: (res) => res.data || {},
      providesTags: (_result, _error, { slug }) => [{ type: 'Post', id: slug }],
    }),

    // Admin Area CRUD
    getAdminAreas: builder.query({
      query: () => '/admin/areas',
      transformResponse: (res) => res.data || [],
      providesTags: ['Area'],
    }),
    createArea: builder.mutation({
      query: (body) => ({
        url: '/admin/areas',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Area', 'SeoHealth'],
    }),
    updateArea: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/areas/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Area', 'SeoHealth'],
    }),
    deleteArea: builder.mutation({
      query: (id) => ({
        url: `/admin/areas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Area', 'SeoHealth'],
    }),

    // Admin Blog Posts CRUD
    getAdminPosts: builder.query({
      query: () => '/admin/posts',
      transformResponse: (res) => res.data || [],
      providesTags: ['Post'],
    }),
    createPost: builder.mutation({
      query: (body) => ({
        url: '/admin/posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Post', 'SeoHealth'],
    }),
    updatePost: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/posts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Post', 'SeoHealth'],
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/admin/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post', 'SeoHealth'],
    }),

    // Admin Redirects CRUD
    getAdminRedirects: builder.query({
      query: () => '/admin/redirects',
      transformResponse: (res) => res.data || [],
      providesTags: ['Redirect'],
    }),
    createRedirect: builder.mutation({
      query: (body) => ({
        url: '/admin/redirects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Redirect'],
    }),
    updateRedirect: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/redirects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Redirect'],
    }),
    deleteRedirect: builder.mutation({
      query: (id) => ({
        url: `/admin/redirects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Redirect'],
    }),

    // Admin SEO Health & Google Business Profile Helpers
    getSeoHealthReport: builder.query({
      query: () => '/admin/seo/health',
      transformResponse: (res) => res.data || { score: 100, issues: [] },
      providesTags: ['SeoHealth'],
    }),
    getGbpHelpers: builder.query({
      query: () => '/admin/seo/gbp',
      transformResponse: (res) => res.data || {},
    }),
  }),
});

export const {
  useGetPublicAreasQuery,
  useGetAreaBySlugQuery,
  useGetPublicPostsQuery,
  useGetPostBySlugQuery,
  useGetAdminAreasQuery,
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
  useGetAdminPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetAdminRedirectsQuery,
  useCreateRedirectMutation,
  useUpdateRedirectMutation,
  useDeleteRedirectMutation,
  useGetSeoHealthReportQuery,
  useGetGbpHelpersQuery,
} = seoApi;

