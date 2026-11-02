import mongoose from 'mongoose';
import Area from '../models/Area.js';
import Post from '../models/Post.js';
import Service from '../models/Service.js';
import Redirect from '../models/Redirect.js';
import Settings from '../models/Settings.js';
import { slugify, calculateReadingTime } from '../utils/markdown.js';
import { validateAreaQuality, countWords } from '../utils/seoQuality.js';
import {
  createAreaSchema,
  updateAreaSchema,
  createPostSchema,
  updatePostSchema,
  createRedirectSchema,
  updateRedirectSchema,
} from '../schemas/seo.schema.js';

const SITE_URL = 'https://vintageblade.in';

// ----------------------------------------------------
// Public SEO & Content Controllers
// ----------------------------------------------------

/**
 * Generates dynamic sitemap.xml with lastmod, priority, and hreflang
 */
export async function getSitemapXml(req, res) {
  try {
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/services', priority: '0.9', changefreq: 'weekly' },
      { loc: '/offers', priority: '0.8', changefreq: 'weekly' },
      { loc: '/barbers', priority: '0.7', changefreq: 'monthly' },
      { loc: '/gallery', priority: '0.6', changefreq: 'monthly' },
      { loc: '/about', priority: '0.6', changefreq: 'monthly' },
      { loc: '/faq', priority: '0.7', changefreq: 'weekly' },
      { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
      { loc: '/blog', priority: '0.8', changefreq: 'daily' },
    ];

    // Fetch published blog posts
    const posts = await Post.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 })
      .lean();

    // Fetch active, published areas that pass quality check
    const areas = await Area.find({ isActive: true, isPublished: true, qualityPassed: true })
      .select('slug updatedAt')
      .lean();

    // Fetch active services for combination pages
    const services = await Service.find({ isActive: true })
      .select('slug name updatedAt')
      .lean();

    const now = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // Static pages
    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${page.loc}" />
    <xhtml:link rel="alternate" hreflang="hi" href="${SITE_URL}${page.loc}?lang=hi" />
  </url>`;
    }

    // Blog posts
    for (const post of posts) {
      const lastmod = (post.updatedAt || post.publishedAt || new Date()).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/blog/${post.slug}" />
    <xhtml:link rel="alternate" hreflang="hi" href="${SITE_URL}/blog/${post.slug}?lang=hi" />
  </url>`;
    }

    // Quality-checked Area pages and area+service landing pages
    for (const area of areas) {
      const lastmod = (area.updatedAt || new Date()).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${SITE_URL}/locations/${area.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/locations/${area.slug}" />
    <xhtml:link rel="alternate" hreflang="hi" href="${SITE_URL}/locations/${area.slug}?lang=hi" />
  </url>`;

      // Area + Service landing pages
      for (const s of services) {
        const sSlug = s.slug || slugify(s.name);
        xml += `
  <url>
    <loc>${SITE_URL}/locations/${area.slug}/${sSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/locations/${area.slug}/${sSlug}" />
    <xhtml:link rel="alternate" hreflang="hi" href="${SITE_URL}/locations/${area.slug}/${sSlug}?lang=hi" />
  </url>`;
      }
    }

    xml += '\n</urlset>';

    res.set('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Returns robots.txt
 */
export function getRobotsTxt(req, res) {
  const content = `# Modern Mane Robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/
Disallow: /wallet/
Disallow: /api/wallet/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  res.set('Content-Type', 'text/plain; charset=utf-8');
  return res.status(200).send(content);
}

/**
 * Public Areas listing (for footer and directory)
 */
export async function getPublicAreas(req, res) {
  try {
    const areas = await Area.find({ isActive: true, isPublished: true, qualityPassed: true })
      .select('name slug landmarks order')
      .sort({ order: 1, 'name.en': 1 })
      .lean();
    return res.status(200).json({ success: true, data: areas });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Public Area landing page by slug (with optional service combination)
 */
export async function getAreaBySlug(req, res) {
  try {
    const { areaSlug, serviceSlug } = req.params;
    const area = await Area.findOne({ slug: areaSlug, isActive: true });

    if (!area) {
      return res.status(404).json({ success: false, error: { message: 'Area not found' } });
    }

    // Must be published and pass quality check
    if (!area.isPublished || !area.qualityPassed) {
      return res.status(404).json({
        success: false,
        error: { message: 'This location page is not yet published or pending content review.' },
      });
    }

    let service = null;
    if (serviceSlug) {
      service = await Service.findOne({
        $or: [{ slug: serviceSlug }, { name: new RegExp(`^${serviceSlug.replace(/-/g, ' ')}$`, 'i') }],
        isActive: true,
      }).lean();
    }

    // Fetch other active services for internal links
    const allServices = await Service.find({ isActive: true }).select('name price duration category slug').lean();
    // Fetch nearby areas for internal links
    const nearbyAreas = await Area.find({ isActive: true, isPublished: true, slug: { $ne: areaSlug } })
      .select('name slug')
      .limit(6)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        area,
        selectedService: service,
        allServices,
        nearbyAreas,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Public Blog listing with pagination, tags, and category filter
 */
export async function getPublicPosts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));
    const skip = (page - 1) * limit;

    const filter = { status: 'published', publishedAt: { $lte: new Date() } };

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .select('title slug excerpt coverImage tags category author publishedAt readingTimeMinutes')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Categories and popular tags
    const categories = ['haircut', 'beard', 'styling', 'grooming', 'trends', 'news'];
    const popularTags = await Post.distinct('tags', { status: 'published' });

    return res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        categories,
        tags: popularTags.slice(0, 15),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Public Blog Post by slug (with reading time, related posts, views counter)
 */
export async function getPostBySlug(req, res) {
  try {
    const { slug } = req.params;
    const isPreview = req.query.preview === 'true';

    const filter = { slug };
    if (!isPreview) {
      filter.status = 'published';
    }

    const post = await Post.findOne(filter);
    if (!post) {
      return res.status(404).json({ success: false, error: { message: 'Blog post not found' } });
    }

    // Increment views if live public view
    if (!isPreview) {
      Post.findByIdAndUpdate(post._id, { $inc: { viewsCount: 1 } }).catch(() => {});
    }

    // Related posts in same category
    const relatedPosts = await Post.find({
      _id: { $ne: post._id },
      category: post.category,
      status: 'published',
    })
      .select('title slug coverImage publishedAt readingTimeMinutes')
      .limit(3)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        post,
        relatedPosts,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

// ----------------------------------------------------
// Admin Content & SEO Management
// ----------------------------------------------------

/**
 * Admin: Get all areas with quality evaluation
 */
export async function getAdminAreas(req, res) {
  try {
    const areas = await Area.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: areas });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Create an area with automatic thin content validation
 */
export async function createArea(req, res) {
  try {
    const parsed = req.body;

    const existing = await Area.findOne({ slug: parsed.slug });
    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'Area with this slug already exists' } });
    }

    const quality = validateAreaQuality(parsed);

    const area = new Area({
      ...parsed,
      qualityPassed: quality.passed,
      qualityNotes: quality.reasons,
    });

    if (mongoose.connection?.readyState === 1) {
      await area.save();
    }
    return res.status(201).json({ success: true, data: area });
  } catch (err) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Update an area
 */
export async function updateArea(req, res) {
  try {
    const { id } = req.params;
    const parsed = req.body;

    const area = await Area.findById(id);
    if (!area) {
      return res.status(404).json({ success: false, error: { message: 'Area not found' } });
    }

    if (parsed.slug && parsed.slug !== area.slug) {
      const existing = await Area.findOne({ slug: parsed.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'Slug already taken' } });
      }
    }

    Object.assign(area, parsed);

    // Re-evaluate quality check
    const quality = validateAreaQuality(area);
    area.qualityPassed = quality.passed;
    area.qualityNotes = quality.reasons;

    if (mongoose.connection?.readyState === 1) {
      await area.save();
    }
    return res.status(200).json({ success: true, data: area });
  } catch (err) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Delete an area
 */
export async function deleteArea(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Area.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: { message: 'Area not found' } });
    }
    return res.status(200).json({ success: true, message: 'Area removed successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Get all blog posts (with draft/scheduled status)
 */
export async function getAdminPosts(req, res) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: posts });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Create a blog post
 */
