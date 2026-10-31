/**
 * @file server/src/utils/pricing.js
 * @description Pure functions for Benefit Precedence, Non-Stacking Rules, and Price Calculations.
 *
 * PRECEDENCE RULES:
 * 1. Package Session (Priority 1):
 *    - An active, non-expired CustomerPackage covering the target service.
 *    - Effect: Sets booking price to ₹0.
 *    - Non-stacking: Package usage overrides all other discounts (membership discounts, promo offers).
 *
 * 2. Membership Plan Benefit (Priority 2):
 *    - An active, non-expired CustomerMembership.
 *    - If benefit is `free_service` for this service: price becomes ₹0.
 *    - If benefit is `discount_percent`: percentage discount is calculated on service price.
 *    - Non-stacking: Membership discounts do NOT stack with promotional offers.
 *
 * 3. Offer / Promo Code (Priority 3):
 *    - Validated promotional offer code.
 *    - Flat or percentage discount on original service price.
 *
 * 4. Loyalty Reward Redemption:
 *    - Applied when customer has accumulated enough stamps/points (>= stampsForReward).
 *    - `free_service`: Sets price to ₹0.
 *    - `flat_discount`: Deducts ₹ value from remaining price (floor at 0).
 *    - `percent_discount`: Deducts % value from remaining price.
 */

/**
 * Calculates final booking price and identifies which benefit type takes precedence.
 *
 * @param {Object} params
 * @param {number} params.servicePrice - Base price of the service (in ₹)
 * @param {string} params.serviceId - Service identifier
 * @param {Object|null} [params.customerPackage] - Selected or active CustomerPackage
 * @param {Object|null} [params.customerMembership] - Active CustomerMembership
 * @param {Object|null} [params.offer] - Validated Offer object
 * @param {Object|null} [params.loyaltyReward] - Validated Loyalty Reward redemption request
 * @param {boolean} [params.allowStacking=false] - Whether membership and offers can stack
 * @returns {{
 *   originalPrice: number,
 *   discountAmount: number,
 *   finalPrice: number,
 *   appliedBenefitType: 'none' | 'package' | 'membership' | 'loyalty_reward' | 'offer',
 *   benefitDetails: Object
 * }}
 */
