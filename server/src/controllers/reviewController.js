import { Review } from '../models/Review.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getReviews(req, res, next) {
  try {
    const isStaff = req.user && (req.user.role === 'owner' || req.user.role === 'barber');
    const filter = isStaff ? {} : { isApproved: true };
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, reviews);
  } catch (error) {
    return next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const review = await Review.create(req.body);
    return sendSuccess(res, review, 201, 'Review submitted successfully');
  } catch (error) {
    return next(error);
  }
}

export async function updateReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      return sendError(res, 404, 'Review not found', 'NOT_FOUND');
    }
    return sendSuccess(res, review, 200, 'Review updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return sendError(res, 404, 'Review not found', 'NOT_FOUND');
    }
    return sendSuccess(res, review, 200, 'Review deleted successfully');
  } catch (error) {
    return next(error);
  }
}
