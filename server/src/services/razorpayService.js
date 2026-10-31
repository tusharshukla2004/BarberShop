import { env } from '../config/env.js';

/**
 * Checks if the server is in test mode or using placeholder keys
 * @returns {boolean}
 */
export function isRazorpayMockMode() {
  return (
    env.NODE_ENV === 'test' ||
    !env.RAZORPAY_KEY_ID ||
    env.RAZORPAY_KEY_ID.startsWith('rzp_test_placeholder') ||
    env.RAZORPAY_KEY_SECRET.startsWith('rzp_test_placeholder')
  );
}

/**
 * Creates an order in Razorpay
 *
 * @param {Object} params
 * @param {number} params.amountPaise - Amount in paise (e.g. 50000 = ₹500)
 * @param {string} params.receipt - Internal reference (e.g. booking ID)
 * @param {Object} [params.notes]
 * @param {string} [params.currency='INR']
 * @returns {Promise<Object>}
 */
export async function createRazorpayOrder({ amountPaise, receipt, notes = {}, currency = 'INR' }) {
  if (isRazorpayMockMode()) {
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockOrderId,
      entity: 'order',
      amount: amountPaise,
      amount_paid: 0,
      amount_due: amountPaise,
      currency,
      receipt: String(receipt),
      status: 'created',
      notes,
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  const authHeader = `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`;
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt: String(receipt).slice(0, 40),
      notes,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.description || `Razorpay order creation failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches payment details from Razorpay
 *
 * @param {string} paymentId
 * @returns {Promise<Object>}
 */
export async function fetchRazorpayPayment(paymentId) {
  if (isRazorpayMockMode()) {
    return {
      id: paymentId,
      entity: 'payment',
      amount: 10000,
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      captured: true,
      email: 'client@example.com',
      contact: '+919876543210',
    };
  }

  const authHeader = `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`;
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.description || `Failed to fetch Razorpay payment: ${response.status}`);
  }

  return response.json();
}

/**
 * Creates a refund in Razorpay
 *
 * @param {Object} params
 * @param {string} params.paymentId
 * @param {number} [params.amountPaise] - Optional partial refund in paise
 * @param {Object} [params.notes]
 * @returns {Promise<Object>}
 */
export async function createRazorpayRefund({ paymentId, amountPaise, notes = {} }) {
  if (isRazorpayMockMode()) {
    const mockRefundId = `rfnd_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockRefundId,
      entity: 'refund',
      payment_id: paymentId,
      amount: amountPaise,
      currency: 'INR',
      status: 'processed',
      notes,
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  const authHeader = `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`;
  const body = { notes };
  if (typeof amountPaise === 'number' && amountPaise > 0) {
    body.amount = amountPaise;
  }

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.description || `Razorpay refund failed: ${response.status}`);
  }

  return response.json();
}
