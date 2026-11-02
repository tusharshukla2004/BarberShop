import mongoose from 'mongoose';
import Area from '../models/Area.js';
import Post from '../models/Post.js';
import Service from '../models/Service.js';
import { renderMarkdown } from '../utils/markdown.js';

/**
 * Prerendering Approach & Trade-offs:
 * 
 * Chosen Strategy: Lightweight Node Server-Side SEO HTML Generator Middleware
 * 
 * Trade-offs:
 * 1. Headless Chrome / Puppeteer Prerendering:
 *    - Pros: Executes full client JS hydration identically to real browser.
 *    - Cons: Heavy memory footprint (~300MB per instance), slow (1-3s per crawl request), prone to timeouts under traffic.
 * 2. Static Build-Time Export (SSG):
 *    - Pros: Ultra-fast serving of static files.
 *    - Cons: Requires full rebuild every time an area, blog post, or price is edited in admin.
 * 3. Dynamic Node Prerender Middleware (Selected):
 *    - Pros: 
 *      - Zero heavy browser dependencies (runs in < 15ms).
 *      - Real-time: Immediate indexing of newly published posts and area pages without rebuilds.
 *      - Perfect bot delivery: Crawlers (Googlebot, WhatsApp, Twitter) get clean semantic HTML, 
 *        canonical links, Open Graph tags, and validated JSON-LD schema without JS execution delays.
 *      - Gracefully falls back to normal client SPA bundle for human users.
 */

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'baiduspider',
  'yandexbot',
  'duckduckbot',
  'slurp',
  'facebookexternalhit',
  'twitterbot',
  'whatsapp',
  'linkedinbot',
  'pinterest',
  'applebot',
  'slackbot',
  'discordbot',
  'embedly',
  'quora link preview',
];

/**
 * Checks if the request comes from a search engine bot or social preview crawler
 * @param {string} userAgent
 * @returns {boolean}
 */
export function isBotRequest(userAgent = '') {
  if (!userAgent || typeof userAgent !== 'string') return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

/**
 * Express middleware to serve rich, prerendered HTML to search crawlers and social link scrapers
 */
export async function prerenderMiddleware(req, res, next) {
  const ua = req.headers['user-agent'] || '';
  const isEscapedFragment = req.query._escaped_fragment_ !== undefined;
  const isBot = isBotRequest(ua) || isEscapedFragment;

  // Only handle bot requests for specific public content routes
  if (!isBot) {
    return next();
  }

  const path = req.path.toLowerCase().replace(/\/+$/, '') || '/';

  if (mongoose.connection?.readyState !== 1 && process.env.NODE_ENV !== 'test') {
    return next();
  }

  try {
    // 1. Area Landing Page: /locations/:areaSlug or /locations/:areaSlug/:serviceSlug
    if (path.startsWith('/locations/')) {
      const segments = path.replace('/locations/', '').split('/').filter(Boolean);
      const areaSlug = segments[0];
      const serviceSlug = segments[1];

      const area = await Area.findOne({ slug: areaSlug, isActive: true });
      if (!area) {
        return res.status(404).send('<!DOCTYPE html><html><head><title>Area Not Found</title></head><body><h1>Area Not Found</h1></body></html>');
      }

      let service = null;
      if (serviceSlug) {
        service = await Service.findOne({
          $or: [{ slug: serviceSlug }, { name: new RegExp(`^${serviceSlug.replace(/-/g, ' ')}$`, 'i') }],
          isActive: true,
        });
      }

      const siteUrl = 'https://vintageblade.in';
      const pageTitle = service
        ? `${service.name} in ${area.name.en} | Modern Mane Luxury Barber Studio`
        : `Luxury Men's Haircut & Grooming in ${area.name.en} | Modern Mane`;
      const metaDescription = service
        ? `Book premium ${service.name} in ${area.name.en}. ${area.description.en.slice(0, 140)}... Price: ₹${service.price}.`
        : `Top-rated barbershop serving ${area.name.en}. ${area.description.en.slice(0, 150)}... Directions from ${area.landmarks.join(', ')}.`;
      const canonicalUrl = `${siteUrl}${path}`;

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BarberShop',
        name: `Modern Mane - ${area.name.en}`,
        description: metaDescription,
        url: canonicalUrl,
        telephone: '+91 98765 43210',
        priceRange: '₹₹',
        areaServed: {
          '@type': 'AdministrativeArea',
          name: area.name.en,
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '42 Heritage Lane, Near Clock Tower',
          addressLocality: 'Bandra West, Mumbai',
          postalCode: '400050',
          addressCountry: 'IN',
        },
      };

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDescription}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <div id="root">
    <main>
      <h1>${pageTitle}</h1>
      <p class="intro">${area.description.en}</p>
      ${service ? `<section><h2>${service.name} Details</h2><p>${service.description}</p><p><strong>Price:</strong> ₹${service.price} · <strong>Duration:</strong> ${service.duration} mins</p></section>` : ''}
      <section>
        <h2>How to Reach Modern Mane from ${area.name.en}</h2>
        <p>${area.directions.en}</p>
        <p><strong>Nearby Landmarks:</strong> ${area.landmarks.join(', ')}</p>
      </section>
      ${area.faqs?.length ? `<section><h2>Frequently Asked Questions</h2>${area.faqs.map((f) => `<article><h3>${f.question.en}</h3><p>${f.answer.en}</p></article>`).join('')}</section>` : ''}
      <p><a href="/book">Book an Appointment Online</a> | <a href="/services">View All Services</a></p>
    </main>
  </div>
</body>
</html>`;
      return res.status(200).send(html);
    }

    // 2. Blog Post: /blog/:slug
    if (path.startsWith('/blog/') && path !== '/blog') {
      const slug = path.replace('/blog/', '');
      const post = await Post.findOne({ slug, status: 'published' });

      if (!post) {
        return res.status(404).send('<!DOCTYPE html><html><head><title>Post Not Found</title></head><body><h1>Blog Post Not Found</h1></body></html>');
      }

      const siteUrl = 'https://vintageblade.in';
      const pageTitle = `${post.title.en} | Modern Mane Grooming Journal`;
      const metaDescription = post.seoDescription || post.excerpt.en;
      const canonicalUrl = `${siteUrl}${path}`;
      const renderedBody = renderMarkdown(post.content.en);

      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title.en,
        description: post.excerpt.en,
        image: post.coverImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        author: {
          '@type': 'Person',
          name: post.author?.name || 'Master Barber Ravi',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Modern Mane',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/assets/logo.png`,
          },
        },
      };

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDescription}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="${post.coverImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
</head>
<body>
  <div id="root">
    <article>
      <h1>${post.title.en}</h1>
      <p class="meta">By ${post.author?.name} · ${post.readingTimeMinutes} min read · Published on ${new Date(post.publishedAt).toLocaleDateString()}</p>
      <div class="content">${renderedBody}</div>
      <p><a href="/book">Book an Appointment at Modern Mane</a></p>
    </article>
  </div>
</body>
</html>`;
      return res.status(200).send(html);
    }

    return next();
  } catch (err) {
    return next();
  }
}

export default prerenderMiddleware;
