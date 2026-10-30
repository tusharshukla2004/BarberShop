import { Service } from '../models/Service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getServices(req, res, next) {
  try {
    const isStaff = req.user && (req.user.role === 'owner' || req.user.role === 'barber');
    const filter = isStaff ? {} : { isActive: true };
    const services = await Service.find(filter).sort({ price: 1 });
    return sendSuccess(res, services);
  } catch (error) {
    return next(error);
  }
}

export async function createService(req, res, next) {
  try {
    const service = await Service.create(req.body);
    return sendSuccess(res, service, 201, 'Service created successfully');
  } catch (error) {
    return next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return sendError(res, 404, 'Service not found', 'NOT_FOUND');
    }
    return sendSuccess(res, service, 200, 'Service updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return sendError(res, 404, 'Service not found', 'NOT_FOUND');
    }
    return sendSuccess(res, service, 200, 'Service deleted successfully');
  } catch (error) {
    return next(error);
  }
}
