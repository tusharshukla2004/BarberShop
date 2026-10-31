/**
 * @file server/src/seed/seedDemoBookings.js
 * @description Generates 60 days of realistic historical and upcoming demo bookings
 * for local testing and analytics verification.
 * SAFEGUARD: Must NEVER run in production.
 */

import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Barber } from '../models/Barber.js';
import { Service } from '../models/Service.js';
import { Customer } from '../models/Customer.js';
import { env } from '../config/env.js';
import { findOrCreateCustomer, recalculateCustomerStats } from '../services/customerService.js';

export async function seedDemoBookings() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SECURITY VIOLATION: seedDemoBookings must NEVER be executed in production environment!');
  }

  const barbers = await Barber.find({ isActive: true });
  const services = await Service.find({ isActive: true });

  if (barbers.length === 0 || services.length === 0) {
    console.warn('Cannot seed demo bookings: No barbers or services found in database.');
    return;
  }

  const demoCustomerPool = [
    { name: 'Aarav Patel', phone: '9876543001', email: 'aarav.patel@example.com' },
    { name: 'Rohan Mehta', phone: '9876543002', email: 'rohan.mehta@example.com' },
    { name: 'Karan Malhotra', phone: '9876543003', email: 'karan.m@example.com' },
    { name: 'Vikram Joshi', phone: '9876543004', email: 'vikram.j@example.com' },
    { name: 'Aditya Nair', phone: '9876543005', email: 'aditya.nair@example.com' },
    { name: 'Siddharth Rao', phone: '9876543006', email: 'sid.rao@example.com' },
    { name: 'Kabir Sengupta', phone: '9876543007', email: 'kabir.s@example.com' },
    { name: 'Farhan Zaidi', phone: '9876543008', email: 'farhan.z@example.com' },
    { name: 'Manish Sharma', phone: '9876543009', email: 'manish.s@example.com' },
    { name: 'Devendra Gill', phone: '9876543010', email: 'dev.gill@example.com' },
    { name: 'Sameer Desai', phone: '9876543011', email: 'sameer.d@example.com' },
    { name: 'Nikhil Verma', phone: '9876543012', email: 'nikhil.v@example.com' },
  ];

  const timeSlots = [
    '09:30 AM',
    '10:15 AM',
    '11:00 AM',
    '11:45 AM',
    '02:00 PM',
    '02:45 PM',
    '03:30 PM',
    '04:15 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
  ];

  const sources = ['appointment', 'walk_in', 'admin'];
  const today = new Date();
  const createdBookings = [];
  const touchedCustomerIds = new Set();

  console.log('Generating 60 days of realistic bookings data...');

  // Generate for days -50 to +10 (60 days window)
  for (let offset = -50; offset <= 10; offset++) {
    const targetDateObj = new Date(today.getTime() + offset * 86400000);
    const dateStr = targetDateObj.toISOString().slice(0, 10);
    const dayOfWeek = targetDateObj.getDay(); // 0 is Sunday, 6 is Saturday

    // Weekend days (Sat/Sun) have higher volume (6-10 bookings); weekdays have 3-6 bookings
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const bookingCount = isWeekend ? Math.floor(Math.random() * 5) + 6 : Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < bookingCount; i++) {
      const barber = barbers[Math.floor(Math.random() * barbers.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      const customerInfo = demoCustomerPool[Math.floor(Math.random() * demoCustomerPool.length)];
      const slotTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];

      // Status distribution based on whether date is in past or future
      let status = 'confirmed';
      if (offset < 0) {
        // Past dates: 82% completed, 10% no_show, 8% cancelled
        const rand = Math.random();
        if (rand < 0.82) status = 'completed';
        else if (rand < 0.92) status = 'no_show';
        else status = 'cancelled';
      } else if (offset === 0) {
        // Today: mixture of completed and confirmed
        status = Math.random() < 0.4 ? 'completed' : 'confirmed';
      }

      // Resolve / Link customer
      let customer = null;
      try {
        customer = await findOrCreateCustomer({
          phone: customerInfo.phone,
          name: customerInfo.name,
          email: customerInfo.email,
          preferredBarberId: barber.id || barber._id?.toString(),
          preferredServiceId: service.id || service._id?.toString(),
        });
        if (customer) touchedCustomerIds.add(customer._id.toString());
      } catch {
        // fallback
      }

      const booking = new Booking({
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
        customerId: customer ? customer._id : null,
        priceAtBooking: service.price || 500,
        serviceId: service.id || service._id.toString(),
        barberId: barber.id || barber._id.toString(),
        date: dateStr,
        startTime: slotTime,
        endTime: slotTime, // Approximate for reports
        status,
        source,
        notes: `Demo seed data [Day ${offset}]`,
        whatsappConsent: true,
      });

      createdBookings.push(booking);
    }
  }

  // Bulk save bookings
  await Booking.insertMany(createdBookings);

  // Recalculate stats for all affected customers
  for (const cId of touchedCustomerIds) {
    await recalculateCustomerStats(cId);
  }

  console.log(`Successfully generated ${createdBookings.length} demo bookings across 60 days.`);
}

// Standalone execution wrapper
if (process.argv[1]?.includes('seedDemoBookings')) {
  mongoose
    .connect(env.MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB. Running seedDemoBookings...');
      await seedDemoBookings();
      await mongoose.disconnect();
      console.log('Disconnected. Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Demo seed error:', err);
      process.exit(1);
    });
}

