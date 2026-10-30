import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Barber } from '../models/Barber.js';
import { Service } from '../models/Service.js';
import { Settings } from '../models/Settings.js';
import { calculateSlots } from '../utils/slots.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Finds a document by either custom id string or MongoDB ObjectId
 */
async function findByIdOrCustom(model, id) {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await model.findById(id);
    if (doc) return doc;
  }
  // Try querying by custom id or _id as string
  return model.findOne({ $or: [{ _id: id }, { id }] });
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

    // 1. Barber existence check
    const barber = await findByIdOrCustom(Barber, barberId);
    if (!barber) {
      return sendError(res, 404, 'Selected barber was not found', 'NOT_FOUND');
    }

    // 2. Conflict check before insert
    const barberIdStr = barber.id || barber._id.toString();
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

    // 3. Create booking
    const booking = await Booking.create({
      customerName,
      phone,
      email: email || '',
      serviceId,
      barberId: barberIdStr,
      date,
      startTime,
      endTime: endTime || startTime,
      status: 'confirmed',
      notes: notes || '',
    });

    return sendSuccess(res, booking, 201, 'Booking confirmed successfully!');
  } catch (error) {
    return next(error);
  }
}

export async function createBookingRequest(req, res, next) {
  try {
    const { name, phone, dateTime, email, service, notes } = req.body;

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

    // Find first active barber or assign default
    const barber = await Barber.findOne({ isActive: true });
    const barberId = barber ? barber.id || barber._id.toString() : 'barb-1';

    const booking = await Booking.create({
      customerName: name,
      phone,
      email: email || '',
      serviceId: service || 'general-request',
      barberId,
      date: parsedDate,
      startTime: parsedTime,
      endTime: parsedTime,
      status: 'pending',
      notes: `Requested at: ${dateTime}. ${notes || ''}`.trim(),
    });

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

    return sendSuccess(res, booking, 200, 'Booking cancelled.');
  } catch (error) {
    return next(error);
  }
}
