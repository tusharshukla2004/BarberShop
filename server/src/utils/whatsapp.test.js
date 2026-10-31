import { describe, it, expect } from 'vitest';
import {
  normalizeIndianPhone,
  buildWhatsAppLink,
  renderTemplate,
  validateTemplatePlaceholders,
} from './whatsapp.js';

describe('Server WhatsApp Utilities', () => {
  describe('normalizeIndianPhone', () => {
    it('normalizes 10-digit Indian numbers starting with 6, 7, 8, 9', () => {
      expect(normalizeIndianPhone('9876543210')).toBe('919876543210');
      expect(normalizeIndianPhone('8876543210')).toBe('918876543210');
      expect(normalizeIndianPhone('7876543210')).toBe('917876543210');
      expect(normalizeIndianPhone('6876543210')).toBe('916876543210');
    });

    it('normalizes numbers starting with 0, +91, and 91', () => {
      expect(normalizeIndianPhone('09876543210')).toBe('919876543210');
      expect(normalizeIndianPhone('+919876543210')).toBe('919876543210');
      expect(normalizeIndianPhone('919876543210')).toBe('919876543210');
    });

    it('returns null for non-Indian or malformed numbers', () => {
      expect(normalizeIndianPhone('5556667777')).toBeNull();
      expect(normalizeIndianPhone('12345')).toBeNull();
      expect(normalizeIndianPhone(null)).toBeNull();
    });
  });

  describe('buildWhatsAppLink', () => {
    it('constructs wa.me URL with normalized phone and encoded message', () => {
      const link = buildWhatsAppLink('+91 98765 43210', 'Namaste!');
      expect(link).toBe('https://wa.me/919876543210?text=Namaste!');
    });

    it('returns null for invalid phone', () => {
      expect(buildWhatsAppLink('bad-phone', 'Hello')).toBeNull();
    });
  });

  describe('renderTemplate', () => {
    it('replaces known placeholders and removes unknown placeholders', () => {
      const template = 'Namaste {name}! Service: {service} at {time}. Code: {couponCode}';
      const rendered = renderTemplate(template, {
        name: 'Rahul',
        service: 'Haircut',
        time: '11:00 AM',
      });
      expect(rendered).toBe('Namaste Rahul! Service: Haircut at 11:00 AM. Code:');
    });

    it('formats times into 12-hour AM/PM format', () => {
      expect(renderTemplate('{time}', { time: '14:30' })).toBe('02:30 PM');
    });
  });

  describe('validateTemplatePlaceholders', () => {
    it('validates placeholder keys', () => {
      expect(validateTemplatePlaceholders('{name} {date} {time}').isValid).toBe(true);
      expect(validateTemplatePlaceholders('{name} {unknown_tag}').isValid).toBe(false);
    });
  });
});
