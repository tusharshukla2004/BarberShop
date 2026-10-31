/**
 * @file server/src/reports/definitions.js
 * @description Centralized Business Metric Definitions and Rules for Analytics & Reporting.
 * Every calculation and aggregation across the platform adheres strictly to these standardized rules.
 */

/**
 * Metric 1: Completed Booking / Service
 * - What counts: Any appointment or walk-in where the service was successfully delivered.
 * - Condition: `booking.status === 'completed'`
 * - Note: Both scheduled appointments (`source: 'appointment'`) and walk-ins (`source: 'walk_in'`) count.
 *   Pending, confirmed, cancelled, and no_show bookings are excluded.
 *
 * @param {Object} booking
 * @returns {boolean}
 */
export function isCompletedBooking(booking) {
  return booking && booking.status === 'completed';
}

/**
 * Metric 2: Gross Realized Revenue
 * - How calculated: The sum of `priceAtBooking` for all completed bookings and completed walk-in queue entries.
 * - Fallback: If `priceAtBooking` is absent or 0 on legacy records, falls back to the associated service price.
 * - Discarded: Cancelled, pending, and no-show sessions contribute zero revenue.
 *
 * @param {Array<Object>} completedBookings
 * @returns {number} Realized revenue in INR (₹)
 */
export function calculateRevenue(completedBookings = []) {
  return completedBookings.reduce((sum, b) => {
    if (b.status === 'completed') {
      const price = typeof b.priceAtBooking === 'number' && b.priceAtBooking >= 0
        ? b.priceAtBooking
        : (b.servicePrice || 0);
      return sum + price;
    }
    return sum;
  }, 0);
}

/**
 * Metric 3: No-Show Rate
 * - How calculated: The proportion of non-cancelled bookings where the client failed to appear.
 * - Formula: `no_shows / (completed + no_shows)`
 * - Special handling: If `(completed + no_shows) === 0`, rate is `0.0` (prevents division by zero / NaN).
 * - Note: Cancelled bookings (`status: 'cancelled'`) are excluded from both numerator and denominator
 *   because they provided advance notice and freed the barber's calendar.
 *
 * @param {number} noShowCount - Number of bookings with status === 'no_show'
 * @param {number} completedCount - Number of bookings with status === 'completed'
 * @returns {number} Percentage between 0 and 100 (rounded to 1 decimal place)
 */
export function calculateNoShowRate(noShowCount = 0, completedCount = 0) {
  const totalRelevant = completedCount + noShowCount;
  if (totalRelevant <= 0) return 0;
  const rate = (noShowCount / totalRelevant) * 100;
  return Math.round(rate * 10) / 10;
}

/**
 * Metric 4: Repeat Customer Identification & Rate
 * - Definition: A customer is classified as 'repeat' / 'returning' if they have more than 1 completed visit,
 *   or if they completed a booking within the window having visited previously.
 * - Formula: `repeat_customers / total_distinct_customers_in_period * 100`
 * - Fallback: 0 if total distinct customers === 0.
 *
 * @param {number} repeatCustomerCount
 * @param {number} totalUniqueCustomers
 * @returns {number} Percentage between 0 and 100
 */
export function calculateRepeatRate(repeatCustomerCount = 0, totalUniqueCustomers = 0) {
  if (totalUniqueCustomers <= 0) return 0;
  const rate = (repeatCustomerCount / totalUniqueCustomers) * 100;
  return Math.round(rate * 10) / 10;
}

/**
 * Metric 5: Percentage Period-over-Period Delta
 * - Calculates growth / contraction percentage compared to the immediately preceding period of equal length.
 * - Formula: `((current - previous) / previous) * 100`
 * - Boundary handling:
 *   - If previous === 0 and current === 0: 0%
 *   - If previous === 0 and current > 0: +100%
 *
 * @param {number} currentVal
 * @param {number} previousVal
 * @returns {number} Delta percentage rounded to 1 decimal place
 */
export function calculatePeriodDelta(currentVal = 0, previousVal = 0) {
  if (previousVal === 0) {
    return currentVal > 0 ? 100 : 0;
  }
  const delta = ((currentVal - previousVal) / previousVal) * 100;
  return Math.round(delta * 10) / 10;
}

