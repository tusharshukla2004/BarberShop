import crypto from 'crypto';
import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { Barber } from '../models/Barber.js';
import { Settings } from '../models/Settings.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { recalculateCustomerStats } from '../services/customerService.js';

/**
 * Constant-time comparison for SHA-256 hex hashes to prevent timing attacks
 */
function constantTimeHashCompare(knownHash, candidateHash) {
  if (!knownHash || !candidateHash) return false;
  try {
    const a = Buffer.from(knownHash, 'hex');
    const b = Buffer.from(candidateHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Masks a mobile number, e.g. 919876543210 -> 91******3210
 */
function maskPhoneNumber(phone) {
  if (!phone) return '';
  const str = String(phone).trim();
  if (str.length < 8) return str;
  return str.slice(0, 2) + '*'.repeat(str.length - 6) + str.slice(-4);
}

/**
 * Public GET: Retrieve booking details via secret manage link
 */
export async function getManageBookingDetails(req, res, next) {
  try {
    const { ref, token } = req.query;

    if (!ref || !token) {
      return sendError(res, 404, 'Booking not found or link has expired.', 'NOT_FOUND');
    }

    const booking = await Booking.findOne({ bookingRef: String(ref).trim().toUpperCase() });
    if (!booking || !booking.manageTokenHash) {
      return sendError(res, 404, 'Booking not found or link has expired.', 'NOT_FOUND');
    }

    const candidateHash = Booking.hashManageToken(token);
    const isTokenValid = constantTimeHashCompare(booking.manageTokenHash, candidateHash);

    if (!isTokenValid) {
      return sendError(res, 404, 'Booking not found or link has expired.', 'NOT_FOUND');
    }

    // Check link expiration
    if (booking.manageTokenExpiresAt && booking.manageTokenExpiresAt.getTime() < Date.now()) {
      return sendError(res, 404, 'Booking link has expired.', 'LINK_EXPIRED');
    }

    // Lookup service and barber details
    let serviceName = booking.serviceId;
    if (booking.serviceId) {
      const srv = await Service.findById(booking.serviceId).lean().catch(() => null);
      if (srv) serviceName = srv.name;
    }

    let barberName = 'Any Available Barber';
    if (booking.barberId) {
      const brb = await Barber.findById(booking.barberId).lean().catch(() => null);
      if (brb) barberName = brb.name;
    }

    const settings = await Settings.findOne().lean().catch(() => null);
    const policyHours = settings?.policies?.cancellationNoticeHours || 2;

    return sendSuccess(res, {
      bookingRef: booking.bookingRef,
      customerName: booking.customerName,
      phone: maskPhoneNumber(booking.phone),
      serviceName,
      serviceId: booking.serviceId,
      barberName,
      barberId: booking.barberId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      price: booking.priceAtBooking || booking.originalPrice || 0,
      rescheduleCount: booking.rescheduleCount || 0,
      maxReschedules: 2,
      cancellationPolicyHours: policyHours,
      shopInfo: {
        name: settings?.shopName || 'Modern Mane Barbershop',
        phone: settings?.phone || '+91 98765 43210',
        address: settings?.address || '123 Luxury Lane, Indiranagar, Bangalore',
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Public POST: Cancel booking via secret manage link
 */
export async function manageCancelBooking(req, res, next) {
  try {
    const { ref, token, reason } = req.body;

    if (!ref || !token) {
      return sendError(res, 404, 'Booking not found or link has expired.', 'NOT_FOUND');
    }

    const booking = await Booking.findOne({ bookingRef: String(ref).trim().toUpperCase() });
    if (!booking || !booking.manageTokenHash) {
      return sendError(res, 404, 'Booking not found or link has expired.', 'NOT_FOUND');
    }

    const candidateHash = Booking.hashManageToken(token);
    if (!constantTimeHashCompare(booking.manageTokenHash, candidateHash)) {
      return sendError(res, 404, 'Booking not found or link has expired.', 'NOT_FOUND');
    }

    if (booking.manageTokenExpiresAt && booking.manageTokenExpiresAt.getTime() < Date.now()) {
      return sendError(res, 404, 'Booking link has expired.', 'LINK_EXPIRED');
    }

    if (booking.status === 'cancelled') {
      return sendError(res, 400, 'This booking has already been cancelled.', 'ALREADY_CANCELLED');
    }

    if (booking.status === 'completed') {
      return sendError(res, 400, 'Completed appointments cannot be cancelled.', 'ALREADY_COMPLETED');
    }

    // Enforce cancellation notice window policy
    const settings = await Settings.findOne().lean().catch(() => null);
    const policyHours = settings?.policies?.cancellationNoticeHours || 2;

    const appointmentTime = new Date(`${booking.date} ${booking.startTime}`);
    if (!isNaN(appointmentTime.getTime())) {
      const hoursUntilAppointment = (appointmentTime.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilAppointment < policyHours) {
        return sendError(
          res,
          400,
          `Online cancellation is only allowed at least ${policyHours} hours before the appointment. Please call the shop directly.`,
          'CANCELLATION_POLICY_LIMIT'
        );
      }
    }

    booking.status = 'cancelled';
    booking.notifications.push({
      type: 'cancellation',
      channel: 'manage_link',
      sentAt: new Date(),
      by: 'customer_self_service',
    });

    if (reason) {
      booking.notes = `${booking.notes || ''}\nCustomer Cancellation Reason: ${reason}`.trim();
    }

    await booking.save();

    if (booking.customerId) {
      recalculateCustomerStats(booking.customerId).catch(() => {});
    }

    return sendSuccess(res, { status: 'cancelled' }, 200, 'Appointment cancelled successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * Public POST: Reschedule booking via secret manage link
 */
export async function manageRescheduleBooking(req, res, next) {
  try {
    const { ref, token, newDate, newStartTime, newEndTime } = req.body;

    if (!ref || !token || !newDate || !newStartTime) {
      return sendError(res, 400, 'Please provide new date and start time.', 'MISSING_FIELDS');
    }

    const booking = await Booking.findOne({ bookingRef: String(ref).trim().toUpperCase() });
    if (!booking || !booking.manageTokenHash) {
      return sendError(res, 404, 'Booking not found or link has expired.', 'NOT_FOUND');
    }

    const candidateHash = Booking.hashManageToken(token);
    if (!constantTimeHashCompare(booking.manageTokenHash, candidateHash)) {
      return sendError(res, 404, 'Booking not found or link has expired.', 'NOT_FOUND');
    }

    if (booking.manageTokenExpiresAt && booking.manageTokenExpiresAt.getTime() < Date.now()) {
      return sendError(res, 404, 'Booking link has expired.', 'LINK_EXPIRED');
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return sendError(res, 400, `Cannot reschedule an appointment that is ${booking.status}.`, 'INVALID_STATUS');
    }

    // Limit online reschedules to at most 2
    if ((booking.rescheduleCount || 0) >= 2) {
      return sendError(
        res,
        400,
        'Maximum of 2 online reschedules allowed. Please call the shop directly to make further changes.',
        'RESCHEDULE_LIMIT_REACHED'
      );
    }

    // Check cancellation/reschedule policy notice window
    const settings = await Settings.findOne().lean().catch(() => null);
    const policyHours = settings?.policies?.cancellationNoticeHours || 2;
    const currentAppointmentTime = new Date(`${booking.date} ${booking.startTime}`);

    if (!isNaN(currentAppointmentTime.getTime())) {
      const hoursUntil = (currentAppointmentTime.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntil < policyHours) {
        return sendError(
          res,
          400,
          `Changes must be requested at least ${policyHours} hours before the appointment. Please call the shop directly.`,
          'POLICY_WINDOW_PASSED'
        );
      }
    }

    // Conflict check for selected slot if barber is assigned
    if (booking.barberId) {
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        barberId: booking.barberId,
        date: newDate,
        startTime: newStartTime,
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
      });

      if (conflict) {
        return sendError(
          res,
          409,
          'The selected slot is no longer available. Please choose another time.',
          'SLOT_CONFLICT'
        );
      }
    }

    booking.date = newDate;
    booking.startTime = newStartTime;
    booking.endTime = newEndTime || newStartTime;
    booking.rescheduleCount = (booking.rescheduleCount || 0) + 1;

    // Extend manage token expiry for new appointment date + 24 hours
    const newEnd = new Date(`${newDate} ${booking.endTime}`);
    if (!isNaN(newEnd.getTime())) {
      booking.manageTokenExpiresAt = new Date(newEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    booking.notifications.push({
      type: 'reschedule',
      channel: 'manage_link',
      sentAt: new Date(),
      by: 'customer_self_service',
    });

    await booking.save();

    return sendSuccess(
      res,
      {
        bookingRef: booking.bookingRef,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        rescheduleCount: booking.rescheduleCount,
      },
      200,
      'Appointment rescheduled successfully'
    );
  } catch (error) {
    return next(error);
  }
}

