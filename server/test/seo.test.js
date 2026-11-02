import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import Area from '../src/models/Area.js';
import Post from '../src/models/Post.js';
import Redirect from '../src/models/Redirect.js';
import Service from '../src/models/Service.js';
import Settings from '../src/models/Settings.js';
import { publishScheduledPosts } from '../src/services/blogScheduler.js';
import { isBotRequest } from '../src/middleware/prerenderMiddleware.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';

function generateAuthCookie(role = 'owner', id = '60d5ec49f1b2c8b1f8e4e1a1') {
  const token = jwt.sign({ id, role, email: `${role}@modernmane.com` }, env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return `${env.COOKIE_NAME}=${token}`;
}

describe('Prompt 20: Local SEO, Blog, Technical SEO & GBP Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Redirect, 'findOne').mockResolvedValue(null);
    vi.spyOn(Settings, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        googleReviewLink: 'https://g.page/modernmane/review',
      }),
    });
  });

  describe('Bot Detection & Prerendering Helper', () => {
    it('detects common search crawlers and social preview user agents', () => {
      expect(isBotRequest('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
      expect(isBotRequest('bingbot/2.0; +http://www.bing.com/bingbot.htm')).toBe(true);
      expect(isBotRequest('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')).toBe(true);
      expect(isBotRequest('Twitterbot/1.0')).toBe(true);
      expect(isBotRequest('WhatsApp/2.21.12.21 N')).toBe(true);
      expect(isBotRequest('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36')).toBe(false);
    });
  });

  describe('Scheduled Blog Publishing Service', () => {
    it('transitions past scheduled posts to published', async () => {
      const mockPost = {
        id: 'post-1',
        _id: 'post-1',
        title: { en: 'Scheduled Post' },
        status: 'scheduled',
        publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Post, 'find').mockResolvedValue([mockPost]);

      const result = await publishScheduledPosts();
      expect(mockPost.status).toBe('published');
      expect(mockPost.save).toHaveBeenCalled();
      expect(result.publishedCount).toBe(1);
    });
  });

  describe('Sitemap & Robots.txt', () => {
    it('GET /sitemap.xml returns valid XML format with hreflang and lastmod', async () => {
      vi.spyOn(Post, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              {
                slug: 'master-fade-haircut-guide',
                updatedAt: new Date('2026-10-15'),
                publishedAt: new Date('2026-10-15'),
              },
            ]),
          }),
        }),
      });

      vi.spyOn(Area, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              slug: 'bandra-west',
              updatedAt: new Date('2026-10-20'),
            },
          ]),
        }),
      });

      vi.spyOn(Service, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              slug: 'classic-haircut',
              name: 'Classic Haircut',
              updatedAt: new Date('2026-10-20'),
            },
          ]),
        }),
      });

      const res = await request(app).get('/sitemap.xml');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/xml');
      expect(res.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(res.text).toContain('<loc>https://vintageblade.in/</loc>');
      expect(res.text).toContain('<loc>https://vintageblade.in/blog/master-fade-haircut-guide</loc>');
      expect(res.text).toContain('<loc>https://vintageblade.in/locations/bandra-west</loc>');
      expect(res.text).toContain('<loc>https://vintageblade.in/locations/bandra-west/classic-haircut</loc>');
      expect(res.text).toContain('hreflang="en"');
      expect(res.text).toContain('hreflang="hi"');
    });

    it('GET /robots.txt disallows admin and points to sitemap', async () => {
      const res = await request(app).get('/robots.txt');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('Disallow: /admin/');
      expect(res.text).toContain('Disallow: /wallet/');
      expect(res.text).toContain('Sitemap: https://vintageblade.in/sitemap.xml');
    });
  });

  describe('Redirects and 410 Handling', () => {
    it('redirects with 301 for moved URLs', async () => {
      vi.spyOn(Redirect, 'findOne').mockResolvedValue({
        _id: '60d5ec49f1b2c8b1f8e4e1a2',
        fromPath: '/old-haircuts',
        toPath: '/services',
        statusCode: 301,
        isActive: true,
      });
      vi.spyOn(Redirect, 'findByIdAndUpdate').mockResolvedValue({});

      const res = await request(app).get('/old-haircuts');
      expect(res.status).toBe(301);
      expect(res.headers.location).toBe('/services');
    });

    it('returns HTTP 410 Gone for permanently removed content', async () => {
      vi.spyOn(Redirect, 'findOne').mockResolvedValue({
        _id: '60d5ec49f1b2c8b1f8e4e1a3',
        fromPath: '/discontinued-service',
        toPath: '',
        statusCode: 410,
        isActive: true,
      });
      vi.spyOn(Redirect, 'findByIdAndUpdate').mockResolvedValue({});

      const res = await request(app).get('/discontinued-service');
      expect(res.status).toBe(410);
      expect(res.text).toContain('410 Gone');
    });
  });

  describe('Area Quality Gate & Doorway Prevention', () => {
    it('rejects thin area creation lacking word count or FAQs', async () => {
      vi.spyOn(Area, 'findOne').mockResolvedValue(null);

      const ownerCookie = generateAuthCookie('owner');
      const thinPayload = {
        name: { en: 'Thin Area', hi: 'थिन एरिया' },
        slug: 'thin-area',
        landmarks: ['Tower'],
        description: { en: 'This is short' },
        directions: { en: 'Walk 200m' },
        faqs: [],
      };

      const res = await request(app)
        .post('/api/admin/areas')
        .set('Cookie', ownerCookie)
        .send(thinPayload);

      // Should save but qualityPassed must be false with qualityNotes
      expect(res.status).toBe(201);
      expect(res.body.data.qualityPassed).toBe(false);
      expect(res.body.data.qualityNotes.length).toBeGreaterThan(0);
    });

    it('denies public access to unpublished or thin area pages', async () => {
      vi.spyOn(Area, 'findOne').mockResolvedValue({
        slug: 'unverified-area',
        isPublished: false,
        qualityPassed: false,
        isActive: true,
      });

      const res = await request(app).get('/api/locations/unverified-area');
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('pending content review');
    });
  });

  describe('Prerender Middleware for Bots', () => {
    it('returns full semantic HTML with JSON-LD schema when crawler requests area page', async () => {
      vi.spyOn(Area, 'findOne').mockResolvedValue({
        name: { en: 'Bandra West' },
        slug: 'bandra-west',
        description: { en: 'Premium luxury grooming and haircut studio in Bandra West.' },
        directions: { en: 'Head down Turner Road towards Clock Tower.' },
        landmarks: ['Clock Tower', 'Linking Road'],
        faqs: [
          {
            question: { en: 'Is parking available?' },
            answer: { en: 'Yes, valet parking is provided.' },
          },
        ],
        isActive: true,
        isPublished: true,
        qualityPassed: true,
      });

      const res = await request(app)
        .get('/locations/bandra-west')
        .set('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');

      expect(res.status).toBe(200);
      expect(res.text).toContain('<!DOCTYPE html>');
      expect(res.text).toContain("<title>Luxury Men's Haircut & Grooming in Bandra West | Modern Mane</title>");
      expect(res.text).toContain('application/ld+json');
      expect(res.text).toContain('"@type":"BarberShop"');
      expect(res.text).toContain('"name":"Bandra West"');
      expect(res.text).toContain('<h1>');
      expect(res.text).toContain('Yes, valet parking is provided.');
    });

    it('returns article schema and sanitized markdown when crawler requests blog post', async () => {
      vi.spyOn(Post, 'findOne').mockResolvedValue({
        title: { en: 'The Complete Beard Oil Guide' },
        slug: 'beard-oil-guide',
        excerpt: { en: 'Everything you need to know about beard oil.' },
        content: { en: '## Benefits of Cedarwood\nMoisturizes facial hair and stops itching.' },
        coverImage: 'https://images.unsplash.com/beard.jpg',
        readingTimeMinutes: 3,
        status: 'published',
        publishedAt: new Date('2026-10-01'),
        author: { name: 'Master Barber Ravi' },
      });

      const res = await request(app)
        .get('/blog/beard-oil-guide')
        .set('User-Agent', 'Twitterbot/1.0');

      expect(res.status).toBe(200);
      expect(res.text).toContain('<title>The Complete Beard Oil Guide | Modern Mane Grooming Journal</title>');
      expect(res.text).toContain('"@type":"Article"');
      expect(res.text).toContain('Master Barber Ravi');
      expect(res.text).toContain('<h2 id="benefits-of-cedarwood"');
    });
  });

  describe('SEO Health & GBP Endpoints', () => {
    it('GET /api/admin/seo/health calculates health score and identifies thin content', async () => {
      vi.spyOn(Area, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: 'area-1',
            name: { en: 'Bandra' },
            slug: 'bandra',
            description: { en: 'Short' },
            qualityPassed: false,
            qualityNotes: ['Too short'],
          },
        ]),
      });

      vi.spyOn(Post, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: 'post-1',
            title: { en: 'Fade Guide' },
            slug: 'fade-guide',
            content: { en: 'Short post' },
          },
        ]),
      });

      vi.spyOn(Service, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });

      const ownerCookie = generateAuthCookie('owner');
      const res = await request(app).get('/api/admin/seo/health').set('Cookie', ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('score');
      expect(res.body.data.issuesCount).toBeGreaterThan(0);
      expect(res.body.data.issues[0]).toHaveProperty('problem');
    });

    it('GET /api/admin/seo/gbp provides copy-ready business descriptions and review link', async () => {
      vi.spyOn(Area, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ name: { en: 'Bandra West' }, landmarks: ['Clock Tower'] }]),
        }),
      });

      vi.spyOn(Service, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ name: 'Signature Fade', price: 450, category: 'Haircut' }]),
        }),
      });

      const ownerCookie = generateAuthCookie('owner');
      const res = await request(app).get('/api/admin/seo/gbp').set('Cookie', ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businessDescriptions.en).toContain('Modern Mane');
      expect(res.body.data.services.length).toBeGreaterThan(0);
      expect(res.body.data.checklist.length).toBeGreaterThan(0);
    });
  });
});
