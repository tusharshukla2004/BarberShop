import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { siteConfig } from '@/config/site';

/**
 * Reusable SEO meta tag manager using react-helmet-async
 *
 * @param {Object} props
 * @param {string} props.title - Page specific title
 * @param {string} [props.description] - Page meta description
 * @param {string} [props.canonical] - Canonical path or full URL
 * @param {string} [props.image] - Open Graph / Twitter image URL
 * @param {string} [props.type='website'] - Open Graph type
 * @param {boolean} [props.noindex=false] - Whether to disallow indexing (e.g. for admin routes)
 * @param {boolean} [props.includeSchema=false] - Whether to output JSON-LD schema
 * @param {Object} [props.schema] - Optional custom JSON-LD schema
 * @returns {JSX.Element}
 */
export function Seo({
  title,
  description = siteConfig.description,
  canonical,
  image = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  type = 'website',
  noindex = false,
  includeSchema = false,
  schema = null,
}) {
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const canonicalUrl = canonical
    ? canonical.startsWith('http')
      ? canonical
      : `${siteConfig.url}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : undefined;

  // BarberShop LocalBusiness schema generator
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'BarberShop',
    name: siteConfig.name,
    image,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '42 Heritage Lane, Near Clock Tower',
      addressLocality: 'Bandra West, Mumbai',
      addressRegion: 'MH',
      postalCode: '400050',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.location.lat,
      longitude: siteConfig.location.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '20:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:30',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '09:30',
        closes: '19:00',
      },
    ],
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.facebook,
      siteConfig.social.twitter,
      siteConfig.social.youtube,
    ].filter(Boolean),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const activeSchema = schema || (includeSchema ? defaultSchema : null);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Structured Data (JSON-LD) */}
      {activeSchema && !noindex && (
        <script type="application/ld+json">{JSON.stringify(activeSchema)}</script>
      )}
    </Helmet>
  );
}

Seo.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  canonical: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  noindex: PropTypes.bool,
  includeSchema: PropTypes.bool,
  schema: PropTypes.object,
};

export default Seo;
