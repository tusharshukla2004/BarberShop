import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { Customer } from '../src/models/Customer.js';
import { Booking } from '../src/models/Booking.js';
import { Service } from '../src/models/Service.js';
import { Settings } from '../src/models/Settings.js';
import {
  findOrCreateCustomer,
  recalculateCustomerStats,
  anonymizeCustomer,
  getCanonicalPhone,
} from '../src/services/customerService.js';
import { backfillCustomers } from '../src/seed/backfillCustomers.js';

describe('Customer Management, Stats, & History', () => {
  let customerPhone = '9876543210';
  let canonicalPhone = '919876543210';

  beforeEach(async () => {
    // If not connected to a test db, skip DB-dependent tests or use in-memory/mock
    if (mongoose.connection.readyState === 1) {
      await Customer.deleteMany({ phone: { $regex: '9876543210|919876543210' } });
      await Booking.deleteMany({ phone: { $regex: '9876543210|919876543210' } });
    }
  });

  describe('getCanonicalPhone & Phone Normalization', () => {
    it('normalizes various Indian phone formats to 91XXXXXXXXXX', () => {
      expect(getCanonicalPhone('9876543210')).toBe('919876543210');
      expect(getCanonicalPhone('+91 98765 43210')).toBe('919876543210');
      expect(getCanonicalPhone('+919876543210')).toBe('919876543210');
      expect(getCanonicalPhone('09876543210')).toBe('919876543210');
      expect(getCanonicalPhone('91-98765-43210')).toBe('919876543210');
    });

    it('returns empty string for invalid phone', () => {
      expect(getCanonicalPhone('')).toBe('');
      expect(getCanonicalPhone(null)).toBe('');
    });
  });

  describe('findOrCreateCustomer', () => {
    it('creates a new customer and resolves identical profile across different phone formats', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const c1 = await findOrCreateCustomer({
        phone: '+91 98765 43210',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
      });

      expect(c1).toBeDefined();
      expect(c1.phone).toBe(canonicalPhone);
      expect(c1.name).toBe('Rahul Sharma');

      // Second lookup using standard 10-digit format
      const c2 = await findOrCreateCustomer({
        phone: '9876543210',
        name: 'Rahul Sharma',
      });

      expect(c2._id.toString()).toBe(c1._id.toString());

      // Third lookup using 0-prefixed format with updated name
      const c3 = await findOrCreateCustomer({
        phone: '09876543210',
        name: 'Rahul K. Sharma',
      });

      expect(c3._id.toString()).toBe(c1._id.toString());
    });
  });

  describe('recalculateCustomerStats', () => {
    it('calculates completedVisits, cancelledCount, noShowCount, and totalSpent correctly', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const customer = await Customer.create({
        name: 'Amit Patel',
        phone: '919876543211',
      });

      // Create dummy bookings with different statuses
      await Booking.create([
        {
          customerName: 'Amit Patel',
          phone: customer.phone,
          customerId: customer._id,
          serviceId: 'srv-1',
          date: '2026-10-10',
          startTime: '10:00 AM',
          endTime: '10:30 AM',
          status: 'completed',
          priceAtBooking: 650,
        },
        {
          customerName: 'Amit Patel',
          phone: customer.phone,
          customerId: customer._id,
          serviceId: 'srv-2',
          date: '2026-10-15',
          startTime: '11:00 AM',
          endTime: '11:30 AM',
          status: 'completed',
          priceAtBooking: 450,
        },
        {
          customerName: 'Amit Patel',
          phone: customer.phone,
          customerId: customer._id,
          serviceId: 'srv-1',
          date: '2026-10-20',
          startTime: '02:00 PM',
          endTime: '02:30 PM',
          status: 'cancelled',
          priceAtBooking: 650,
        },
        {
          customerName: 'Amit Patel',
          phone: customer.phone,
          customerId: customer._id,
          serviceId: 'srv-1',
          date: '2026-10-25',
          startTime: '04:00 PM',
          endTime: '04:30 PM',
          status: 'no_show',
          priceAtBooking: 650,
        },
      ]);

      const updated = await recalculateCustomerStats(customer._id);
      expect(updated.stats.totalVisits).toBe(4);
      expect(updated.stats.completedVisits).toBe(2);
      expect(updated.stats.cancelledCount).toBe(1);
      expect(updated.stats.noShowCount).toBe(1);
      expect(updated.stats.totalSpent).toBe(1100); // 650 + 450
      expect(updated.isFlagged).toBe(false);

      // Clean up
      await Booking.deleteMany({ customerId: customer._id });
      await Customer.deleteOne({ _id: customer._id });
    });

    it('triggers isFlagged with Repeated no-shows when noShowCount reaches threshold', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const customer = await Customer.create({
        name: 'Serial NoShow',
        phone: '919876543212',
      });

      // 3 no-show bookings
      for (let i = 1; i <= 3; i++) {
        await Booking.create({
          customerName: 'Serial NoShow',
          phone: customer.phone,
          customerId: customer._id,
          serviceId: 'srv-1',
          date: `2026-10-0${i}`,
          startTime: '10:00 AM',
          endTime: '10:30 AM',
          status: 'no_show',
          priceAtBooking: 500,
        });
      }

      const updated = await recalculateCustomerStats(customer._id);
      expect(updated.stats.noShowCount).toBe(3);
      expect(updated.isFlagged).toBe(true);
      expect(updated.flagReason).toBe('Repeated no-shows');

      // Clean up
      await Booking.deleteMany({ customerId: customer._id });
      await Customer.deleteOne({ _id: customer._id });
    });
  });

  describe('anonymizeCustomer', () => {
    it('anonymizes customer personal details and linked bookings', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const customer = await Customer.create({
        name: 'Privacy Minded',
        phone: '919876543213',
        email: 'secret@domain.com',
        notes: 'VIP customer private notes',
      });

      const booking = await Booking.create({
        customerName: 'Privacy Minded',
        phone: customer.phone,
        customerId: customer._id,
        serviceId: 'srv-1',
        date: '2026-10-12',
        startTime: '10:00 AM',
        endTime: '10:30 AM',
        status: 'confirmed',
      });

      const anonymized = await anonymizeCustomer(customer._id);
      expect(anonymized.isDeleted).toBe(true);
      expect(anonymized.name).toContain('Anonymized Customer');
      expect(anonymized.phone).toContain('anon-');
      expect(anonymized.email).toBe('');
      expect(anonymized.notes).toBe('');

      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.customerName).toBe('Anonymized Customer');
      expect(updatedBooking.phone).toBe('0000000000');

      // Clean up
      await Booking.deleteOne({ _id: booking._id });
      await Customer.deleteOne({ _id: customer._id });
    });
  });
});
