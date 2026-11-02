import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogListPage from '@/pages/public/BlogListPage';
import BlogPostDetailPage from '@/pages/public/BlogPostDetailPage';
import AreaLandingPage from '@/pages/public/AreaLandingPage';
import AdminSeoPage from '@/pages/admin/AdminSeoPage';
import AdminBlogPage from '@/pages/admin/AdminBlogPage';
import { baseApi } from '@/app/baseApi';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';

// Mock SEO API hooks
vi.mock('@/features/seo/seoApi', async () => {
  const actual = await vi.importActual('@/features/seo/seoApi');
  return {
    ...actual,
    useGetPublicAreasQuery: vi.fn(),
    useGetAreaBySlugQuery: vi.fn(),
    useGetPublicPostsQuery: vi.fn(),
    useGetPostBySlugQuery: vi.fn(),
    useGetAdminAreasQuery: vi.fn(),
    useCreateAreaMutation: vi.fn(),
    useUpdateAreaMutation: vi.fn(),
    useDeleteAreaMutation: vi.fn(),
    useGetAdminPostsQuery: vi.fn(),
    useCreatePostMutation: vi.fn(),
    useUpdatePostMutation: vi.fn(),
    useDeletePostMutation: vi.fn(),
    useGetAdminRedirectsQuery: vi.fn(),
    useCreateRedirectMutation: vi.fn(),
    useUpdateRedirectMutation: vi.fn(),
    useDeleteRedirectMutation: vi.fn(),
    useGetSeoHealthReportQuery: vi.fn(),
    useGetGbpHelpersQuery: vi.fn(),
  };
});

// Mock services query
vi.mock('@/features/services/servicesApi', async () => {
  const actual = await vi.importActual('@/features/services/servicesApi');
  return {
    ...actual,
    useGetServicesQuery: vi.fn(),
  };
});

import {
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
} from '@/features/seo/seoApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';

const mockPosts = [
  {
    id: 'post-1',
    _id: 'post-1',
    title: { en: 'The Classic Taper Fade Guide', hi: 'क्लासिक टेपर फेड गाइड' },
    slug: 'classic-taper-fade-guide',
    excerpt: { en: 'Learn about modern precision tapers.', hi: 'आधुनिक सटीक टेपर के बारे में जानें।' },
    content: {
      en: '## Introduction\n\nTapers are timeless.\n\n## Styling Tips\n\nUse matte clay.',
      hi: '## परिचय\n\nटेपर सदाबहार हैं।',
    },
    category: 'haircut',
    tags: ['fade', 'haircut'],
    author: 'Vikram Mehta',
    status: 'published',
    publishedAt: '2026-10-15T10:00:00.000Z',
    readingTimeMinutes: 4,
    viewsCount: 120,
  },
];

const mockArea = {
  id: 'area-1',
  _id: 'area-1',
  name: { en: 'Bandra West', hi: 'बांद्रा वेस्ट' },
  slug: 'bandra-west',
  landmarks: ['Linking Road', 'Pali Hill'],
  description: {
    en: 'Bandra West is a bustling cultural and fashion destination. Our studio offers premier haircutting and hot towel shaves nearby.',
    hi: 'बांद्रा वेस्ट एक जीवंत सांस्कृतिक केंद्र है।',
  },
  directions: {
    en: 'Located 5 minutes walk from Linking Road KFC junction.',
    hi: 'लिंकिंग रोड से 5 मिनट की दूरी पर स्थित।',
  },
  faqs: [
    {
      question: { en: 'Is parking available in Bandra?', hi: 'क्या बांद्रा में पार्किंग उपलब्ध है?' },
      answer: { en: 'Yes, valet parking is available.', hi: 'हाँ, वैलेट पार्किंग उपलब्ध है।' },
    },
  ],
  qualityPassed: true,
  order: 1,
};

const mockServices = [
  {
    id: 'srv-1',
    _id: 'srv-1',
    name: 'Executive Haircut',
    slug: 'haircut',
    price: 800,
    durationMinutes: 45,
    description: 'Precision haircut with wash and styling.',
  },
];

function createMockStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        user: { id: 'u1', name: 'Master Barber', role: 'owner' },
        token: 'fake-token',
        isAuthenticated: true,
      },
      ...preloadedState,
    },
  });
}

function renderWithStore(ui, { store = createMockStore(), route = '/' } = {}) {
  return render(
    <HelmetProvider>
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>
    </HelmetProvider>
  );
}

