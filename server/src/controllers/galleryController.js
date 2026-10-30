import { GalleryItem } from '../models/GalleryItem.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getGallery(req, res, next) {
  try {
    const items = await GalleryItem.find().sort({ order: 1, createdAt: -1 });
    return sendSuccess(res, items);
  } catch (error) {
    return next(error);
  }
}

export async function createGalleryItem(req, res, next) {
  try {
    const item = await GalleryItem.create(req.body);
    return sendSuccess(res, item, 201, 'Gallery item created successfully');
  } catch (error) {
    return next(error);
  }
}

export async function updateGalleryItem(req, res, next) {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return sendError(res, 404, 'Gallery item not found', 'NOT_FOUND');
    }
    return sendSuccess(res, item, 200, 'Gallery item updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Gallery item not found', 'NOT_FOUND');
    }
    return sendSuccess(res, item, 200, 'Gallery item deleted successfully');
  } catch (error) {
    return next(error);
  }
}
