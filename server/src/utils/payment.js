import crypto from 'node:crypto';
import { timeToMinutes } from './slots.js';

/**
 * Calculates whether an online payment or deposit is required for a booking,
 * and determines the exact amount in rupees and paise.
 *
 * @param {Object} options
 * @param {Object} [options.service] - Service entity or plain object
 * @param {number} options.priceAtBooking - Net price after offer discounts (in ₹)
 * @param {Object} [options.settings] - Global settings document
 * @returns {{
 *   required: boolean,
 *   amount: number,
 *   balanceDue: number,
 *   amountPaise: number,
 *   balanceDuePaise: number,
 *   purpose: 'none' | 'deposit' | 'full',
 *   reason?: string
 * }}
 */
export function calculateDepositRequired({ service, priceAtBooking = 0, settings = {} }) {
  const paymentSettings = settings?.paymentSettings || {};
  const isEnabled = Boolean(paymentSettings.paymentsEnabled);
  const paymentMode = paymentSettings.paymentMode || 'none';

  // 1. Check if online payments are enabled globally
  if (!isEnabled || paymentMode === 'none') {
    return {
      required: false,
      amount: 0,
      balanceDue: priceAtBooking,
      amountPaise: 0,
      balanceDuePaise: Math.round(priceAtBooking * 100),
      purpose: 'none',
      reason: 'payments_disabled',
    };
  }

  // 2. Check per-service deposit override ('inherit', 'yes', 'no')
  const serviceOverride = service?.requiresDeposit || 'inherit';
  if (serviceOverride === 'no') {
    return {
      required: false,
      amount: 0,
      balanceDue: priceAtBooking,
      amountPaise: 0,
      balanceDuePaise: Math.round(priceAtBooking * 100),
      purpose: 'none',
      reason: 'service_override_no',
    };
  }

  // 3. Check minimum service price threshold
  const minPrice = Number(paymentSettings.minimumServicePrice) || 0;
  if (priceAtBooking < minPrice) {
    return {
      required: false,
      amount: 0,
      balanceDue: priceAtBooking,
      amountPaise: 0,
      balanceDuePaise: Math.round(priceAtBooking * 100),
      purpose: 'none',
      reason: 'below_minimum_price',
    };
  }

  // 4. Calculate amount based on paymentMode ('full' vs 'deposit')
  if (paymentMode === 'full') {
    const amount = Math.max(0, priceAtBooking);
    return {
      required: amount > 0,
      amount,
      balanceDue: 0,
      amountPaise: Math.round(amount * 100),
      balanceDuePaise: 0,
      purpose: amount > 0 ? 'full' : 'none',
    };
  }

  // Deposit mode ('deposit')
  const depositType = paymentSettings.depositType || 'percent';
  const depositValue = Number(paymentSettings.depositValue ?? 20);

  let depositAmount = 0;
  if (depositType === 'percent') {
    depositAmount = Math.round((priceAtBooking * depositValue) / 100);
  } else {
    // flat amount in ₹
    depositAmount = Math.min(priceAtBooking, Math.max(0, depositValue));
  }

  // Bound deposit between 0 and priceAtBooking
  depositAmount = Math.min(priceAtBooking, Math.max(0, depositAmount));
  const balanceDue = Math.max(0, priceAtBooking - depositAmount);

  if (depositAmount <= 0) {
    return {
      required: false,
      amount: 0,
      balanceDue: priceAtBooking,
      amountPaise: 0,
      balanceDuePaise: Math.round(priceAtBooking * 100),
      purpose: 'none',
      reason: 'calculated_zero',
    };
  }

  return {
    required: true,
    amount: depositAmount,
    balanceDue,
    amountPaise: Math.round(depositAmount * 100),
    balanceDuePaise: Math.round(balanceDue * 100),
    purpose: depositAmount >= priceAtBooking ? 'full' : 'deposit',
  };
}

/**
 * Cryptographically verifies Razorpay payment signature using timingSafeEqual
 *
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.paymentId
 * @param {string} params.signature
 * @param {string} params.secret
 * @returns {boolean}
 */
export function verifyRazorpayPaymentSignature({ orderId, paymentId, signature, secret }) {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

/**
 * Cryptographically verifies Razorpay webhook signature
 *
 * @param {Object} params
 * @param {string|Buffer} params.rawBody
 * @param {string} params.signature
 * @param {string} params.secret
 * @returns {boolean}
 */
export function verifyRazorpayWebhookSignature({ rawBody, signature, secret }) {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    if (Buffer.isBuffer(rawBody)) {
      hmac.update(rawBody);
    } else {
      hmac.update(String(rawBody), 'utf8');
    }
    const expected = hmac.digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

/**
 * Determines whether a booking cancellation is eligible for a full deposit refund
 * based on the configured refundPolicyHours and appointment start time.
 *
 * @param {Object} options
 * @param {Object} options.booking - Booking document/object with date & startTime
 * @param {Object} [options.settings] - Settings document
 * @param {Date|string|number} [options.customNow] - Reference date
 * @returns {{
 *   eligible: boolean,
 *   refundAmount: number,
 *   deadline: string,
 *   hoursBeforeAppointment: number
 * }}
 */
export function checkRefundEligibility({ booking, settings = {}, customNow = new Date() }) {
  if (!booking?.date || !booking?.startTime) {
    return {
      eligible: false,
      refundAmount: 0,
      deadline: '',
      hoursBeforeAppointment: 0,
    };
  }

  // Parse booking date and time in Asia/Kolkata context
  const [year, month, day] = booking.date.split('-').map((n) => parseInt(n, 10));
  const startMinutes = timeToMinutes(booking.startTime);
  const startHour = Math.floor(startMinutes / 60);
  const startMinute = startMinutes % 60;

  // Asia/Kolkata is UTC+5:30 (330 minutes)
  const appointmentUtc = Date.UTC(year, month - 1, day, startHour, startMinute) - 330 * 60 * 1000;

  const policyHours = Number(settings?.paymentSettings?.refundPolicyHours ?? 2);
  const deadlineMs = appointmentUtc - policyHours * 3600 * 1000;

  const nowMs = new Date(customNow).getTime();
  const hoursBefore = (appointmentUtc - nowMs) / (1000 * 3600);
  const eligible = nowMs <= deadlineMs;

  const amountPaid = Number(booking.amountPaid) || 0;

  return {
    eligible,
    refundAmount: eligible ? amountPaid : 0,
    deadline: new Date(deadlineMs).toISOString(),
    hoursBeforeAppointment: Math.round(hoursBefore * 10) / 10,
  };
}

