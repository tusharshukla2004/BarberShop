import { describe, it, expect } from 'vitest';
import {
  normalizeIndianPhone,
  buildWhatsAppLink,
  renderTemplate,
  validateTemplatePlaceholders,
} from './whatsapp';

describe('WhatsApp Utilities', () => {
  describe('normalizeIndianPhone', () => {
    it('normalizes standard 10-digit Indian numbers starting with 6, 7, 8, 9', () => {
      expect(normalizeIndianPhone('9876543210')).toBe('919876543210');
      expect(normalizeIndianPhone('8876543210')).toBe('918876543210');
      expect(normalizeIndianPhone('7876543210')).toBe('917876543210');
      expect(normalizeIndianPhone('6876543210')).toBe('916876543210');
    });

    it('handles numeric input', () => {
      expect(normalizeIndianPhone(9876543210)).toBe('919876543210');
    });

    it('normalizes numbers starting with 0', () => {
      expect(normalizeIndianPhone('09876543210')).toBe('919876543210');
    });

    it('normalizes numbers starting with +91 and 91', () => {
      expect(normalizeIndianPhone('+919876543210')).toBe('919876543210');
      expect(normalizeIndianPhone('919876543210')).toBe('919876543210');
    });

    it('strips spaces, dashes, parentheses and formatting characters', () => {
      expect(normalizeIndianPhone('+91 98765 43210')).toBe('919876543210');
      expect(normalizeIndianPhone('+91 (987) 654-3210')).toBe('919876543210');
      expect(normalizeIndianPhone('0-98765-43210')).toBe('919876543210');
    });

    it('returns null for invalid numbers', () => {
      expect(normalizeIndianPhone('')).toBeNull();
      expect(normalizeIndianPhone(null)).toBeNull();
      expect(normalizeIndianPhone(undefined)).toBeNull();
      expect(normalizeIndianPhone('12345')).toBeNull(); // too short
      expect(normalizeIndianPhone('5556667777')).toBeNull(); // starts with 5 (not Indian mobile)
      expect(normalizeIndianPhone('01234567890')).toBeNull(); // starts with 1 after 0
      expect(normalizeIndianPhone('+14155552671')).toBeNull(); // US number
      expect(normalizeIndianPhone('abcdefghij')).toBeNull(); // non-numeric
    });
  });

  describe('buildWhatsAppLink', () => {
    it('constructs wa.me URL with normalized phone and encoded message', () => {
      const link = buildWhatsAppLink('9876543210', 'Namaste Rahul!\nAapka appointment confirm ho gaya.');
      expect(link).toBe(
        'https://wa.me/919876543210?text=Namaste%20Rahul!%0AAapka%20appointment%20confirm%20ho%20gaya.'
      );
    });

    it('constructs wa.me URL without text query if message is empty', () => {
      const link = buildWhatsAppLink('9876543210', '');
      expect(link).toBe('https://wa.me/919876543210');
    });

    it('returns null for invalid destination phone', () => {
      expect(buildWhatsAppLink('invalid-number', 'Hello')).toBeNull();
      expect(buildWhatsAppLink('', 'Hello')).toBeNull();
    });
  });

  describe('renderTemplate', () => {
    const sampleData = {
      name: 'Aakash Verma',
      date: '2026-11-05',
      time: '14:30',
      service: 'Classic Haircut',
      barber: 'John Smith',
      shopName: 'Modern Mane',
      address: '42 Heritage Lane, Bandra West, Mumbai',
      mapsLink: 'https://maps.google.com/?q=Modern+Mane',
      bookingRef: 'BK-108234',
      reviewLink: 'https://g.page/r/modern-mane-reviews',
      cancelPolicy: 'Free cancellation up to 2 hours prior.',
    };

    it('replaces all known placeholders accurately', () => {
      const template =
        'Hello {name}! Booking for {service} with {barber} on {date} at {time} confirmed at {shopName}. Ref: {bookingRef}. {address} {mapsLink} {reviewLink} {cancelPolicy}';
      const rendered = renderTemplate(template, sampleData);

      expect(rendered).toContain('Hello Aakash Verma!');
      expect(rendered).toContain('Classic Haircut');
      expect(rendered).toContain('John Smith');
      expect(rendered).toContain('02:30 PM'); // 14:30 converted to 12h
      expect(rendered).toContain('Modern Mane');
      expect(rendered).toContain('BK-108234');
      expect(rendered).toContain('42 Heritage Lane');
      expect(rendered).toContain('https://maps.google.com');
      expect(rendered).toContain('Free cancellation');
    });

    it('converts unknown placeholders to empty string', () => {
      const template = 'Hello {name}, your secret code is {secretCode}{discountCoupon}!';
      const rendered = renderTemplate(template, { name: 'Vikram' });
      expect(rendered).toBe('Hello Vikram, your secret code is !');
    });

    it('trims leading and trailing whitespace', () => {
      const template = '   \n  Appointment confirmed!   \n\n ';
      expect(renderTemplate(template, {})).toBe('Appointment confirmed!');
    });

    it('formats dates in Asia/Kolkata timezone properly', () => {
      const template = 'Date: {date}';
      const rendered = renderTemplate(template, { date: '2026-11-05' });
      expect(rendered).toMatch(/Date:\s*05\s+Nov\s+2026/);
    });

    it('formats times in 12-hour AM/PM format', () => {
      expect(renderTemplate('{time}', { time: '09:00' })).toBe('09:00 AM');
      expect(renderTemplate('{time}', { time: '13:15' })).toBe('01:15 PM');
      expect(renderTemplate('{time}', { time: '10:30 AM' })).toBe('10:30 AM');
    });

    it('sanitizes customer names to prevent bracket injection', () => {
      const template = 'Hello {name}!';
      const rendered = renderTemplate(template, { name: 'Rohit {evilPlaceholder}' });
      expect(rendered).toBe('Hello Rohit evilPlaceholder!');
    });

    it('handles empty or missing data gracefully', () => {
      const template = 'Hello {name}! Service: {service}';
      const rendered = renderTemplate(template, {});
      expect(rendered).toBe('Hello ! Service:');
    });
  });

  describe('validateTemplatePlaceholders', () => {
    it('returns isValid: true for valid known placeholders', () => {
      const t = 'Hi {name}, see you on {date} at {time} for {service} with {barber}!';
      const res = validateTemplatePlaceholders(t);
      expect(res.isValid).toBe(true);
      expect(res.invalidPlaceholders).toEqual([]);
    });

    it('detects unknown placeholder tags', () => {
      const t = 'Hi {name}, your pin is {pinCode} and coupon is {promo_code}!';
      const res = validateTemplatePlaceholders(t);
      expect(res.isValid).toBe(false);
      expect(res.invalidPlaceholders).toEqual(['pinCode', 'promo_code']);
    });
  });
});