/**
 * Metric 6: Booking Sources Breakdown
 * - Categorization:
 *   1. `online_booking`: Web booking wizard initiated by client (`source: 'appointment'` and not kiosk/admin)
 *   2. `walk_in`: Created via queue system / walk-in entry (`source: 'walk_in'`)
 *   3. `admin_created`: Scheduled directly by staff from admin portal (`source: 'admin'`)
 */
/**
 * Metric 7: Payment Breakdown (Online vs Shop vs Pending)
 * - Online: Captured payments collected through Razorpay gateway
 * - Shop: Collected in person at studio (completed booking price minus online deposit)
 * - Pending: Remaining balance due on confirmed/completed bookings
 * - Refunded: Amount returned to customer upon cancellation/admin refund
 *
 * @param {Array<Object>} bookings
 * @param {Array<Object>} payments
 * @returns {{ collectedOnline: number, collectedAtShop: number, pendingBalance: number, refunded: number }}
 */
export function calculatePaymentBreakdown(bookings = [], payments = []) {
  let collectedOnline = 0;
  let refunded = 0;

  payments.forEach((p) => {
    if (p.status === 'captured') {
      collectedOnline += (p.amount || 0) / 100;
    }
    if (p.refundedAmount > 0) {
      refunded += (p.refundedAmount || 0) / 100;
    }
  });

  let collectedAtShop = 0;
  let pendingBalance = 0;

  bookings.forEach((b) => {
    if (b.status === 'completed' || b.status === 'confirmed') {
      pendingBalance += b.balanceDue || 0;
      if (b.status === 'completed' && (!b.balanceDue || b.balanceDue === 0)) {
        const fullPrice = b.priceAtBooking || 0;
        const onlinePaid = b.amountPaid || 0;
        collectedAtShop += Math.max(0, fullPrice - onlinePaid);
      }
    }
  });

  return {
    collectedOnline: Math.max(0, collectedOnline - refunded),
    collectedAtShop,
    pendingBalance,
    refunded,
  };
}

export const BOOKING_SOURCES = ['online_booking', 'walk_in', 'admin_created'];

/**
 * Metric 8: Packages, Memberships & Loyalty Analytics
 * @param {Object} params
 * @param {Array<Object>} [params.customerPackages]
 * @param {Array<Object>} [params.customerMemberships]
 * @param {Array<Object>} [params.loyaltyAccounts]
 * @returns {Object}
 */
export function calculateWalletMetrics({
  customerPackages = [],
  customerMemberships = [],
  loyaltyAccounts = [],
} = {}) {
  let packageSalesCount = customerPackages.length;
  let packageSalesRevenue = 0;
  let sessionRedemptionsCount = 0;
  let outstandingSessionLiability = 0;

  customerPackages.forEach((p) => {
    packageSalesRevenue += p.pricePaid || 0;
    sessionRedemptionsCount += p.sessionsUsed || 0;
    if (p.status === 'active' && (!p.expiresAt || new Date(p.expiresAt) > new Date())) {
      const remaining = Math.max(0, (p.sessionsTotal || 0) - (p.sessionsUsed || 0));
      const unitValue = p.sessionsTotal > 0 ? (p.pricePaid || 0) / p.sessionsTotal : 0;
      outstandingSessionLiability += remaining * unitValue;
    }
  });

  let membershipSalesCount = customerMemberships.length;
  let membershipSalesRevenue = 0;
  customerMemberships.forEach((m) => {
    membershipSalesRevenue += m.pricePaid || 0;
  });

  let loyaltyRewardsGiven = 0;
  loyaltyAccounts.forEach((acc) => {
    if (Array.isArray(acc.history)) {
      acc.history.forEach((h) => {
        if (h.type === 'redeem' && !h.reversed) {
          loyaltyRewardsGiven++;
        }
      });
    }
  });

  return {
    packageSalesCount,
    packageSalesRevenue: Math.round(packageSalesRevenue),
    membershipSalesCount,
    membershipSalesRevenue: Math.round(membershipSalesRevenue),
    sessionRedemptionsCount,
    outstandingSessionLiability: Math.round(outstandingSessionLiability),
    loyaltyRewardsGiven,
  };
}