export async function createPost(req, res) {
  try {
    const parsed = req.body;

    const existing = await Post.findOne({ slug: parsed.slug });
    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'Post slug already exists' } });
    }

    const readingTime = calculateReadingTime(parsed.content.en);

    const post = new Post({
      ...parsed,
      readingTimeMinutes: readingTime,
    });

    if (mongoose.connection?.readyState === 1) {
      await post.save();
    }
    return res.status(201).json({ success: true, data: post });
  } catch (err) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Update a blog post
 */
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const parsed = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }

    if (parsed.slug && parsed.slug !== post.slug) {
      const existing = await Post.findOne({ slug: parsed.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'Slug already taken' } });
      }
    }

    Object.assign(post, parsed);

    if (parsed.content?.en) {
      post.readingTimeMinutes = calculateReadingTime(parsed.content.en);
    }

    if (mongoose.connection?.readyState === 1) {
      await post.save();
    }
    return res.status(200).json({ success: true, data: post });
  } catch (err) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Delete a blog post
 */
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }
    return res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Get all redirects
 */
export async function getAdminRedirects(req, res) {
  try {
    const redirects = await Redirect.find().sort({ hitCount: -1, createdAt: -1 });
    return res.status(200).json({ success: true, data: redirects });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Create redirect rule
 */
export async function createRedirect(req, res) {
  try {
    const parsed = req.body;

    const normalizedFrom = parsed.fromPath.toLowerCase().replace(/\/+$/, '') || '/';
    const existing = await Redirect.findOne({ fromPath: normalizedFrom });
    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'Redirect rule for this path already exists' } });
    }

    const redirect = new Redirect({
      ...parsed,
      fromPath: normalizedFrom,
    });

    if (mongoose.connection?.readyState === 1) {
      await redirect.save();
    }
    return res.status(201).json({ success: true, data: redirect });
  } catch (err) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Update redirect rule
 */
