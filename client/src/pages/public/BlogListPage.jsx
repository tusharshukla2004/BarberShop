import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  Search,
  Tag,
  ArrowRight,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Seo from '@/components/common/Seo';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import QueryState from '@/components/common/QueryState';
import { useGetPublicPostsQuery } from '@/features/seo/seoApi';
import { getShopImageDetailsForContent } from '@/features/shop/productImages';

export default function BlogListPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(() => {
    const p = { page: currentPage, limit: 9 };
    if (selectedCategory) p.category = selectedCategory;
    if (selectedTag) p.tag = selectedTag;
    if (searchTerm.trim()) p.search = searchTerm.trim();
    return p;
  }, [currentPage, selectedCategory, selectedTag, searchTerm]);

  const { data, isLoading, isError, error, refetch } = useGetPublicPostsQuery(queryParams);

  const posts = data?.posts || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };
  const categories = data?.categories || ['haircut', 'beard', 'styling', 'grooming', 'trends', 'news'];
  const tags = data?.tags || [];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
    setCurrentPage(1);
  };

  const handleTagSelect = (t) => {
    setSelectedTag(t === selectedTag ? '' : t);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-surface">
      <Seo
        title="Gentlemen's Grooming Journal & Barber Advice"
        description="Expert advice on fade haircuts, beard grooming, hot towel shaves, and hair health from master barbers at Modern Mane."
        canonical="/blog"
      />

      {/* Header Banner */}
      <div className="bg-ink text-white pt-24 pb-12 sm:pt-28 sm:pb-16 border-b border-border-dark relative overflow-hidden">
        {/* Subtle luxury ambient glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative z-10">
          <Breadcrumbs items={[{ label: 'Blog & Grooming Journal' }]} tone="dark" />

          <div className="max-w-3xl space-y-3 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-mono uppercase tracking-wider font-semibold">
              <BookOpen className="w-3.5 h-3.5" /> Modern Mane Journal
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wider text-white">
              Gentlemen’s Grooming Guide
            </h1>
            <p className="text-sm sm:text-base text-white/75 font-sans leading-relaxed">
              Curated master barber advice, haircut trend forecasts, beard maintenance routines, and styling insights.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-10 space-y-8">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border-light">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                !selectedCategory
                  ? 'bg-accent text-primary'
                  : 'bg-card text-muted hover:text-ink border border-border-light'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent text-primary'
                    : 'bg-card text-muted hover:text-ink border border-border-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-full border border-border-light bg-card text-ink focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Query State */}
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={posts.length === 0}
          emptyMessage="No editorial articles found matching the selected filters."
          onRetry={refetch}
        />

        {/* Posts Grid */}
        {!isLoading && !isError && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id || post._id}
                className="overflow-hidden flex flex-col justify-between group hover:border-accent/50 transition-all duration-300"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-muted/20">
                    <img
                      src={getShopImageDetailsForContent(post.category, post.slug).src}
                      alt={getShopImageDetailsForContent(post.category, post.slug).alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-primary/90 text-accent">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-3 text-[11px] text-muted font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-accent" /> {post.readingTimeMinutes || 3} min read
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{' '}
                        {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h2 className="text-lg font-serif font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">
                      <Link to={`/blog/${post.slug}`}>{post.title?.en}</Link>
                    </h2>

                    <p className="text-xs text-muted leading-relaxed line-clamp-3">
                      {post.excerpt?.en}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-border-light flex justify-between items-center text-xs">
                  <span className="text-muted flex items-center gap-1 text-[11px]">
                    <User className="w-3 h-3" /> {post.author?.name || 'Master Barber'}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="font-bold text-accent inline-flex items-center gap-1 hover:translate-x-0.5 transition-transform"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-xs font-mono text-muted px-3">
              Page {currentPage} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pagination.pages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Popular Topic Tags */}
        {tags.length > 0 && (
          <div className="pt-8 border-t border-border-light text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold block">
              Explore Popular Topics
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTagSelect(t)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    selectedTag === t
                      ? 'bg-accent text-primary font-bold'
                      : 'bg-card border border-border-light text-muted hover:text-ink'
                  }`}
                >
                  <Tag className="w-3 h-3" /> #{t}
                </button>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
