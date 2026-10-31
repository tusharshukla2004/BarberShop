import mongoose from 'mongoose';
import { CustomerPackage } from '../models/CustomerPackage.js';
import { CustomerMembership } from '../models/CustomerMembership.js';

let expiryCleanerTimer = null;

/**
 * Sweeps and marks expired packages and memberships
 */
export async function cleanExpiredWalletItems() {
  if (mongoose.connection?.readyState !== 1) {
    return { expiredPackages: 0, expiredMemberships: 0 };
  }

  const now = new Date();

  const [packageRes, membershipRes] = await Promise.all([
    CustomerPackage.updateMany(
      {
        status: 'active',
        expiresAt: { $lt: now },
      },
      {
        status: 'expired',
      }
    ),
    CustomerMembership.updateMany(
      {
        status: 'active',
        endsAt: { $lt: now },
      },
      {
        status: 'expired',
      }
    ),
  ]);

  return {
    expiredPackages: packageRes.modifiedCount || 0,
    expiredMemberships: membershipRes.modifiedCount || 0,
  };
}

/**
 * Retrieves packages and memberships expiring within the specified days (default: 7)
 */
export async function getExpiringWalletItems(days = 7) {
  if (mongoose.connection?.readyState !== 1) {
    return { expiringPackages: [], expiringMemberships: [] };
  }

  const now = new Date();
  const futureLimit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const [expiringPackages, expiringMemberships] = await Promise.all([
    CustomerPackage.find({
      status: 'active',
      expiresAt: { $gte: now, $lte: futureLimit },
    })
      .populate('customerId', 'name phone email')
      .populate('packageId', 'name')
      .sort({ expiresAt: 1 })
      .lean(),
    CustomerMembership.find({
      status: 'active',
      endsAt: { $gte: now, $lte: futureLimit },
    })
      .populate('customerId', 'name phone email')
      .populate('planId', 'name')
      .sort({ endsAt: 1 })
      .lean(),
  ]);

  return {
    expiringPackages,
    expiringMemberships,
  };
}

/**
 * Starts background timer to periodically expire wallet items (every 10 minutes)
 */
export function startWalletExpiryCleaner(intervalMs = 10 * 60 * 1000) {
  if (expiryCleanerTimer) {
    clearInterval(expiryCleanerTimer);
  }

  // Initial check
  cleanExpiredWalletItems().catch((err) => {
    console.error('[walletExpiryService] Error during initial expiry check:', err.message);
  });

  expiryCleanerTimer = setInterval(() => {
    cleanExpiredWalletItems().catch((err) => {
      console.error('[walletExpiryService] Error during interval expiry check:', err.message);
    });
  }, intervalMs);

  return expiryCleanerTimer;
}

/**
 * Stops background expiry cleaner timer
 */
export function stopWalletExpiryCleaner() {
  if (expiryCleanerTimer) {
    clearInterval(expiryCleanerTimer);
    expiryCleanerTimer = null;
  }
}

