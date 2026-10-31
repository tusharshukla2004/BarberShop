import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Barber } from '../models/Barber.js';
import { Service } from '../models/Service.js';
import { Settings } from '../models/Settings.js';
import { Offer } from '../models/Offer.js';
import { calculateSlots } from '../utils/slots.js';
import { validateAndCalculateDiscount } from '../utils/offers.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  findOrCreateCustomer,
  recalculateCustomerStats,
} from '../services/customerService.js';

/**
 * Finds a document by either custom id string or MongoDB ObjectId
 */
async function findByIdOrCustom(model, id) {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await model.findById(id);
    if (doc) return doc;
  }
  return model.findOne({ id });
}

export async function getSlots(req, res, next) {
  try {
    const { date, barberId, serviceId } = req.query;

    if (!date || !barberId) {
      return sendError(res, 400, 'Date and Barber ID are required', 'MISSING_PARAMS');
    }

    const barber = await findByIdOrCustom(Barber, barberId);
    if (!barber) {
      return sendError(res, 404, 'Barber not found', 'BARBER_NOT_FOUND');
    }

    let service = null;
    if (serviceId) {
      service = await findByIdOrCustom(Service, serviceId);
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = { slotLengthMinutes: 30, holidays: [] };
    }

    // Query active bookings for this barber & date
    // Account for both barber.id and barber._id
    const barberIdStr = barber.id || barber._id.toString();
    const existingBookings = await Booking.find({
      barberId: { $in: [barberId, barberIdStr, barber._id] },
      date,
      status: { $in: ['pending', 'confirmed'] },
    }).lean();

    const slots = calculateSlots({
      date,
      barber,
      service,
      existingBookings,
      settings,
    });

    return sendSuccess(res, slots);
  } catch (error) {
    return next(error);
  }
}

