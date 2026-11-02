import { useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Share2,
  ArrowLeft,
  Scissors,
  Bookmark,
} from 'lucide-react';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Seo from '@/components/common/Seo';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import QueryState from '@/components/common/QueryState';
import { useGetPostBySlugQuery } from '@/features/seo/seoApi';
import { renderMarkdown, extractTableOfContents } from '@/lib/markdown';
import { trackEvent } from '@/lib/analytics';
import { siteConfig } from '@/config/site';

export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetPostBySlugQuery({
    slug,
    preview: isPreview,
  });

  const post = data?.post;
  const relatedPosts = data?.relatedPosts || [];

  const renderedContent = useMemo(() => {
    if (!post?.content?.en) return '';
    return renderMarkdown(post.content.en);
  }, [post?.content?.en]);

  const tableOfContents = useMemo(() => {
    if (!post?.content?.en) return [];
    return extractTableOfContents(post.content.en);
  }, [post?.content?.en]);

  const articleSchema = useMemo(() => {
    if (!post) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title?.en,
      description: post.excerpt?.en,
      image: post.coverImage,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        '@type': 'Person',
        name: typeof post.author === 'string' ? post.author : (post.author?.name || 'Master Barber Ravi'),
        jobTitle: post.author?.role || 'Senior Stylist',
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/assets/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${siteConfig.url}/blog/${post.slug}`,
      },
    };
  }, [post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title?.en,
        text: post?.excerpt?.en,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  const handleBookCta = () => {
    trackEvent('booking_started', {
      source: 'blog_post_cta',
      postSlug: post?.slug,
      category: post?.category,
    });
    navigate('/book');
  };

  if (isLoading || isError || !post) {
    return (
      <Container className="py-16">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!post}
          emptyMessage="Editorial article not found or has been moved."
        />
      </Container>
    );
  }

  const metaTitle = post.seoTitle || `${post.title?.en} | Modern Mane Grooming Journal`;
  const metaDescription = post.seoDescription || post.excerpt?.en;

  const breadcrumbItems = [
    { label: 'Journal', href: '/blog' },
    { label: post.title?.en },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Seo
        title={metaTitle}
        description={metaDescription}
        canonical={`/blog/${post.slug}`}
        image={post.coverImage}
        type="article"
        schema={articleSchema}
      />

      {/* Preview Alert Banner */}
      {isPreview && (
        <div className="bg-amber-500 text-black py-2 text-center text-xs font-bold uppercase tracking-wider">
          Draft Preview Mode · This article is not yet published to public visitors
        </div>
      )}

      {/* Article Hero */}
      <div className="bg-ink text-white pt-24 pb-12 sm:pt-28 sm:pb-16 border-b border-border-dark relative overflow-hidden">
        {/* Subtle luxury ambient glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative z-10">
          <Breadcrumbs items={breadcrumbItems} tone="dark" />

          <div className="max-w-3xl space-y-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-accent/20 text-accent">
                {post.category}
              </span>
              <span className="text-xs text-white/60 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent" /> {post.readingTimeMinutes || 3} min read
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wider text-white leading-tight">
              {post.title?.en}
            </h1>

            <p className="text-sm sm:text-base text-white/75 font-sans leading-relaxed">
              {post.excerpt?.en}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 text-xs text-muted">
              <div className="flex items-center gap-3">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-accent/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-white block">
                    {typeof post.author === 'string' ? post.author : (post.author?.name || 'Master Barber')}
                  </span>
                  <span className="text-[11px] text-gray-400">{post.author?.role || 'Senior Stylist'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <Button variant="outline" size="sm" onClick={handleShare} className="text-xs h-8">
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Body */}
          <main className="lg:col-span-8 space-y-8">
            {/* Cover Image */}
            {post.coverImage && (
              <div className="rounded-xl overflow-hidden shadow-sm border border-border-light max-h-[480px]">
                <img
                  src={post.coverImage}
                  alt={post.title?.en}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Sanitized HTML Content */}
            <div
              className="prose prose-sm max-w-none text-ink font-sans leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="pt-6 border-t border-border-light flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-muted mr-2">Tags:</span>
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded text-xs font-mono bg-card border border-border-light text-ink"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Appointment Booking CTA Card */}
            <Card className="p-6 bg-primary text-secondary border-accent/40 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
                    Experience Master Grooming
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white">
                    Ready for a Precision Cut or Beard Sculpt?
                  </h3>
                  <p className="text-xs text-gray-300">
                    Book with one of our master barbers online in under 60 seconds.
                  </p>
                </div>
                <Button size="lg" onClick={handleBookCta} className="shadow-lg whitespace-nowrap">
                  <Scissors className="w-4 h-4 mr-2" /> Book an Appointment
                </Button>
              </div>
            </Card>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <Card className="p-5 sticky top-24 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink border-b border-border-light pb-2 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-accent" /> In This Article
                </h4>
                <ul className="space-y-2 text-xs">
                  {tableOfContents.map((item) => (
                    <li
                      key={item.id}
                      className={item.level === 3 ? 'pl-3 border-l border-border-light' : ''}
                    >
                      <a
                        href={`#${item.id}`}
                        className="text-muted hover:text-accent transition-colors block py-0.5 line-clamp-1"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <Card className="p-5 space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink border-b border-border-light pb-2">
                  Related Stories
                </h4>
                <div className="space-y-3">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id || rel._id}
                      to={`/blog/${rel.slug}`}
                      className="group flex items-start gap-3 text-xs"
                    >
                      {rel.coverImage && (
                        <img
                          src={rel.coverImage}
                          alt={rel.title?.en}
                          className="w-14 h-14 rounded object-cover flex-shrink-0 group-hover:opacity-80 transition-opacity"
                        />
                      )}
                      <div>
                        <h5 className="font-serif font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">
                          {rel.title?.en}
                        </h5>
                        <span className="text-[10px] text-muted font-mono mt-1 block">
                          {rel.readingTimeMinutes || 3} min read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Back to Blog */}
            <div>
              <Link
                to="/blog"
                className="inline-flex items-center text-xs font-semibold text-muted hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to All Articles
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
