import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Customer } from '../models/Customer.js';
import { Package } from '../models/Package.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { CustomerPackage } from '../models/CustomerPackage.js';
import { CustomerMembership } from '../models/CustomerMembership.js';
import { LoyaltyAccount } from '../models/LoyaltyAccount.js';
import { Booking } from '../models/Booking.js';
import { Settings } from '../models/Settings.js';
import { recalculateCustomerStats } from './customerService.js';

/**
 * Sell a prepaid package to a customer
 */
export async function sellPackage({ customerId, packageId, paymentMethod = 'cash', amountPaid }) {
  const pkg = await Package.findById(packageId);
  if (!pkg || !pkg.isActive) {
    throw new Error('Package not found or inactive');
  }

  const customer = await Customer.findById(customerId);
  if (!customer || customer.isDeleted) {
    throw new Error('Customer not found');
  }

  const pricePaid = typeof amountPaid === 'number' && amountPaid >= 0 ? amountPaid : pkg.price;
  const validityDays = pkg.validityDays || 90;
  const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

  const customerPackage = await CustomerPackage.create({
    customerId,
    packageId: pkg._id,
    packageName: pkg.name,
    sessionsTotal: pkg.sessions,
    sessionsUsed: 0,
    pricePaid,
    paymentMethod,
    serviceIds: pkg.serviceIds || [],
    purchasedAt: new Date(),
    expiresAt,
    status: 'active',
    usageLog: [],
  });

  // Track customer spend
  customer.stats.totalSpent = (customer.stats.totalSpent || 0) + pricePaid;
  await customer.save();

  return customerPackage;
}

/**
 * Sell a membership plan to a customer
 */
export async function sellMembership({
  customerId,
  planId,
  paymentMethod = 'cash',
  amountPaid,
}) {
  const plan = await MembershipPlan.findById(planId);
  if (!plan || !plan.isActive) {
    throw new Error('Membership plan not found or inactive');
  }

  const customer = await Customer.findById(customerId);
  if (!customer || customer.isDeleted) {
    throw new Error('Customer not found');
  }

  const pricePaid = typeof amountPaid === 'number' && amountPaid >= 0 ? amountPaid : plan.price;
  const durationDays = plan.durationDays || 30;
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Cancel any prior active memberships
  await CustomerMembership.updateMany(
    { customerId, status: 'active' },
    { status: 'cancelled' }
  );

  const customerMembership = await CustomerMembership.create({
    customerId,
    planId: plan._id,
    planName: plan.name,
    pricePaid,
    paymentMethod,
    benefits: plan.benefits || [],
    startsAt,
    endsAt,
    status: 'active',
    usageLog: [],
  });

  // Track customer spend
  customer.stats.totalSpent = (customer.stats.totalSpent || 0) + pricePaid;
  await customer.save();

  return customerMembership;
}

/**
 * Atomically consumes 1 session from a customer's package
 */
export async function consumePackageSession({
  customerId,
  customerPackageId,
  bookingId = null,
  serviceId = '',
  actor = 'staff',
}) {
  const query = {
    _id: customerPackageId,
    customerId,
    status: 'active',
    expiresAt: { $gt: new Date() },
    $expr: { $lt: ['$sessionsUsed', '$sessionsTotal'] },
  };

  const update = {
    $inc: { sessionsUsed: 1 },
    $push: {
      usageLog: {
        bookingId,
        serviceId,
        usedAt: new Date(),
        actor,
        reversed: false,
      },
    },
  };

  const updatedPackage = await CustomerPackage.findOneAndUpdate(query, update, {
    new: true,
  });

  if (!updatedPackage) {
    throw new Error('Package has no available sessions or has expired/cancelled');
  }

  // If all sessions are consumed, mark as exhausted
  if (updatedPackage.sessionsUsed >= updatedPackage.sessionsTotal) {
    updatedPackage.status = 'exhausted';
    await updatedPackage.save();
  }

  // Update booking if provided
  if (bookingId && mongoose.connection?.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      appliedBenefitType: 'package',
      'appliedBenefitDetails.customerPackageId': updatedPackage._id,
      'appliedBenefitDetails.notes': `Consumed 1 session of ${updatedPackage.packageName?.en || 'Package'}`,
      priceAtBooking: 0,
      discountAmount: 0,
    });
  }

  return updatedPackage;
}

/**
 * Reverse a consumed package session (Owner only)
 */
