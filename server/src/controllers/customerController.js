import mongoose from 'mongoose';
import { Customer } from '../models/Customer.js';
import { Booking } from '../models/Booking.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  findOrCreateCustomer,
  recalculateCustomerStats,
  anonymizeCustomer,
  getCanonicalPhone,
} from '../services/customerService.js';

/**
 * List customers with search, filters, sorting, and pagination
 * Barber role only sees customers who booked with them
 */
export async function listCustomers(req, res, next) {
  try {
    const {
      search,
      isFlagged,
      tag,
      lastVisitFrom,
      lastVisitTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = { isDeleted: false };

    // Barber role scoping: can only view customers who have booked with them
    if (req.user?.role === 'barber') {
      const barberId = req.user.barberId || req.user.id || req.user._id?.toString();
      const distinctCustomerIds = await Booking.distinct('customerId', {
        barberId,
        customerId: { $ne: null },
      });
      filter._id = { $in: distinctCustomerIds };
    }

    // Flagged filter
    if (typeof isFlagged === 'boolean') {
      filter.isFlagged = isFlagged;
    }

    // Tag filter
    if (tag) {
      filter.tags = tag;
    }

    // Last visit range filter
    if (lastVisitFrom || lastVisitTo) {
      filter['stats.lastVisitAt'] = {};
      if (lastVisitFrom) {
        filter['stats.lastVisitAt'].$gte = new Date(`${lastVisitFrom}T00:00:00+05:30`);
      }
      if (lastVisitTo) {
        filter['stats.lastVisitAt'].$lte = new Date(`${lastVisitTo}T23:59:59+05:30`);
      }
    }

    // Search by name or phone
    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter).sort(sort).skip(skip).limit(limitNum);

    return sendSuccess(res, {
      customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get customer profile by ID with booking visit history
 */
export async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid customer ID format', 'INVALID_ID');
    }

    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      return sendError(res, 404, 'Customer not found', 'NOT_FOUND');
    }

    // Role guard: barber can only view customers who booked with them
    if (req.user?.role === 'barber') {
      const barberId = req.user.barberId || req.user.id || req.user._id?.toString();
      const hasBooking = await Booking.exists({
        customerId: customer._id,
        barberId,
      });

      if (!hasBooking) {
        return sendError(
          res,
          403,
          'You can only view customers who have appointments with you.',
          'FORBIDDEN'
        );
      }
    }

    // Retrieve full booking visit history
    const bookingFilter = {
      $or: [{ customerId: customer._id }, { phone: customer.phone }],
    };

    if (req.user?.role === 'barber') {
      bookingFilter.barberId = req.user.barberId || req.user.id;
    }

    const bookings = await Booking.find(bookingFilter)
      .sort({ date: -1, startTime: -1 })
      .lean();

    return sendSuccess(res, {
      customer,
      bookings,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Manually add a new customer
 */
export async function createCustomer(req, res, next) {
  try {
    const {
      name,
      phone,
      email,
      notes,
      tags,
      preferredBarberId,
      preferredServiceIds,
      whatsappConsent,
      isFlagged,
      flagReason,
    } = req.body;

    const canonicalPhone = getCanonicalPhone(phone);
    if (!canonicalPhone) {
      return sendError(res, 400, 'Invalid Indian phone number', 'INVALID_PHONE');
    }

    // Check duplicate
    const existing = await Customer.findOne({ phone: canonicalPhone, isDeleted: false });
    if (existing) {
      return sendError(
        res,
        409,
        'A customer with this phone number already exists.',
        'CUSTOMER_EXISTS'
      );
    }

    const customer = await Customer.create({
      name,
      phone: canonicalPhone,
      email: email || '',
      notes: notes || '',
      tags: tags || [],
      preferredBarberId: preferredBarberId || null,
      preferredServiceIds: preferredServiceIds || [],
      whatsappConsent: Boolean(whatsappConsent),
      isFlagged: Boolean(isFlagged),
      flagReason: flagReason || '',
    });

    // Check if any existing bookings belong to this phone and associate them
    const linked = await Booking.updateMany(
      { phone: { $in: [phone, canonicalPhone] }, customerId: null },
      { $set: { customerId: customer._id } }
    );

    if (linked.modifiedCount > 0) {
      await recalculateCustomerStats(customer._id);
    }

    return sendSuccess(res, customer, 201, 'Customer profile created successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Update customer profile
 * Barber role can ONLY update notes
 */
export async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid customer ID format', 'INVALID_ID');
    }

    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      return sendError(res, 404, 'Customer not found', 'NOT_FOUND');
    }

    // Barber role check
    if (req.user?.role === 'barber') {
      const barberId = req.user.barberId || req.user.id || req.user._id?.toString();
      const hasBooking = await Booking.exists({
        customerId: customer._id,
        barberId,
      });

      if (!hasBooking) {
        return sendError(res, 403, 'Permission denied', 'FORBIDDEN');
      }

      // Barbers can ONLY update notes
      if (updateData.notes !== undefined) {
        customer.notes = updateData.notes;
        await customer.save();
      }

      return sendSuccess(res, customer, 200, 'Customer notes updated successfully.');
    }

    // Owner role: can update all profile fields
    if (updateData.phone) {
      const newCanonical = getCanonicalPhone(updateData.phone);
      if (newCanonical !== customer.phone) {
        const conflict = await Customer.findOne({
          _id: { $ne: customer._id },
          phone: newCanonical,
          isDeleted: false,
        });
        if (conflict) {
          return sendError(
            res,
            409,
            'Another customer profile already uses this phone number.',
            'CONFLICT'
          );
        }
        customer.phone = newCanonical;
      }
    }

    if (updateData.name !== undefined) customer.name = updateData.name;
    if (updateData.email !== undefined) customer.email = updateData.email;
    if (updateData.notes !== undefined) customer.notes = updateData.notes;
    if (updateData.tags !== undefined) customer.tags = updateData.tags;
    if (updateData.preferredBarberId !== undefined) {
      customer.preferredBarberId = updateData.preferredBarberId;
    }
    if (updateData.preferredServiceIds !== undefined) {
      customer.preferredServiceIds = updateData.preferredServiceIds;
    }
    if (updateData.whatsappConsent !== undefined) {
      customer.whatsappConsent = updateData.whatsappConsent;
    }
    if (updateData.isFlagged !== undefined) {
      customer.isFlagged = updateData.isFlagged;
      customer.flagReason = updateData.flagReason || (updateData.isFlagged ? 'Staff Flagged' : '');
    }

    await customer.save();
    await recalculateCustomerStats(customer._id);

    return sendSuccess(res, customer, 200, 'Customer profile updated successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Permanently anonymize customer data (Privacy/Right to be Forgotten)
 * Owner only
 */
export async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid customer ID format', 'INVALID_ID');
    }

    // Only owner can delete customer data
    if (req.user?.role !== 'owner') {
      return sendError(
        res,
        403,
        'Only shop owners have permission to delete customer records.',
        'FORBIDDEN'
      );
    }

    const anonymized = await anonymizeCustomer(id);
    if (!anonymized) {
      return sendError(res, 404, 'Customer not found', 'NOT_FOUND');
    }

    return sendSuccess(
      res,
      null,
      200,
      'Customer profile and associated records have been permanently anonymized.'
    );
  } catch (error) {
    return next(error);
  }
}
