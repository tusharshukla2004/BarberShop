import { describe, it, expect } from 'vitest';
import { calculateBookingPrice } from './pricing.js';

describe('Pricing & Benefit Precedence Logic', () => {
  const baseService = {
    servicePrice: 1000,
    serviceId: 'srv-haircut',
  };

  describe('Precedence Order 1: Package Session', () => {
    it('applies package session over membership and offer, setting price to 0', () => {
      const result = calculateBookingPrice({
        servicePrice: 1000,
        serviceId: 'srv-haircut',
        customerPackage: {
          id: 'pkg-1',
          packageId: 'base-pkg',
          serviceIds: ['srv-haircut'],
          sessionsTotal: 5,
          sessionsUsed: 2,
          status: 'active',
          expiresAt: new Date(Date.now() + 86400000),
        },
        customerMembership: {
          id: 'mem-1',
          status: 'active',
          endsAt: new Date(Date.now() + 86400000),
          benefits: [{ type: 'discount_percent', value: 20 }],
        },
        offer: {
          id: 'off-1',
          isActive: true,
          type: 'flat',
          value: 150,
          promoCode: 'SAVE150',
        },
      });

      expect(result.appliedBenefitType).toBe('package');
      expect(result.finalPrice).toBe(0);
      expect(result.discountAmount).toBe(1000);
      expect(result.benefitDetails.sessionsRemainingAfterUse).toBe(2);
    });

    it('ignores package if service is not covered in package serviceIds', () => {
      const result = calculateBookingPrice({
        servicePrice: 1000,
        serviceId: 'srv-coloring',
        customerPackage: {
          id: 'pkg-1',
          packageId: 'base-pkg',
          serviceIds: ['srv-haircut', 'srv-shave'],
          sessionsTotal: 5,
          sessionsUsed: 0,
          status: 'active',
          expiresAt: new Date(Date.now() + 86400000),
        },
        customerMembership: {
          id: 'mem-1',
          status: 'active',
          endsAt: new Date(Date.now() + 86400000),
          benefits: [{ type: 'discount_percent', value: 20 }],
        },
      });

      // Package didn't cover srv-coloring, falls back to membership
      expect(result.appliedBenefitType).toBe('membership');
      expect(result.discountAmount).toBe(200);
      expect(result.finalPrice).toBe(800);
    });

    it('ignores package if sessions are exhausted or expired', () => {
      const result = calculateBookingPrice({
        servicePrice: 1000,
        serviceId: 'srv-haircut',
        customerPackage: {
          id: 'pkg-1',
          sessionsTotal: 5,
          sessionsUsed: 5, // exhausted
          status: 'active',
          expiresAt: new Date(Date.now() + 86400000),
        },
        offer: {
          id: 'off-1',
          isActive: true,
          type: 'flat',
          value: 100,
          promoCode: 'SAVE100',
        },
      });

      expect(result.appliedBenefitType).toBe('offer');
      expect(result.finalPrice).toBe(900);
    });
  });

  describe('Precedence Order 2: Membership Plan Benefit', () => {
    it('applies free_service benefit to set final price to 0', () => {
      const result = calculateBookingPrice({
        servicePrice: 800,
        serviceId: 'srv-beard',
        customerMembership: {
          id: 'mem-1',
          status: 'active',
          endsAt: new Date(Date.now() + 86400000),
          benefits: [{ type: 'free_service', serviceIds: ['srv-beard'] }],
        },
      });

      expect(result.appliedBenefitType).toBe('membership');
      expect(result.finalPrice).toBe(0);
      expect(result.discountAmount).toBe(800);
    });

    it('applies percentage discount correctly and overrides offer by default (no stacking)', () => {
      const result = calculateBookingPrice({
        servicePrice: 500,
        serviceId: 'srv-haircut',
        customerMembership: {
          id: 'mem-1',
          status: 'active',
          endsAt: new Date(Date.now() + 86400000),
          benefits: [{ type: 'discount_percent', value: 25 }],
        },
        offer: {
          id: 'off-1',
          isActive: true,
          type: 'percent',
          value: 10,
        },
      });

      expect(result.appliedBenefitType).toBe('membership');
      expect(result.discountAmount).toBe(125);
      expect(result.finalPrice).toBe(375);
    });
  });

  describe('Loyalty Reward Redemption', () => {
    it('applies loyalty free_service reward', () => {
      const result = calculateBookingPrice({
        servicePrice: 600,
        serviceId: 'srv-haircut',
        loyaltyReward: {
          isEligible: true,
          type: 'free_service',
          stampsToRedeem: 10,
        },
      });

      expect(result.appliedBenefitType).toBe('loyalty_reward');
      expect(result.finalPrice).toBe(0);
      expect(result.discountAmount).toBe(600);
    });

    it('applies loyalty flat discount reward up to service price', () => {
      const result = calculateBookingPrice({
        servicePrice: 400,
        serviceId: 'srv-haircut',
        loyaltyReward: {
          isEligible: true,
          type: 'flat_discount',
          value: 150,
          stampsToRedeem: 10,
        },
      });

      expect(result.appliedBenefitType).toBe('loyalty_reward');
      expect(result.discountAmount).toBe(150);
      expect(result.finalPrice).toBe(250);
    });
  });

  describe('Fallback to Standard / Offer Price', () => {
    it('applies standard offer when no package or membership is provided', () => {
      const result = calculateBookingPrice({
        servicePrice: 1000,
        serviceId: 'srv-haircut',
        offer: {
          id: 'off-1',
          isActive: true,
          type: 'flat',
          value: 200,
          promoCode: 'FESTIVE200',
        },
      });

      expect(result.appliedBenefitType).toBe('offer');
      expect(result.discountAmount).toBe(200);
      expect(result.finalPrice).toBe(800);
    });

    it('returns full base price when no benefits or offers are provided', () => {
      const result = calculateBookingPrice({
        servicePrice: 450,
        serviceId: 'srv-shave',
      });

      expect(result.appliedBenefitType).toBe('none');
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(450);
    });
  });
});

