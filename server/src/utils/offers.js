/**
 * @file server/src/utils/offers.js
 * @description Pure functions for offer validation, promo code resolution, and discount calculation.
 */

/**
 * Validates an offer against booking parameters and calculates exact discount
 *
 * @param {Object} params
 * @param {Object} params.offer - Mongoose or plain object offer doc
 * @param {Array<string>} params.serviceIds - Array of service IDs in the cart/booking
 * @param {number} params.totalPrice - Gross booking price
 * @param {string} [params.dateStr] - YYYY-MM-DD
 * @param {Date} [params.nowDate] - Current timestamp (default Date.now())
 * @returns {{
 *   isValid: boolean,
 *   reason?: string,
 *   discountAmount: number,
 *   finalPrice: number,
 *   originalPrice: number,
 *   offer?: Object
 * }}
 */
export function validateAndCalculateDiscount({
  offer,
  serviceIds = [],
  totalPrice = 0,
  dateStr = '',
  nowDate = new Date(),
}) {
  if (!offer) {
    return {
      valid: false,
      isValid: false,
      reason: 'Offer or promo code not found.',
      discountAmount: 0,
      finalPrice: totalPrice,
      originalPrice: totalPrice,
    };
  }

  // 1. Active check
  if (!offer.isActive) {
    return {
      isValid: false,
      reason: 'This offer is currently inactive.',
      discountAmount: 0,
      finalPrice: totalPrice,
      originalPrice: totalPrice,
    };
  }

  // 2. Window check (startsAt <= now <= endsAt)
  const nowTime = nowDate.getTime();
  const startsAtTime = new Date(offer.startsAt).getTime();
  const endsAtTime = new Date(offer.endsAt).getTime();

  if (nowTime < startsAtTime) {
    return {
      isValid: false,
      reason: 'This offer has not started yet.',
      discountAmount: 0,
      finalPrice: totalPrice,
      originalPrice: totalPrice,
    };
  }

  if (nowTime > endsAtTime) {
    return {
      isValid: false,
      reason: 'This offer has expired.',
      discountAmount: 0,
      finalPrice: totalPrice,
      originalPrice: totalPrice,
    };
  }

  // 3. Usage limit check
  if (
    typeof offer.usageLimit === 'number' &&
    offer.usageLimit > 0 &&
    typeof offer.usedCount === 'number' &&
    offer.usedCount >= offer.usageLimit
  ) {
    return {
      isValid: false,
      reason: 'This promo code has reached its maximum usage limit.',
      discountAmount: 0,
      finalPrice: totalPrice,
      originalPrice: totalPrice,
    };
  }

  // 4. Day of week check (if specified)
  if (Array.isArray(offer.daysOfWeek) && offer.daysOfWeek.length > 0 && dateStr) {
    const bookingDate = new Date(`${dateStr}T00:00:00Z`);
    const dayOfWeek = bookingDate.getUTCDay(); // 0 = Sun, 1 = Mon ...
    if (!offer.daysOfWeek.includes(dayOfWeek)) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const validNames = offer.daysOfWeek.map((d) => dayNames[d]).join(', ');
      return {
        isValid: false,
        reason: `This offer is only valid on: ${validNames}.`,
        discountAmount: 0,
        finalPrice: totalPrice,
        originalPrice: totalPrice,
      };
    }
  }

  // 5. Service applicability check
  if (Array.isArray(offer.appliesToServiceIds) && offer.appliesToServiceIds.length > 0) {
    const hasMatchingService = serviceIds.some((sId) => offer.appliesToServiceIds.includes(sId));
    if (!hasMatchingService) {
      return {
        isValid: false,
        reason: 'This offer does not apply to any of the selected services.',
        discountAmount: 0,
        finalPrice: totalPrice,
        originalPrice: totalPrice,
      };
    }
  }

  // 6. Discount calculation
  let discountAmount = 0;
  const numericValue = Math.max(0, Number(offer.value) || 0);

  if (offer.type === 'percent') {
    discountAmount = Math.round((totalPrice * numericValue) / 100);
  } else if (offer.type === 'flat') {
    discountAmount = Math.min(totalPrice, numericValue);
  } else if (offer.type === 'free_addon' || offer.type === 'combo') {
    discountAmount = Math.min(totalPrice, numericValue);
  }

  // Guard: discount can never exceed total price or be below 0
  discountAmount = Math.max(0, Math.min(totalPrice, discountAmount));
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  return {
    valid: true,
    isValid: true,
    discountAmount,
    finalPrice,
    originalPrice: totalPrice,
    offer: {
      id: offer.id || offer._id?.toString(),
      title: offer.title,
      type: offer.type,
      value: offer.value,
      promoCode: offer.promoCode,
    },
  };
}