export function calculateBookingPrice({
  servicePrice = 0,
  serviceId,
  customerPackage = null,
  customerMembership = null,
  offer = null,
  loyaltyReward = null,
  allowStacking = false,
}) {
  const originalPrice = Math.max(0, Number(servicePrice) || 0);

  // 1. Package Session (Top Priority)
  if (customerPackage && customerPackage.status === 'active') {
    const isServiceCovered =
      !Array.isArray(customerPackage.serviceIds) ||
      customerPackage.serviceIds.length === 0 ||
      customerPackage.serviceIds.includes(String(serviceId));

    const sessionsRemaining =
      (customerPackage.sessionsTotal || 0) - (customerPackage.sessionsUsed || 0);

    const isNotExpired =
      !customerPackage.expiresAt || new Date(customerPackage.expiresAt) > new Date();

    if (isServiceCovered && sessionsRemaining > 0 && isNotExpired) {
      return {
        originalPrice,
        discountAmount: originalPrice,
        finalPrice: 0,
        appliedBenefitType: 'package',
        benefitDetails: {
          packageId: customerPackage.packageId,
          customerPackageId: customerPackage.id || customerPackage._id,
          sessionsRemainingAfterUse: sessionsRemaining - 1,
          description: 'Package session applied (100% discount)',
        },
      };
    }
  }

  // 2. Membership Benefits (Second Priority)
  if (customerMembership && customerMembership.status === 'active') {
    const isNotExpired =
      !customerMembership.endsAt || new Date(customerMembership.endsAt) > new Date();

    if (isNotExpired && Array.isArray(customerMembership.benefits)) {
      // Check for free_service benefit first
      const freeBenefit = customerMembership.benefits.find(
        (b) =>
          b.type === 'free_service' &&
          (!b.serviceIds || b.serviceIds.length === 0 || b.serviceIds.includes(String(serviceId)))
      );

      if (freeBenefit) {
        return {
          originalPrice,
          discountAmount: originalPrice,
          finalPrice: 0,
          appliedBenefitType: 'membership',
          benefitDetails: {
            membershipId: customerMembership.id || customerMembership._id,
            benefitType: 'free_service',
            description: 'VIP Membership free service benefit',
          },
        };
      }

      // Check for discount_percent benefit
      const discountBenefit = customerMembership.benefits.find(
        (b) =>
          b.type === 'discount_percent' &&
          (!b.serviceIds || b.serviceIds.length === 0 || b.serviceIds.includes(String(serviceId)))
      );

      if (discountBenefit && discountBenefit.value > 0) {
        const pct = Math.min(100, Math.max(0, discountBenefit.value));
        const discountAmount = Math.round((originalPrice * pct) / 100);
        const finalPrice = Math.max(0, originalPrice - discountAmount);

        return {
          originalPrice,
          discountAmount,
          finalPrice,
          appliedBenefitType: 'membership',
          benefitDetails: {
            membershipId: customerMembership.id || customerMembership._id,
            benefitType: 'discount_percent',
            percent: pct,
            description: `${pct}% VIP Membership discount`,
          },
        };
      }
    }
  }

  // 3. Loyalty Reward Redemption
  if (loyaltyReward && loyaltyReward.isEligible) {
    if (loyaltyReward.type === 'free_service') {
      return {
        originalPrice,
        discountAmount: originalPrice,
        finalPrice: 0,
        appliedBenefitType: 'loyalty_reward',
        benefitDetails: {
          rewardType: 'free_service',
          stampsRedeemed: loyaltyReward.stampsToRedeem || 10,
          description: 'Loyalty reward: free service redeemed',
        },
      };
    }

    if (loyaltyReward.type === 'flat_discount') {
      const val = Math.max(0, Number(loyaltyReward.value) || 0);
      const discountAmount = Math.min(originalPrice, val);
      return {
        originalPrice,
        discountAmount,
        finalPrice: Math.max(0, originalPrice - discountAmount),
        appliedBenefitType: 'loyalty_reward',
        benefitDetails: {
          rewardType: 'flat_discount',
          stampsRedeemed: loyaltyReward.stampsToRedeem || 10,
          discountValue: val,
          description: `₹${val} Loyalty reward discount`,
        },
      };
    }

    if (loyaltyReward.type === 'percent_discount') {
      const pct = Math.min(100, Math.max(0, Number(loyaltyReward.value) || 0));
      const discountAmount = Math.round((originalPrice * pct) / 100);
      return {
        originalPrice,
        discountAmount,
        finalPrice: Math.max(0, originalPrice - discountAmount),
        appliedBenefitType: 'loyalty_reward',
        benefitDetails: {
          rewardType: 'percent_discount',
          stampsRedeemed: loyaltyReward.stampsToRedeem || 10,
          percent: pct,
          description: `${pct}% Loyalty reward discount`,
        },
      };
    }
  }

  // 4. Offer / Promo Code (Third Priority, no stacking with membership by default)
  if (offer && offer.isActive) {
    let discountAmount = 0;
    if (offer.type === 'percent') {
      const pct = Math.min(100, Math.max(0, Number(offer.value) || 0));
      discountAmount = Math.round((originalPrice * pct) / 100);
    } else if (offer.type === 'flat') {
      const flat = Math.max(0, Number(offer.value) || 0);
      discountAmount = Math.min(originalPrice, flat);
    } else if (offer.type === 'free_addon' || offer.type === 'combo') {
      const val = Math.max(0, Number(offer.value) || 0);
      discountAmount = Math.min(originalPrice, val);
    }

    return {
      originalPrice,
      discountAmount,
      finalPrice: Math.max(0, originalPrice - discountAmount),
      appliedBenefitType: 'offer',
      benefitDetails: {
        offerId: offer.id || offer._id,
        promoCode: offer.promoCode || '',
        description: `Offer promo code: ${offer.promoCode || 'PROMO'}`,
      },
    };
  }

  // No benefits applied
  return {
    originalPrice,
    discountAmount: 0,
    finalPrice: originalPrice,
    appliedBenefitType: 'none',
    benefitDetails: {},
  };
}

