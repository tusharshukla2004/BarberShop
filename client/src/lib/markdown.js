/**
 * Client-side safe Markdown renderer, Table of Contents extractor, and HTML sanitizer
 */

/**
 * Escapes raw HTML characters
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips dangerous HTML tags, attributes, and JavaScript URI schemes
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHtml(html) {
  if (!html) return '';

  return (
    html
      // Remove <script> tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove <iframe>, <object>, <embed>, <applet>, <form>, <input>, <base>
      .replace(/<\/?(iframe|object|embed|applet|form|input|button|base|link|meta)\b[^>]*>/gi, '')
      // Remove inline event handlers (onload, onerror, onclick, onmouseover, etc.)
      .replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      // Remove javascript: and vbscript: protocols in href, src, or data
      .replace(/(href|src|data)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"')
      .replace(/(href|src|data)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, '$1="#"')
      // Remove data: URLs that are not images
      .replace(/(href|src)\s*=\s*(?:'data:(?!image\/)[^']*'|"data:(?!image\/)[^"]*"|data:(?!image\/)[^\s>]+)/gi, '$1="#"')
  );
}

/**
 * Generates an SEO-friendly URL slug
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Calculates estimated reading time in minutes (~200 words per minute)
 * @param {string} text
 * @returns {number}
 */
export function calculateReadingTime(text) {
  if (!text) return 1;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Extracts Table of Contents headings (H2 and H3)
 * @param {string} markdown
 * @returns {Array<{ id: string, text: string, level: number }>}
 */
export function extractTableOfContents(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const toc = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    const h3Match = trimmed.match(/^###\s+(.+)$/);

    if (h2Match) {
      const headingText = h2Match[1].replace(/[*_`]/g, '').trim();
      toc.push({
        id: slugify(headingText),
        text: headingText,
        level: 2,
      });
    } else if (h3Match) {
      const headingText = h3Match[1].replace(/[*_`]/g, '').trim();
      toc.push({
        id: slugify(headingText),
        text: headingText,
        level: 3,
      });
    }
  }

  return toc;
}

/**
 * Parses inline formatting: bold, italic, code, links, images
 * @param {string} text
 * @returns {string}
 */
function parseInline(text) {
  let parsed = text;

  // Images: ![alt](url)
  parsed = parsed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const safeUrl = sanitizeHtml(url);
    const safeAlt = escapeHtml(alt);
    return `<img src="${safeUrl}" alt="${safeAlt}" class="rounded-lg shadow-sm max-w-full my-4" loading="lazy" />`;
  });

  // Links: [text](url)
  parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    let cleanUrl = url.trim();
    if (cleanUrl.toLowerCase().startsWith('javascript:') || cleanUrl.toLowerCase().startsWith('vbscript:')) {
      cleanUrl = '#';
    }
    const safeLabel = escapeHtml(label);
    const safeUrl = sanitizeHtml(cleanUrl);
    const isExternal = safeUrl.startsWith('http');
    const targetRel = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${safeUrl}" class="text-accent underline font-medium hover:text-accent/80"${targetRel}>${safeLabel}</a>`;
  });

  // Bold: **text** or __text__
  parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>');
  parsed = parsed.replace(/__([^_]+)__/g, '<strong class="font-semibold text-ink">$1</strong>');

  // Italic: *text* or _text_
  parsed = parsed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  parsed = parsed.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Inline code: `code`
  parsed = parsed.replace(/`([^`]+)`/g, '<code class="bg-surface px-1.5 py-0.5 rounded text-xs font-mono text-ink">$1</code>');

  return parsed;
}

/**
 * Converts Markdown string into safe, sanitized HTML
 * @param {string} markdown
 * @returns {string}
 */
export function renderMarkdown(markdown) {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const htmlLines = [];
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Close open lists if blank line or non-list line
    if (inList && !trimmed.startsWith('* ') && !trimmed.startsWith('- ')) {
      htmlLines.push('</ul>');
      inList = false;
    }
    if (inOrderedList && !trimmed.match(/^\d+\.\s+/)) {
      htmlLines.push('</ol>');
      inOrderedList = false;
    }
    if (inBlockquote && !trimmed.startsWith('>')) {
      htmlLines.push('</blockquote>');
      inBlockquote = false;
    }

    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      const text = parseInline(trimmed.slice(4));
      const id = slugify(trimmed.slice(4));
      htmlLines.push(`<h3 id="${id}" class="text-lg font-bold text-ink mt-6 mb-2">${text}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      const text = parseInline(trimmed.slice(3));
      const id = slugify(trimmed.slice(3));
      htmlLines.push(`<h2 id="${id}" class="text-xl font-bold font-serif text-ink mt-8 mb-3">${text}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      const text = parseInline(trimmed.slice(2));
      const id = slugify(trimmed.slice(2));
      htmlLines.push(`<h1 id="${id}" class="text-2xl font-bold font-serif text-ink mt-10 mb-4">${text}</h1>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      if (!inBlockquote) {
        htmlLines.push('<blockquote class="border-l-4 border-accent pl-4 py-1 italic text-muted my-4">');
        inBlockquote = true;
      }
      const quoteText = parseInline(trimmed.replace(/^>\s*/, ''));
      htmlLines.push(`<p>${quoteText}</p>`);
      continue;
    }

    // Unordered List
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) {
        htmlLines.push('<ul class="list-disc list-inside space-y-1.5 my-3 text-muted">');
        inList = true;
      }
      const itemText = parseInline(trimmed.slice(2));
      htmlLines.push(`<li>${itemText}</li>`);
      continue;
    }

    // Ordered List
    const ordMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (ordMatch) {
      if (!inOrderedList) {
        htmlLines.push('<ol class="list-decimal list-inside space-y-1.5 my-3 text-muted">');
        inOrderedList = true;
      }
      const itemText = parseInline(ordMatch[2]);
      htmlLines.push(`<li>${itemText}</li>`);
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      htmlLines.push('<hr class="my-8 border-border-light" />');
      continue;
    }

    // Paragraph
    const paraText = parseInline(trimmed);
    htmlLines.push(`<p class="text-sm leading-relaxed text-muted my-3">${paraText}</p>`);
  }

  if (inList) htmlLines.push('</ul>');
  if (inOrderedList) htmlLines.push('</ol>');
  if (inBlockquote) htmlLines.push('</blockquote>');

  const rawHtml = htmlLines.join('\n');
  return sanitizeHtml(rawHtml);
}