export async function createBooking(req, res, next) {
  try {
    const { customerName, phone, email, serviceId, barberId, date, startTime, endTime, notes } =
      req.body;

    let barberIdStr = '';

    // 1. Barber existence check (only if specific barber chosen)
    if (barberId && barberId !== 'any' && barberId !== 'unassigned') {
      const barber = await findByIdOrCustom(Barber, barberId);
      if (!barber) {
        return sendError(res, 404, 'Selected barber was not found', 'NOT_FOUND');
      }
      barberIdStr = barber.id || barber._id.toString();

      // 2. Conflict check before insert
      const existingConflict = await Booking.findOne({
        barberId: { $in: [barberId, barberIdStr] },
        date,
        startTime,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (existingConflict) {
        return sendError(
          res,
          409,
          'This slot is already booked. Please choose an alternate slot or barber.',
          'CONFLICT'
        );
      }
    }

    // Resolve price at booking and validate promo code
    let originalPrice = 0;
    if (serviceId) {
      const srv = await findByIdOrCustom(Service, serviceId);
      if (srv) originalPrice = srv.price || 0;
    }
    let priceAtBooking = originalPrice;
    let discountAmount = 0;
    let appliedOfferId = null;
    let cleanPromoCode = '';

    if (req.body.promoCode) {
      cleanPromoCode = req.body.promoCode.trim().toUpperCase();
      const offer = await Offer.findOne({ promoCode: cleanPromoCode });
      if (offer) {
        const discountCalc = validateAndCalculateDiscount({
          offer,
          serviceIds: [serviceId],
          totalPrice: originalPrice,
          dateStr: date,
          nowDate: new Date(),
        });

        if (discountCalc.isValid) {
          // Atomically increment usedCount while respecting usageLimit
          const updateFilter = { _id: offer._id };
          if (typeof offer.usageLimit === 'number' && offer.usageLimit > 0) {
            updateFilter.usedCount = { $lt: offer.usageLimit };
          }
          const updatedOffer = await Offer.findOneAndUpdate(
            updateFilter,
            { $inc: { usedCount: 1 } },
            { new: true }
          );

          if (updatedOffer) {
            appliedOfferId = offer._id;
            discountAmount = discountCalc.discountAmount;
            priceAtBooking = discountCalc.finalPrice;
          }
        }
      }
    }

    // Resolve or create customer profile
    let customerId = null;
    try {
      const customer = await findOrCreateCustomer({
        phone,
        name: customerName,
        email,
        whatsappConsent: req.body.whatsappConsent,
        preferredBarberId: barberIdStr || null,
        preferredServiceId: serviceId || null,
      });
      if (customer) customerId = customer._id;
    } catch {
      // Continue booking creation even if customer profile resolution hits an edge
    }

    // 3. Create booking
    const booking = await Booking.create({
      customerName,
      phone,
      email: email || '',
      customerId,
      originalPrice,
      discountAmount,
      appliedOfferId,
      promoCode: cleanPromoCode,
      priceAtBooking,
      serviceId,
      barberId: barberIdStr,
      date,
      startTime,
      endTime: endTime || startTime,
      status: 'confirmed',
      notes: notes || '',
      whatsappConsent: Boolean(req.body.whatsappConsent),
    });

    if (customerId) {
      recalculateCustomerStats(customerId).catch(() => {});
    }

    return sendSuccess(res, booking, 201, 'Booking confirmed successfully!');
  } catch (error) {
    return next(error);
  }
}

export async function createBookingRequest(req, res, next) {
  try {
    const { name, phone, dateTime, email, service, barberId, notes, whatsappConsent } = req.body;

    // Quick booking request created from Hero section
    // Extracts date and time if parsable, else stores raw in notes
    let parsedDate = new Date().toISOString().split('T')[0];
    let parsedTime = '10:00 AM';

    if (dateTime) {
      const dt = new Date(dateTime);
      if (!isNaN(dt.getTime())) {
        parsedDate = dt.toISOString().split('T')[0];
        const hours = dt.getHours();
        const mins = dt.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedH = (hours % 12 || 12).toString().padStart(2, '0');
        const formattedM = mins.toString().padStart(2, '0');
        parsedTime = `${formattedH}:${formattedM} ${period}`;
      }
    }

    // Do NOT auto-assign a barber when the customer has not selected one
    const assignedBarberId =
      barberId && barberId !== 'any' && barberId !== 'unassigned' ? barberId : '';

    let priceAtBooking = 0;
    if (service) {
      const srv = await findByIdOrCustom(Service, service);
      if (srv) priceAtBooking = srv.price || 0;
    }

    let customerId = null;
    try {
      const customer = await findOrCreateCustomer({
        phone,
        name,
        email,
        whatsappConsent,
        preferredBarberId: assignedBarberId || null,
        preferredServiceId: service || null,
      });
      if (customer) customerId = customer._id;
    } catch {
      // Continue
    }

    const booking = await Booking.create({
      customerName: name,
      phone,
      email: email || '',
      customerId,
      priceAtBooking,
      serviceId: service || '',
      barberId: assignedBarberId,
      date: parsedDate,
      startTime: parsedTime,
      endTime: parsedTime,
      status: 'pending',
      notes: `Requested at: ${dateTime}. ${notes || ''}`.trim(),
      whatsappConsent: Boolean(whatsappConsent),
    });

    if (customerId) {
      recalculateCustomerStats(customerId).catch(() => {});
    }

    return sendSuccess(
      res,
      booking,
      201,
      'Your appointment request has been received. Our concierge will confirm your slot.'
    );
  } catch (error) {
    return next(error);
  }
}

export async function adminListBookings(req, res, next) {
  try {
    const { date, barberId, status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (date) filter.date = date;

    // Role-based scoping: barbers can ONLY view their own appointments
    if (req.user?.role === 'barber') {
      filter.barberId = req.user.barberId || req.user.id;
    } else if (barberId) {
      filter.barberId = barberId;
    }

    if (status) filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ date: -1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(res, bookings, 200, null);
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdateBooking(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await findByIdOrCustom(Booking, id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found', 'NOT_FOUND');
    }

    // Check if reschedule conflicts
    if (
      (updateData.date && updateData.date !== booking.date) ||
      (updateData.startTime && updateData.startTime !== booking.startTime)
    ) {
      const targetDate = updateData.date || booking.date;
      const targetTime = updateData.startTime || booking.startTime;
      const targetBarber = updateData.barberId || booking.barberId;

      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        barberId: targetBarber,
        date: targetDate,
        startTime: targetTime,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (conflict) {
        return sendError(
          res,
          409,
          'Cannot reschedule: target slot is already booked for this barber.',
          'CONFLICT'
        );
      }
    }

    Object.assign(booking, updateData);
    await booking.save();

    if (booking.customerId) {
      await recalculateCustomerStats(booking.customerId);
    } else if (booking.phone) {
      try {
        const cust = await findOrCreateCustomer({
          phone: booking.phone,
          name: booking.customerName,
          email: booking.email,
        });
        if (cust) {
          booking.customerId = cust._id;
          await booking.save();
          await recalculateCustomerStats(cust._id);
        }
      } catch {}
    }

    return sendSuccess(res, booking, 200, 'Booking updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function adminCancelBooking(req, res, next) {
  try {
    const { id } = req.params;

    const booking = await findByIdOrCustom(Booking, id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found', 'NOT_FOUND');
    }

    booking.status = 'cancelled';
    await booking.save();

    if (booking.customerId) {
      await recalculateCustomerStats(booking.customerId);
    }

    return sendSuccess(res, booking, 200, 'Booking cancelled.');
  } catch (error) {
    return next(error);
  }
}

export async function recordNotification(req, res, next) {
  try {
    const { id } = req.params;
    const { type, channel = 'whatsapp_link' } = req.body;

    const booking = await findByIdOrCustom(Booking, id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found', 'NOT_FOUND');
    }

    const now = new Date();
    const staffName = req.user?.name || req.user?.email || 'staff';

    if (type === 'confirmation') {
      booking.confirmationSentAt = now;
    } else if (type === 'reminder') {
      booking.reminderSentAt = now;
    } else if (type === 'review_request') {
      booking.reviewRequestSentAt = now;
    }

    if (!Array.isArray(booking.notifications)) {
      booking.notifications = [];
    }

    booking.notifications.push({
      type,
      channel,
      sentAt: now,
      by: staffName,
    });

    await booking.save();
    return sendSuccess(res, booking, 200, 'Notification recorded successfully');
  } catch (error) {
    return next(error);
  }
}

export async function getReminders(req, res, next) {
  try {
    const hours = req.query.hours ? parseInt(req.query.hours, 10) : 3;
    const day = req.query.day || 'today';

    // Calculate current time and dates in Asia/Kolkata
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const todayStr = formatter.format(now); // "YYYY-MM-DD"

    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = formatter.format(tomorrowDate);

    const targetDate = day === 'tomorrow' ? tomorrowStr : todayStr;

    // Filter by confirmed bookings for target date
    const query = {
      date: targetDate,
      status: 'confirmed',
    };

    // Role guard: if logged-in user is a barber, filter by their barberId
    if (req.user && req.user.role === 'barber') {
      const barberFilter = req.user.barberId || req.user.id || req.user._id?.toString();
      query.barberId = barberFilter;
    }

    const bookings = await Booking.find(query).lean();

    // Attach services and barbers names
    const services = await Service.find().lean();
    const barbers = await Barber.find().lean();

    const serviceMap = new Map(services.map((s) => [s.id || s._id.toString(), s.name]));
    const barberMap = new Map(barbers.map((b) => [b.id || b._id.toString(), b.name]));

    let reminders = bookings.map((b) => ({
      ...b,
      id: b._id.toString(),
      serviceName: serviceMap.get(b.serviceId) || 'Custom Grooming',
      barberName: barberMap.get(b.barberId) || 'Any Available',
    }));

    // If day === 'today' and hours filter is applied (and not 0 or all day)
    if (day === 'today' && hours > 0 && hours < 24) {
      const [currH, currM] = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
        .format(now)
        .split(':')
        .map(Number);
      const currentMinutes = currH * 60 + currM;
      const windowEndMinutes = currentMinutes + hours * 60;

      reminders = reminders.filter((b) => {
        const match = b.startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return true;
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const p = match[3].toUpperCase();
        if (p === 'PM' && h < 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;
        const slotMinutes = h * 60 + m;

        // Keep if slot is within next N hours (or within past 30 mins)
        return slotMinutes >= currentMinutes - 30 && slotMinutes <= windowEndMinutes;
      });
    }

    // Sort: Unsent first, then by startTime; Sent at the bottom
    reminders.sort((a, b) => {
      const aSent = Boolean(a.reminderSentAt);
      const bSent = Boolean(b.reminderSentAt);
      if (aSent !== bSent) {
        return aSent ? 1 : -1;
      }
      return a.startTime.localeCompare(b.startTime);
    });

    return sendSuccess(res, reminders);
  } catch (error) {
    return next(error);
  }
}