export async function reversePackageSession({
  customerPackageId,
  bookingId = null,
  reason = 'Admin reversal',
  actor = 'owner',
}) {
  const pkg = await CustomerPackage.findById(customerPackageId);
  if (!pkg) {
    throw new Error('Customer package not found');
  }

  const logEntry = pkg.usageLog
    .slice()
    .reverse()
    .find((l) => (bookingId ? l.bookingId?.toString() === bookingId.toString() : true) && !l.reversed);

  if (!logEntry) {
    throw new Error('No active/unreversed session usage found to reverse');
  }

  logEntry.reversed = true;
  logEntry.reversedAt = new Date();
  logEntry.reversalReason = reason;
  logEntry.reversedBy = actor;

  pkg.sessionsUsed = Math.max(0, pkg.sessionsUsed - 1);
  if (pkg.status === 'exhausted' && pkg.sessionsUsed < pkg.sessionsTotal) {
    pkg.status = 'active';
  }

  await pkg.save();

  // If a booking is associated, revert applied benefit
  if (bookingId && mongoose.connection?.readyState === 1) {
    const booking = await Booking.findById(bookingId);
    if (booking && booking.appliedBenefitType === 'package') {
      booking.appliedBenefitType = 'none';
      booking.priceAtBooking = booking.originalPrice || 0;
      await booking.save();
    }
  }

  return pkg;
}

/**
 * Apply membership benefit logging to customer's active membership
 */
export async function applyMembershipBenefit({
  customerId,
  customerMembershipId,
  bookingId = null,
  serviceId = '',
  discountApplied = 0,
  benefitType = 'discount_percent',
  actor = 'staff',
}) {
  const membership = await CustomerMembership.findOne({
    _id: customerMembershipId,
    customerId,
    status: 'active',
    endsAt: { $gt: new Date() },
  });

  if (!membership) {
    throw new Error('Active membership not found or expired');
  }

  membership.usageLog.push({
    bookingId,
    serviceId,
    benefitType,
    discountApplied,
    usedAt: new Date(),
    actor,
    reversed: false,
  });

  await membership.save();

  if (bookingId && mongoose.connection?.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      appliedBenefitType: 'membership',
      'appliedBenefitDetails.customerMembershipId': membership._id,
      'appliedBenefitDetails.notes': `VIP Membership benefit: ${benefitType}`,
    });
  }

  return membership;
}

/**
 * Reverse a membership benefit (Owner only)
 */
export async function reverseMembershipBenefit({
  customerMembershipId,
  bookingId = null,
  reason = 'Admin reversal',
  actor = 'owner',
}) {
  const membership = await CustomerMembership.findById(customerMembershipId);
  if (!membership) {
    throw new Error('Membership not found');
  }

  const logEntry = membership.usageLog
    .slice()
    .reverse()
    .find((l) => (bookingId ? l.bookingId?.toString() === bookingId.toString() : true) && !l.reversed);

  if (!logEntry) {
    throw new Error('No unreversed membership benefit usage found');
  }

  logEntry.reversed = true;
  logEntry.reversedAt = new Date();
  logEntry.reversalReason = reason;
  logEntry.reversedBy = actor;

  await membership.save();

  if (bookingId && mongoose.connection?.readyState === 1) {
    const booking = await Booking.findById(bookingId);
    if (booking && booking.appliedBenefitType === 'membership') {
      booking.appliedBenefitType = 'none';
      booking.discountAmount = 0;
      booking.priceAtBooking = booking.originalPrice || 0;
      await booking.save();
    }
  }

  return membership;
}

/**
 * Find or create customer's loyalty account
 */
export async function getOrCreateLoyaltyAccount(customerId) {
  let account = await LoyaltyAccount.findOne({ customerId });
  if (!account) {
    account = await LoyaltyAccount.create({
      customerId,
      balance: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      history: [],
    });
  }
  return account;
}

/**
 * Add loyalty stamps upon booking completion
 */
export async function addLoyaltyStamps({
  customerId,
  bookingId = null,
  stampsCount = 1,
  notes = 'Visit completed',
  actor = 'system',
}) {
  const account = await getOrCreateLoyaltyAccount(customerId);

  const stampsToAdd = Math.max(1, Number(stampsCount) || 1);
  account.balance = (account.balance || 0) + stampsToAdd;
  account.totalEarned = (account.totalEarned || 0) + stampsToAdd;

  account.history.push({
    type: 'earn',
    amount: stampsToAdd,
    bookingId,
    notes,
    actor,
    createdAt: new Date(),
    reversed: false,
  });

  await account.save();
  return account;
}

