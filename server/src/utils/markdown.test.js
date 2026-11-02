import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeHtml,
  slugify,
  calculateReadingTime,
  extractTableOfContents,
  renderMarkdown,
} from './markdown.js';

describe('Markdown & HTML Sanitization Suite', () => {
  describe('slugify', () => {
    it('creates lowercase, hyphenated URL slugs', () => {
      expect(slugify('Top 5 Beard Grooming Tips for 2026!')).toBe('top-5-beard-grooming-tips-for-2026');
      expect(slugify("Men's Haircut in Bandra West")).toBe('mens-haircut-in-bandra-west');
      expect(slugify('  Extra   Spaces  -- And Symbols ## ')).toBe('extra-spaces-and-symbols');
    });

    it('handles empty input gracefully', () => {
      expect(slugify('')).toBe('');
      expect(slugify(null)).toBe('');
    });
  });

  describe('calculateReadingTime', () => {
    it('calculates reading time assuming ~200 words per minute', () => {
      const shortText = 'One two three four five';
      expect(calculateReadingTime(shortText)).toBe(1);

      const words450 = new Array(450).fill('word').join(' ');
      expect(calculateReadingTime(words450)).toBe(3);
    });
  });

  describe('extractTableOfContents', () => {
    it('extracts H2 and H3 headings with slugs', () => {
      const md = `
# Main Title (H1 - should be excluded from sub-toc)
Introduction paragraph.

## Why Choose A Fade
Details on fade.

### Skin Fade vs Taper
Sub-details.

## Beard Maintenance
Beard tips.
      `;
      const toc = extractTableOfContents(md);
      expect(toc).toHaveLength(3);
      expect(toc[0]).toEqual({ id: 'why-choose-a-fade', text: 'Why Choose A Fade', level: 2 });
      expect(toc[1]).toEqual({ id: 'skin-fade-vs-taper', text: 'Skin Fade vs Taper', level: 3 });
      expect(toc[2]).toEqual({ id: 'beard-maintenance', text: 'Beard Maintenance', level: 2 });
    });
  });

  describe('renderMarkdown and XSS defense', () => {
    it('renders basic markdown syntax to HTML', () => {
      const md = `
## Barber Tips
This is **bold** and this is *italic*.
* Item 1
* Item 2

Visit [Modern Mane](https://vintageblade.in) today!
      `;
      const html = renderMarkdown(md);
      expect(html).toContain('<h2 id="barber-tips"');
      expect(html).toContain('<strong class="font-semibold text-ink">bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<ul class="list-disc');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<a href="https://vintageblade.in"');
    });

    it('strips dangerous <script> tags and payloads completely', () => {
      const maliciousMd = `
Hello world!
<script>alert("XSS")</script>
<script src="https://evil.com/malicious.js"></script>
Normal text continues.
      `;
      const html = renderMarkdown(maliciousMd);
      expect(html).not.toContain('<script');
      expect(html).not.toContain('alert("XSS")');
      expect(html).not.toContain('evil.com');
      expect(html).toContain('Hello world!');
    });

    it('strips inline event handlers like onerror and onload', () => {
      const payload = `<img src="invalid-image" onerror="alert('pwned')" />`;
      const sanitized = sanitizeHtml(payload);
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert');
    });

    it('neutralizes javascript: URIs in markdown links', () => {
      const maliciousLink = `[Click here for free discount](javascript:alert('XSS'))`;
      const html = renderMarkdown(maliciousLink);
      expect(html).not.toContain('href="javascript:');
      expect(html).toContain('href="#"');
    });

    it('strips iframe and object tags', () => {
      const iframeMd = `<iframe src="https://phishing.site"></iframe><object data="bad.swf"></object>`;
      const html = renderMarkdown(iframeMd);
      expect(html).not.toContain('<iframe');
      expect(html).not.toContain('<object');
    });
  });
});

