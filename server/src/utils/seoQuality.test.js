import { describe, it, expect } from 'vitest';
import { countWords, validateAreaQuality } from './seoQuality.js';

describe('SEO Quality Gate Suite (Thin Doorway Page Prevention)', () => {
  it('counts words accurately across whitespace and punctuation', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords('Men haircuts in Bandra West, Mumbai!')).toBe(6);
  });

  it('rejects thin area pages with insufficient word count or missing FAQs', () => {
    const thinArea = {
      name: { en: 'Juhu', hi: 'जुहू' },
      slug: 'juhu',
      landmarks: ['Juhu Beach'],
      description: { en: 'A short intro.' },
      directions: { en: 'Take an auto.' },
      faqs: [],
    };

    const result = validateAreaQuality(thinArea);
    expect(result.passed).toBe(false);
    expect(result.reasons.some((r) => r.includes('too short'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('FAQ is required'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('too thin'))).toBe(true);
  });

  it('approves rich, high-value local pages with unique intro, directions, and FAQs', () => {
    const richArea = {
      name: { en: 'Bandra West', hi: 'बांद्रा वेस्ट' },
      slug: 'bandra-west',
      landmarks: ['Linking Road', 'Hill Road', 'Bandra Station'],
      description: {
        en: 'Located right in the heart of suburban Mumbai, Bandra West is a bustling hub for contemporary fashion and lifestyle. Modern Mane Luxury Barber Studio brings timeless gentleman grooming, hot towel razor shaves, and skin fades to discerning clients across Bandra.',
      },
      directions: {
        en: 'Our studio is located 5 minutes walking distance from Bandra Railway Station (West exit). From Linking Road, head west down Turner Road towards the historic Clock Tower landmark. Dedicated valet parking is available right in front of our studio entrance.',
      },
      faqs: [
        {
          question: { en: 'Is parking available at the Bandra West salon?' },
          answer: {
            en: 'Yes, complimentary valet parking is provided for all scheduled appointments. Street parking is also available on 42 Heritage Lane.',
          },
        },
      ],
    };

    const result = validateAreaQuality(richArea);
    expect(result.passed).toBe(true);
    expect(result.wordCount).toBeGreaterThanOrEqual(100);
    expect(result.reasons).toHaveLength(0);
  });
});
