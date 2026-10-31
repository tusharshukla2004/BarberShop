import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';

let cleanupInterval = null;

/**
 * Immediately cancels any slot holds whose expiresAt has passed.
 * Returns the count of cancelled holds.
 *
 * @returns {Promise<number>}
 */
export async function cleanExpiredHolds() {
  try {
    if (mongoose.connection?.readyState !== 1) {
      return 0;
    }
    const result = await Booking.updateMany(
      {
        status: 'pending_payment',
        expiresAt: { $lte: new Date() },
      },
      {
        $set: {
          status: 'cancelled',
          notes: 'Slot hold expired unpaid',
        },
      }
    );
    return result.modifiedCount || 0;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to clean expired slot holds:', error);
    return 0;
  }
}

/**
 * Starts a recurring background cleaner for expired slot holds (every 60 seconds).
 */
export function startSlotHoldCleaner(intervalMs = 60000) {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(async () => {
    await cleanExpiredHolds();
  }, intervalMs);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

/**
 * Stops the recurring slot hold cleaner.
 */
export function stopSlotHoldCleaner() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