/**
 * Redeem loyalty reward when threshold reached
 */
export async function redeemLoyaltyReward({
  customerId,
  bookingId = null,
  stampsToRedeem = 10,
  notes = 'Loyalty Reward Redeemed',
  actor = 'staff',
}) {
  const account = await getOrCreateLoyaltyAccount(customerId);

  const needed = Math.max(1, Number(stampsToRedeem) || 10);
  if ((account.balance || 0) < needed) {
    throw new Error(`Insufficient loyalty balance. Has ${account.balance}, needs ${needed}`);
  }

  account.balance -= needed;
  account.totalRedeemed = (account.totalRedeemed || 0) + needed;

  account.history.push({
    type: 'redeem',
    amount: needed,
    bookingId,
    notes,
    actor,
    createdAt: new Date(),
    reversed: false,
  });

  await account.save();

  if (bookingId && mongoose.connection?.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      appliedBenefitType: 'loyalty_reward',
      'appliedBenefitDetails.notes': notes,
    });
  }

  return account;
}

/**
 * Reverse a loyalty history entry (Owner only)
 */
export async function reverseLoyaltyEntry({
  customerId,
  historyId,
  reason = 'Admin reversal',
  actor = 'owner',
}) {
  const account = await getOrCreateLoyaltyAccount(customerId);

  const entry = account.history.id(historyId);
  if (!entry) {
    throw new Error('Loyalty entry not found');
  }
  if (entry.reversed) {
    throw new Error('Entry is already reversed');
  }

  entry.reversed = true;
  entry.reversedAt = new Date();
  entry.reversalReason = reason;
  entry.reversedBy = actor;

  if (entry.type === 'earn') {
    account.balance = Math.max(0, account.balance - entry.amount);
    account.totalEarned = Math.max(0, account.totalEarned - entry.amount);
  } else if (entry.type === 'redeem') {
    account.balance += entry.amount;
    account.totalRedeemed = Math.max(0, account.totalRedeemed - entry.amount);
  }

  await account.save();
  return account;
}

/**
 * Generate or regenerate unguessable wallet token
 */
export async function generateWalletToken(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const token = crypto.randomBytes(24).toString('hex');
  customer.walletToken = token;
  await customer.save();

  return token;
}

/**
 * Revoke public wallet token
 */
export async function revokeWalletToken(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  customer.walletToken = null;
  await customer.save();
}

/**
 * Public wallet endpoint data resolver (Sanitized, NO private notes or phone)
 */
export async function getPublicWalletData(token) {
  if (!token || typeof token !== 'string') return null;

  const customer = await Customer.findOne({
    walletToken: token,
    isDeleted: false,
  }).lean();

  if (!customer) return null;

  const packages = await CustomerPackage.find({
    customerId: customer._id,
    status: { $in: ['active', 'exhausted'] },
  })
    .sort({ createdAt: -1 })
    .lean();

  const membership = await CustomerMembership.findOne({
    customerId: customer._id,
    status: 'active',
  }).lean();

  const loyalty = await LoyaltyAccount.findOne({
    customerId: customer._id,
  }).lean();

  const settings = await Settings.findOne().lean();
  const loyaltySettings = settings?.loyaltySettings || {};

  const stampsForReward = loyaltySettings.stampsForReward || 10;
  const currentBalance = loyalty?.balance || 0;

  return {
    customerName: customer.name,
    walletToken: customer.walletToken,
    packages: packages.map((p) => ({
      id: p._id.toString(),
      name: p.packageName,
      sessionsTotal: p.sessionsTotal,
      sessionsUsed: p.sessionsUsed,
      sessionsRemaining: Math.max(0, (p.sessionsTotal || 0) - (p.sessionsUsed || 0)),
      expiresAt: p.expiresAt,
      status: p.status,
    })),
    membership: membership
      ? {
          id: membership._id.toString(),
          name: membership.planName,
          endsAt: membership.endsAt,
          benefits: membership.benefits,
          status: membership.status,
        }
      : null,
    loyalty: {
      enabled: Boolean(loyaltySettings.loyaltyEnabled),
      mode: loyaltySettings.mode || 'stamps',
      balance: currentBalance,
      stampsForReward,
      isRewardReady: currentBalance >= stampsForReward,
      rewardDefinition: loyaltySettings.rewardDefinition || {
        type: 'free_service',
        value: 0,
      },
    },
    shop: {
      name: 'Modern Mane Luxury Barber Studio',
      phone: settings?.whatsappNumber || '919876543210',
    },
  };
}
