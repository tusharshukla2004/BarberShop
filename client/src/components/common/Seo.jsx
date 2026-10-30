import { Helmet } from 'react-helmet-async';
import { siteConfig } from '@/config/site';

/**
 * Reusable SEO meta tag manager using react-helmet-async
 *
 * @param {Object} props
 * @param {string} props.title - Page specific title
 * @param {string} [props.description] - Page meta description
 * @param {string} [props.canonical] - Canonical path
 * @returns {JSX.Element}
 */
export function Seo({ title, description = siteConfig.description, canonical }) {
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  );
}

export default Seo;
