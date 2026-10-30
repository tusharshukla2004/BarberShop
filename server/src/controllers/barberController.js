import { Barber } from '../models/Barber.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getBarbers(req, res, next) {
  try {
    const isStaff = req.user && (req.user.role === 'owner' || req.user.role === 'barber');
    const filter = isStaff ? {} : { isActive: true };
    const barbers = await Barber.find(filter).sort({ experienceYears: -1 });
    return sendSuccess(res, barbers);
  } catch (error) {
    return next(error);
  }
}

export async function createBarber(req, res, next) {
  try {
    const barber = await Barber.create(req.body);
    return sendSuccess(res, barber, 201, 'Barber created successfully');
  } catch (error) {
    return next(error);
  }
}

export async function updateBarber(req, res, next) {
  try {
    const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!barber) {
      return sendError(res, 404, 'Barber not found', 'NOT_FOUND');
    }
    return sendSuccess(res, barber, 200, 'Barber updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function deleteBarber(req, res, next) {
  try {
    const barber = await Barber.findByIdAndDelete(req.params.id);
    if (!barber) {
      return sendError(res, 404, 'Barber not found', 'NOT_FOUND');
    }
    return sendSuccess(res, barber, 200, 'Barber deleted successfully');
  } catch (error) {
    return next(error);
  }
}
