/**
 * WhatsApp Utilities for Click-to-Chat Deep Linking & Template Rendering (Server)
 * Zero paid APIs - pure wa.me URLs
 */

/**
 * Normalizes Indian mobile numbers to international format without the plus sign.
 * Accepts:
 *  - 10-digit numbers: '9876543210' -> '919876543210'
 *  - Numbers with leading 0: '09876543210' -> '919876543210'
 *  - Numbers with +91: '+91 98765 43210' -> '919876543210'
 *  - Numbers with 91: '919876543210' -> '919876543210'
 * Returns null for invalid numbers.
 *
 * @param {string|number|null|undefined} input
 * @returns {string|null} 12-digit string starting with 91, or null
 */
export function normalizeIndianPhone(input) {
  if (input === null || input === undefined) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // Extract all numeric digits
  const digits = raw.replace(/\D/g, '');

  let mobileTen = null;

  if (digits.length === 10) {
    mobileTen = digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    mobileTen = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    mobileTen = digits.slice(2);
  } else {
    return null;
  }

  // Indian mobile numbers must start with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(mobileTen)) {
    return null;
  }

  return `91${mobileTen}`;
}

/**
 * Builds a sanitized wa.me click-to-chat deep link
 *
 * @param {string|number} phone - Destination phone number
 * @param {string} [message=''] - Prefilled text message
 * @returns {string|null} Complete wa.me URL or null if phone is invalid
 */
export function buildWhatsAppLink(phone, message = '') {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized) return null;

  const encodedText = encodeURIComponent(String(message || '').trim());
  return encodedText
    ? `https://wa.me/${normalized}?text=${encodedText}`
    : `https://wa.me/${normalized}`;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into Asia/Kolkata readable format
 * @param {string} dateStr
 * @returns {string} e.g. "01 Nov 2026"
 */
function formatDateKolkata(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day, 6, 0, 0));
      return d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a time string into 12-hour format with AM/PM
 * @param {string} timeStr
 * @returns {string} e.g. "10:00 AM"
 */
function formatTime12H(timeStr) {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  // Already in 12-hour format like "10:00 AM"
  if (/^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  // 24-hour format like "14:30"
  const match24 = trimmed.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const mins = match24[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${mins} ${period}`;
  }
  return trimmed;
}

/**
 * Escapes customer-provided text to prevent injection or malformed bracket formatting
 * @param {string} str
 * @returns {string}
 */
function sanitizeCustomerString(str) {
  if (!str) return '';
  return String(str)
    .replace(/[{}]/g, '') // strip brackets to prevent nested placeholder injection
    .trim();
}

/**
 * Known placeholder keys supported in templates
 */
export const KNOWN_PLACEHOLDERS = [
  'name',
  'date',
  'time',
  'service',
  'barber',
  'shopName',
  'address',
  'mapsLink',
  'bookingRef',
  'reviewLink',
  'cancelPolicy',
  'tokenNumber',
  'lastVisitAgo',
  'bookingLink',
  'walletLink',
  'manageLink',
];

/**
 * Renders a message template by substituting known placeholders with provided data.
 * Unknown placeholders become empty strings.
 * Whitespace is normalized and trimmed.
 *
 * @param {string} template - Template with placeholders like {name}, {date}, etc.
 * @param {Object} [data={}] - Replacement values
 * @returns {string} Rendered message
 */
export function renderTemplate(template, data = {}) {
  if (!template) return '';

  const safeData = {
    name: sanitizeCustomerString(data.name || data.customerName || ''),
    date: formatDateKolkata(data.date),
    time: formatTime12H(data.time || data.startTime || ''),
    service: data.service || data.serviceName || '',
    barber: data.barber || data.barberName || '',
    shopName: data.shopName || 'Modern Mane',
    address: data.address || '',
    mapsLink: data.mapsLink || '',
    bookingRef: data.bookingRef || (data.id ? `BK-${data.id.slice(-6).toUpperCase()}` : ''),
    manageLink: data.manageLink || '',
    reviewLink: data.reviewLink || '',
    cancelPolicy: data.cancelPolicy || 'Free cancellation up to 2 hours before your appointment.',
  };

  // Replace all {key} placeholders
  const rendered = template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => {
    if (Object.prototype.hasOwnProperty.call(safeData, key)) {
      return safeData[key] !== undefined && safeData[key] !== null ? String(safeData[key]) : '';
    }
    // Unknown placeholders become empty string
    return '';
  });

  return rendered.trim();
}

/**
 * Validates whether a template contains only recognized placeholder keys
 * @param {string} template
 * @returns {{ isValid: boolean, invalidPlaceholders: string[] }}
 */
export function validateTemplatePlaceholders(template) {
  if (!template) return { isValid: true, invalidPlaceholders: [] };

  const matches = template.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
  const invalidPlaceholders = [];

  for (const match of matches) {
    const key = match.replace(/[{}]/g, '');
    if (!KNOWN_PLACEHOLDERS.includes(key) && !invalidPlaceholders.includes(key)) {
      invalidPlaceholders.push(key);
    }
  }

  return {
    isValid: invalidPlaceholders.length === 0,
    invalidPlaceholders,
  };
}