export async function updateRedirect(req, res) {
  try {
    const { id } = req.params;
    const parsed = req.body;

    const redirect = await Redirect.findById(id);
    if (!redirect) {
      return res.status(404).json({ success: false, error: { message: 'Redirect not found' } });
    }

    Object.assign(redirect, parsed);
    if (mongoose.connection?.readyState === 1) {
      await redirect.save();
    }
    return res.status(200).json({ success: true, data: redirect });
  } catch (err) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Delete redirect rule
 */
export async function deleteRedirect(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Redirect.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: { message: 'Redirect not found' } });
    }
    return res.status(200).json({ success: true, message: 'Redirect deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: SEO Health Report & Diagnostics
 */
export async function getSeoHealthReport(req, res) {
  try {
    const [areas, posts, services] = await Promise.all([
      Area.find().lean(),
      Post.find().lean(),
      Service.find().lean(),
    ]);

    const issues = [];
    let healthyCount = 0;
    let totalItems = 0;

    // 1. Audit Areas
    for (const a of areas) {
      totalItems++;
      const introWords = countWords(a.description?.en || a.description);
      const isShort = introWords < 25;
      const missingMeta = !a.seoTitle?.en || !a.seoDescription?.en;
      const failedQuality = !a.qualityPassed;

      if (isShort || missingMeta || failedQuality) {
        issues.push({
          type: 'area',
          id: a._id,
          title: `Area: ${a.name?.en || a.slug}`,
          slug: a.slug,
          severity: failedQuality ? 'error' : 'warning',
          problem: failedQuality
            ? `Thin content doorway risk: ${a.qualityNotes?.join('; ') || 'Failed quality threshold'}`
            : isShort
            ? `Short introduction description (${introWords} words)`
            : 'Missing custom SEO title or meta description',
          url: `/locations/${a.slug}`,
        });
      } else {
        healthyCount++;
      }
    }

    // 2. Audit Posts
    for (const p of posts) {
      totalItems++;
      const wordCount = countWords(p.content?.en);
      const isShort = wordCount < 150;
      const missingMeta = !p.seoTitle || !p.seoDescription;
      const isDraft = p.status === 'draft';

      if (isShort || missingMeta) {
        issues.push({
          type: 'post',
          id: p._id,
          title: `Post: ${p.title?.en || p.slug}`,
          slug: p.slug,
          severity: isShort ? 'warning' : 'info',
          problem: isShort
            ? `Article is relatively short (${wordCount} words; recommended >= 300 words)`
            : 'Missing custom SEO title or meta description tags',
          url: `/blog/${p.slug}`,
        });
      } else if (!isDraft) {
        healthyCount++;
      }
    }

    // 3. Audit Services
    for (const s of services) {
      totalItems++;
      const words = countWords(s.description?.en || s.description);
      if (words < 10) {
        issues.push({
          type: 'service',
          id: s._id,
          title: `Service: ${s.name}`,
          severity: 'warning',
          problem: 'Service description is too short for search engine snippets',
          url: '/services',
        });
      } else {
        healthyCount++;
      }
    }

    const healthScore = totalItems > 0 ? Math.round((healthyCount / totalItems) * 100) : 100;

    return res.status(200).json({
      success: true,
      data: {
        score: healthScore,
        totalAudited: totalItems,
        issuesCount: issues.length,
        issues,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}

/**
 * Admin: Google Business Profile (GBP) Copy-Ready Content & Helpers
 */
export async function getGbpHelpers(req, res) {
  try {
    const [settings, services, areas] = await Promise.all([
      Settings.findOne().lean(),
      Service.find({ isActive: true }).select('name price category description').lean(),
      Area.find({ isActive: true }).select('name landmarks').lean(),
    ]);

    const reviewLink =
      settings?.googleReviewLink || 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4';

    // 1. Optimized 750-character GBP Business Description
    const areaNames = areas.map((a) => a.name.en).slice(0, 4).join(', ');
    const landmarksList = areas
      .flatMap((a) => a.landmarks || [])
      .slice(0, 5)
      .join(', ');

    const descriptionEn = `Modern Mane is a premier luxury barbershop in Bandra West, Mumbai, offering master haircuts, razor fades, beard sculpting, and hot towel treatments. Serving discerning gentlemen across ${areaNames || 'Bandra, Khar, and Juhu'}. Located near ${landmarksList || 'the Clock Tower'}, we combine traditional Italian barber craft with contemporary styling in an intimate gentleman’s lounge. Book your appointment online or walk in today.`;

    const descriptionHi = `मॉडर्न मेन बांद्रा वेस्ट, मुंबई का एक प्रीमियम लक्ज़री बार्बर स्टूडियो है। यहाँ क्लासिक हेयरकट, स्किन फेड, दाढ़ी शेपिंग और हॉट टॉवल स्पा की सुविधा उपलब्ध है। पारंपरिक बार्बर शिल्पकला और आधुनिक ग्रूमिंग का बेहतरीन संगम। आज ही अपनी अपॉइंटमेंट ऑनलाइन बुक करें।`;

    // 2. Structured GBP Services
    const gbpServices = services.map((s) => ({
      name: s.name,
      category: s.category || 'Haircut',
      price: `₹${s.price}`,
      description: s.description || 'Professional grooming service by master barbers.',
    }));

    // 3. Pre-formatted FAQ answers for Google Q&A
    const gbpFaqs = [
      {
        question: 'Do you accept walk-in clients or appointments only?',
        answer: 'We happily accept both walk-in clients and advance appointments. To minimize waiting during peak hours, booking online is recommended.',
      },
      {
        question: 'Is valet or street parking available?',
        answer: 'Yes! Complimentary valet parking is available right outside our studio at 42 Heritage Lane, Bandra West.',
      },
      {
        question: 'What payment modes are accepted?',
        answer: 'We accept Cash, UPI / QR codes (GPay, PhonePe, Paytm), and all major Credit and Debit Cards.',
      },
    ];

    // 4. Weekly Google Post Update Prompts
    const postIdeas = [
      {
        type: 'Offer',
        title: 'Festival Grooming Special',
        body: 'Looking for a clean fade or sharp beard before the weekend? Enjoy a refreshing hot towel shave and haircut combo at Modern Mane. Book your chair online: https://vintageblade.in/book',
      },
      {
        type: 'Tip',
        title: 'Beard Health in Monsoon / Humidity',
        body: 'Mumbai weather making your beard frizzy? Apply 3 drops of cedarwood beard oil on damp facial hair after a warm shower to lock in moisture and tame split ends.',
      },
      {
        type: 'Product/Service',
        title: 'Signature Hot Towel Razor Shave',
        body: 'Experience the lost art of the straight razor. Pre-shave essential oils, triple steamed towels, and rich sandalwood lather for the smoothest shave in Bandra.',
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        reviewLink,
        businessDescriptions: {
          en: descriptionEn,
          hi: descriptionHi,
          characterCountEn: descriptionEn.length,
          characterCountHi: descriptionHi.length,
        },
        services: gbpServices,
        faqs: gbpFaqs,
        postIdeas,
        checklist: [
          { id: 'claim', label: 'Claim and verify Google Business Profile via postcard/phone', completed: true },
          { id: 'nap', label: 'Verify NAP (Name, Address, Phone) matches website footer identically', completed: true },
          { id: 'hours', label: 'Set opening hours including Sunday timings and holiday breaks', completed: true },
          { id: 'photos', label: 'Upload at least 10 high-resolution photos of interior, chairs, and cuts', completed: true },
          { id: 'services', label: 'Copy services list and prices into GBP Products & Services tab', completed: false },
          { id: 'qr_review', label: 'Print Counter QR Code and place at checkout desk for instant reviews', completed: false },
          { id: 'weekly_post', label: 'Publish one Google Post update every Thursday before weekend rush', completed: false },
        ],
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
}
