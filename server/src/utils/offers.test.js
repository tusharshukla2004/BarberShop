import { describe, it, expect } from 'vitest';
import { validateAndCalculateDiscount } from './offers.js';

describe('Offers & Discount Math Pure Function Suite', () => {
  const baseOffer = {
    id: 'off-1',
    title: { en: 'Diwali Special', hi: 'दीवाली ऑफर' },
    type: 'percent',
    value: 20, // 20%
    appliesToServiceIds: [],
    startsAt: new Date('2026-10-01T00:00:00Z'),
    endsAt: new Date('2026-11-30T23:59:59Z'),
    isActive: true,
    promoCode: 'DIWALI20',
    usageLimit: 100,
    usedCount: 15,
    daysOfWeek: [],
  };

  it('calculates 20% discount correctly on valid offer', () => {
    const res = validateAndCalculateDiscount({
      offer: baseOffer,
      serviceIds: ['srv-1'],
      totalPrice: 1000,
      nowDate: new Date('2026-11-01T12:00:00Z'),
    });

    expect(res.isValid).toBe(true);
    expect(res.discountAmount).toBe(200);
    expect(res.finalPrice).toBe(800);
    expect(res.originalPrice).toBe(1000);
  });

  it('calculates flat discount correctly and prevents negative final price', () => {
    const flatOffer = {
      ...baseOffer,
      type: 'flat',
      value: 700, // ₹700 flat discount
    };

    const res = validateAndCalculateDiscount({
      offer: flatOffer,
      serviceIds: ['srv-1'],
      totalPrice: 500, // Service is ₹500, discount ₹700
      nowDate: new Date('2026-11-01T12:00:00Z'),
    });

    expect(res.isValid).toBe(true);
    expect(res.discountAmount).toBe(500); // Capped at total price
    expect(res.finalPrice).toBe(0); // Never below 0
  });

  it('rejects expired offer when now is after endsAt', () => {
    const res = validateAndCalculateDiscount({
      offer: baseOffer,
      serviceIds: ['srv-1'],
      totalPrice: 500,
      nowDate: new Date('2026-12-05T00:00:00Z'), // After endsAt
    });

    expect(res.isValid).toBe(false);
    expect(res.reason).toContain('expired');
    expect(res.discountAmount).toBe(0);
    expect(res.finalPrice).toBe(500);
  });

  it('rejects scheduled offer when now is before startsAt', () => {
    const res = validateAndCalculateDiscount({
      offer: baseOffer,
      serviceIds: ['srv-1'],
      totalPrice: 500,
      nowDate: new Date('2026-09-01T00:00:00Z'), // Before startsAt
    });

    expect(res.isValid).toBe(false);
    expect(res.reason).toContain('not started yet');
  });

  it('rejects promo code that has exceeded its usage limit', () => {
    const exhaustedOffer = {
      ...baseOffer,
      usageLimit: 50,
      usedCount: 50,
    };

    const res = validateAndCalculateDiscount({
      offer: exhaustedOffer,
      serviceIds: ['srv-1'],
      totalPrice: 1000,
      nowDate: new Date('2026-11-01T12:00:00Z'),
    });

    expect(res.isValid).toBe(false);
    expect(res.reason).toContain('usage limit');
  });

  it('enforces service restriction when appliesToServiceIds is specified', () => {
    const serviceRestrictedOffer = {
      ...baseOffer,
      appliesToServiceIds: ['srv-vip-deluxe'],
    };

    const failRes = validateAndCalculateDiscount({
      offer: serviceRestrictedOffer,
      serviceIds: ['srv-haircut-standard'],
      totalPrice: 500,
      nowDate: new Date('2026-11-01T12:00:00Z'),
    });
    expect(failRes.isValid).toBe(false);
    expect(failRes.reason).toContain('does not apply');

    const passRes = validateAndCalculateDiscount({
      offer: serviceRestrictedOffer,
      serviceIds: ['srv-vip-deluxe', 'srv-haircut-standard'],
      totalPrice: 1200,
      nowDate: new Date('2026-11-01T12:00:00Z'),
    });
    expect(passRes.isValid).toBe(true);
  });

  it('enforces day of week restriction', () => {
    const tuesdayOnlyOffer = {
      ...baseOffer,
      daysOfWeek: [2], // Tuesday only (2)
    };

    // 2026-11-02 is Monday (1)
    const mondayRes = validateAndCalculateDiscount({
      offer: tuesdayOnlyOffer,
      serviceIds: ['srv-1'],
      totalPrice: 650,
      dateStr: '2026-11-02',
      nowDate: new Date('2026-11-02T10:00:00Z'),
    });
    expect(mondayRes.isValid).toBe(false);
    expect(mondayRes.reason).toContain('Tuesday');

    // 2026-11-03 is Tuesday (2)
    const tuesdayRes = validateAndCalculateDiscount({
      offer: tuesdayOnlyOffer,
      serviceIds: ['srv-1'],
      totalPrice: 650,
      dateStr: '2026-11-03',
      nowDate: new Date('2026-11-03T10:00:00Z'),
    });
    expect(tuesdayRes.isValid).toBe(true);
  });
});

