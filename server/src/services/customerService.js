import mongoose from 'mongoose';
import { Customer } from '../models/Customer.js';
import { Booking } from '../models/Booking.js';
import { Settings } from '../models/Settings.js';
import { normalizeIndianPhone } from '../utils/whatsapp.js';

/**
 * Normalizes phone or extracts clean digits
 * @param {string} phone
 * @returns {string}
 */
export function getCanonicalPhone(phone) {
  if (!phone) return '';
  const normalized = normalizeIndianPhone(phone);
  if (normalized) return normalized;
  // Fallback: strip all non-digits
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Find or create a customer record by canonical phone number
 * @param {Object} params
 * @param {string} params.phone
 * @param {string} params.name
 * @param {string} [params.email]
 * @param {boolean} [params.whatsappConsent]
 * @param {string} [params.preferredBarberId]
 * @param {string} [params.preferredServiceId]
 * @returns {Promise<Customer>}
 */
export async function findOrCreateCustomer({
  phone,
  name,
  email,
  whatsappConsent,
  preferredBarberId,
  preferredServiceId,
}) {
  const canonicalPhone = getCanonicalPhone(phone);
  if (!canonicalPhone) {
    throw new Error('Valid phone number is required to resolve customer');
  }

  let customer = await Customer.findOne({
    $or: [{ phone: canonicalPhone }, { phone: phone.trim() }],
    isDeleted: false,
  });

  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (customer) {
    let modified = false;

    // Fill in name if customer has generic or empty name
    if ((!customer.name || customer.name === 'Guest') && cleanName) {
      customer.name = cleanName;
      modified = true;
    }

    // Fill in email if previously missing
    if (!customer.email && cleanEmail) {
      customer.email = cleanEmail;
      modified = true;
    }

    // Update WhatsApp consent if opted-in
    if (whatsappConsent && !customer.whatsappConsent) {
      customer.whatsappConsent = true;
      modified = true;
    }

    // Attach preferred barber if not set
    if (!customer.preferredBarberId && preferredBarberId) {
      customer.preferredBarberId = preferredBarberId;
      modified = true;
    }

    // Attach preferred service if not set
    if (
      preferredServiceId &&
      (!customer.preferredServiceIds || !customer.preferredServiceIds.includes(preferredServiceId))
    ) {
      customer.preferredServiceIds = customer.preferredServiceIds || [];
      customer.preferredServiceIds.push(preferredServiceId);
      modified = true;
    }

    if (modified) {
      await customer.save();
    }

    return customer;
  }

  // Create new customer
  customer = await Customer.create({
    name: cleanName || 'Guest Customer',
    phone: canonicalPhone,
    email: cleanEmail || '',
    whatsappConsent: Boolean(whatsappConsent),
    preferredBarberId: preferredBarberId || null,
    preferredServiceIds: preferredServiceId ? [preferredServiceId] : [],
    stats: {
      totalVisits: 0,
      completedVisits: 0,
      cancelledCount: 0,
      noShowCount: 0,
      lastVisitAt: null,
      totalSpent: 0,
    },
  });

  return customer;
}

/**
 * Recalculate customer statistics from all linked bookings
 * @param {string|ObjectId} customerId
 * @returns {Promise<Customer|null>}
 */
export async function recalculateCustomerStats(customerId) {
  if (!customerId) return null;

  const customer = await Customer.findById(customerId);
  if (!customer || customer.isDeleted) return null;

  // Find all active bookings linked to this customer
  const bookings = await Booking.find({
    $or: [{ customerId: customer._id }, { phone: customer.phone }],
  }).lean();

  const totalVisits = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const completedVisits = completedBookings.length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
  const noShowCount = bookings.filter((b) => b.status === 'no_show').length;

  const totalSpent = completedBookings.reduce((sum, b) => {
    return sum + (Number(b.priceAtBooking) || 0);
  }, 0);

  // Compute last visit date: latest completed booking date, or null
  let lastVisitAt = null;
  if (completedBookings.length > 0) {
    const sortedCompleted = [...completedBookings].sort((a, b) => {
      const aTime = `${a.date || ''} ${a.startTime || ''}`;
      const bTime = `${b.date || ''} ${b.startTime || ''}`;
      return bTime.localeCompare(aTime);
    });

    const latest = sortedCompleted[0];
    if (latest.date) {
      // Create date object
      const parsed = new Date(`${latest.date}T12:00:00+05:30`);
      if (!isNaN(parsed.getTime())) {
        lastVisitAt = parsed;
      }
    }
  }

  customer.stats = {
    totalVisits,
    completedVisits,
    cancelledCount,
    noShowCount,
    lastVisitAt,
    totalSpent,
  };

  // Check no-show threshold rule
  const settings = await Settings.findOne().lean();
  const threshold = settings?.policies?.noShowThreshold ?? 3;

  if (noShowCount >= threshold) {
    customer.isFlagged = true;
    customer.flagReason = 'Repeated no-shows';
  } else if (customer.flagReason === 'Repeated no-shows' && noShowCount < threshold) {
    customer.isFlagged = false;
    customer.flagReason = '';
  }

  await customer.save();
  return customer;
}

/**
 * Anonymize customer data (Privacy/Right to be Forgotten)
 * @param {string|ObjectId} customerId
 * @returns {Promise<Customer|null>}
 */
export async function anonymizeCustomer(customerId) {
  if (!customerId) return null;

  const customer = await Customer.findById(customerId);
  if (!customer) return null;

  const anonId = customer._id.toString().slice(-6).toUpperCase();
  const anonPhone = `anon-${customer._id.toString().slice(-8)}`;

  // Anonymize all linked bookings
  await Booking.updateMany(
    { $or: [{ customerId: customer._id }, { phone: customer.phone }] },
    {
      $set: {
        customerName: 'Anonymized Customer',
        phone: '0000000000',
        email: '',
        notes: '',
      },
    }
  );

  // Anonymize customer record
  customer.name = `Anonymized Customer ${anonId}`;
  customer.phone = anonPhone;
  customer.email = '';
  customer.notes = '';
  customer.tags = [];
  customer.preferredBarberId = null;
  customer.preferredServiceIds = [];
  customer.isFlagged = false;
  customer.flagReason = '';
  customer.isDeleted = true;
  customer.deletedAt = new Date();

  await customer.save();
  return customer;
}
