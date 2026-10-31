import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { Booking } from '../models/Booking.js';
import { Customer } from '../models/Customer.js';
import { Service } from '../models/Service.js';
import { findOrCreateCustomer, recalculateCustomerStats } from '../services/customerService.js';
import { env } from '../config/env.js';

/**
 * Idempotent customer backfill and stats recalculation script
 * Safely associates all existing bookings with customer profiles
 */
export async function backfillCustomers() {
  console.log('🔄 Starting Customers & Booking History backfill...');

  const services = await Service.find().lean();
  const servicePriceMap = new Map();
  for (const s of services) {
    if (s.id) servicePriceMap.set(s.id, s.price || 0);
    if (s._id) servicePriceMap.set(s._id.toString(), s.price || 0);
  }

  const bookings = await Booking.find();
  console.log(`📋 Found ${bookings.length} bookings to examine.`);

  const touchedCustomerIds = new Set();
  let updatedBookingsCount = 0;

  for (const booking of bookings) {
    if (!booking.phone) continue;

    // Resolve service price
    const srvPrice = servicePriceMap.get(booking.serviceId) || 0;

    // 1. Find or create customer
    const customer = await findOrCreateCustomer({
      phone: booking.phone,
      name: booking.customerName,
      email: booking.email,
      whatsappConsent: booking.whatsappConsent,
      preferredBarberId: booking.barberId || null,
      preferredServiceId: booking.serviceId || null,
    });

    touchedCustomerIds.add(customer._id.toString());

    let modified = false;

    // 2. Attach customerId if missing
    if (!booking.customerId || booking.customerId.toString() !== customer._id.toString()) {
      booking.customerId = customer._id;
      modified = true;
    }

    // 3. Attach priceAtBooking if zero or missing and service has a price
    if ((!booking.priceAtBooking || booking.priceAtBooking === 0) && srvPrice > 0) {
      booking.priceAtBooking = srvPrice;
      modified = true;
    }

    if (modified) {
      await booking.save();
      updatedBookingsCount++;
    }
  }

  console.log(`✅ Updated ${updatedBookingsCount} bookings with customerId and priceAtBooking.`);

  // 4. Recalculate stats for all touched customers
  console.log(`📊 Recalculating visit statistics for ${touchedCustomerIds.size} customers...`);
  let updatedCustomersCount = 0;
  for (const custId of touchedCustomerIds) {
    await recalculateCustomerStats(custId);
    updatedCustomersCount++;
  }

  console.log(`🎉 Backfill complete! Recalculated stats for ${updatedCustomersCount} customers.`);
  return {
    totalBookings: bookings.length,
    updatedBookings: updatedBookingsCount,
    totalCustomers: touchedCustomerIds.size,
  };
}

// Auto-run if executed directly
const isDirectExecution =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  mongoose
    .connect(env.MONGO_URI)
    .then(async () => {
      console.log('📦 Connected to MongoDB for customer backfill.');
      await backfillCustomers();
      await mongoose.disconnect();
      console.log('👋 MongoDB disconnected.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Backfill failed:', err);
      process.exit(1);
    });
}