describe('Prompt 20: Local SEO & Blog Client Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useGetPublicPostsQuery.mockReturnValue({
      data: { posts: mockPosts, total: 1, totalPages: 1 },
      isLoading: false,
    });

    useGetPostBySlugQuery.mockReturnValue({
      data: { post: mockPosts[0], relatedPosts: [] },
      isLoading: false,
    });

    useGetPublicAreasQuery.mockReturnValue({
      data: [mockArea],
      isLoading: false,
    });

    useGetAreaBySlugQuery.mockReturnValue({
      data: { area: mockArea, services: mockServices, areaFaqs: mockArea.faqs },
      isLoading: false,
    });

    useGetServicesQuery.mockReturnValue({
      data: mockServices,
      isLoading: false,
    });

    useGetSeoHealthReportQuery.mockReturnValue({
      data: {
        score: 92,
        totalChecked: 10,
        issuesCount: 1,
        issues: [
          { type: 'warning', page: 'Blog', issue: 'Missing meta description' },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    useGetAdminAreasQuery.mockReturnValue({
      data: [mockArea],
      isLoading: false,
      refetch: vi.fn(),
    });

    useGetAdminPostsQuery.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      refetch: vi.fn(),
    });

    useGetAdminRedirectsQuery.mockReturnValue({
      data: [
        {
          _id: 'red-1',
          fromPath: '/old-haircut',
          toPath: '/services',
          statusCode: 301,
          hitCount: 5,
          isActive: true,
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });

    useGetGbpHelpersQuery.mockReturnValue({
      data: {
        businessName: 'Sovereign Barbershop',
        description750: 'Luxury grooming parlour in Mumbai.',
        hoursFormatted: 'Tue - Sun: 10:00 AM - 09:00 PM',
        qaPairs: [{ question: 'Do I need an appointment?', answer: 'Walk-ins and bookings are welcome.' }],
        reviewQrLink: 'https://g.page/r/example/review',
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    useCreateAreaMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: mockArea }), { isLoading: false }]);
    useUpdateAreaMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: mockArea }), { isLoading: false }]);
    useDeleteAreaMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: true }), { isLoading: false }]);

    useCreatePostMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: mockPosts[0] }), { isLoading: false }]);
    useUpdatePostMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: mockPosts[0] }), { isLoading: false }]);
    useDeletePostMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: true }), { isLoading: false }]);

    useCreateRedirectMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: {} }), { isLoading: false }]);
    useUpdateRedirectMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: {} }), { isLoading: false }]);
    useDeleteRedirectMutation.mockReturnValue([vi.fn().mockResolvedValue({ data: true }), { isLoading: false }]);
  });

  it('renders BlogListPage with search, filter chips and articles', () => {
    renderWithStore(<BlogListPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Grooming Guide/i })).toBeInTheDocument();
    expect(screen.getByText('The Classic Taper Fade Guide')).toBeInTheDocument();
    expect(screen.getByText(/Learn about modern precision tapers/i)).toBeInTheDocument();
    expect(screen.getByText(/4 min read/i)).toBeInTheDocument();
  });

  it('renders BlogPostDetailPage with TOC, reading time and markdown body', () => {
    renderWithStore(
      <Routes>
        <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
      </Routes>,
      { route: '/blog/classic-taper-fade-guide' }
    );

    expect(screen.getByRole('heading', { level: 1, name: 'The Classic Taper Fade Guide' })).toBeInTheDocument();
    expect(screen.getByText(/Vikram Mehta/i)).toBeInTheDocument();
    expect(screen.getByText(/In This Article/i)).toBeInTheDocument();
    expect(screen.getAllByText('Introduction').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Styling Tips').length).toBeGreaterThan(0);
  });

  it('renders AreaLandingPage with landmarks, transit directions, and service cards', () => {
    renderWithStore(
      <Routes>
        <Route path="/locations/:areaSlug" element={<AreaLandingPage />} />
      </Routes>,
      { route: '/locations/bandra-west' }
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /Haircut & Grooming in Bandra West/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Linking Road/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pali Hill/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/How to Reach from Bandra West/i)).toBeInTheDocument();
    expect(screen.getByText(/Located 5 minutes walk from Linking Road/i)).toBeInTheDocument();
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Is parking available in Bandra\?/i)).toBeInTheDocument();
  });

  it('renders AdminSeoPage with Health Audit, Areas, Redirects, and GBP tools', () => {
    renderWithStore(<AdminSeoPage />);

    expect(screen.getByText(/Local SEO & Technical Growth Console/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall SEO Health/i)).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google Business Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Technical Redirects/i })).toBeInTheDocument();
  });

  it('renders AdminBlogPage with articles list and modal trigger', () => {
    renderWithStore(<AdminBlogPage />);

    expect(screen.getByText(/Editorial Journal & Blog Management/i)).toBeInTheDocument();
    expect(screen.getByText('The Classic Taper Fade Guide')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Article/i })).toBeInTheDocument();
  });
});
