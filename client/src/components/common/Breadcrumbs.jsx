import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ChevronRight, Home } from 'lucide-react';
import { siteConfig } from '@/config/site';

/**
 * Accessible Breadcrumbs component with schema.org BreadcrumbList structured data
 *
 * @param {Object} props
 * @param {Array<{ label: string, href?: string }>} props.items
 */
export default function Breadcrumbs({ items = [], tone = 'dark' }) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];
  const isDark = tone === 'dark';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteConfig.url}${item.href}` : undefined,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="py-2.5 mb-4 text-xs font-mono">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ol className={`flex items-center flex-wrap gap-1.5 ${isDark ? 'text-white/60' : 'text-muted'}`}>
        {allItems.map((item, idx) => {
          const isLast = idx === allItems.length - 1;
          return (
            <li key={item.label + idx} className="flex items-center gap-1.5">
              {idx === 0 ? (
                <Link
                  to="/"
                  className={`hover:text-accent transition-colors flex items-center gap-1 ${isDark ? 'text-white/70' : 'text-muted'}`}
                  title="Home"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="sr-only">Home</span>
                </Link>
              ) : item.href && !isLast ? (
                <Link to={item.href} className="hover:text-accent transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={`truncate max-w-[200px] sm:max-w-none ${isLast ? (isDark ? 'text-accent font-semibold' : 'text-ink font-semibold') : ''}`}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="w-3 h-3 text-border-dark flex-shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ).isRequired,
  tone: PropTypes.oneOf(['dark', 'light']),
};

