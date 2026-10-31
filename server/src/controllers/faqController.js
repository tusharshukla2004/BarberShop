import mongoose from 'mongoose';
import { FAQ } from '../models/FAQ.js';
import { sendSuccess, sendError } from '../utils/response.js';

async function findByIdOrCustom(model, id) {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await model.findById(id);
    if (doc) return doc;
  }
  const byId = await model.findById(id).catch(() => null);
  if (byId) return byId;
  return model.findOne({ $or: [{ id }, { _id: id }] }).catch(() => null);
}

/**
 * GET /api/faqs
 * Public FAQs grouped by category
 */
export async function getPublicFaqs(req, res, next) {
  try {
    const faqs = await FAQ.find({ isPublished: true })
      .sort({ category: 1, order: 1 })
      .lean();

    const grouped = faqs.reduce((acc, f) => {
      acc[f.category] = acc[f.category] || [];
      acc[f.category].push(f);
      return acc;
    }, {});

    return sendSuccess(res, { faqs, grouped });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/faqs
 */
export async function listAdminFaqs(req, res, next) {
  try {
    const faqs = await FAQ.find().sort({ category: 1, order: 1 }).lean();
    return sendSuccess(res, faqs);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/faqs
 */
export async function createFaq(req, res, next) {
  try {
    const count = await FAQ.countDocuments({ category: req.body.category });
    const faq = await FAQ.create({
      ...req.body,
      order: req.body.order !== undefined ? req.body.order : count,
    });
    return sendSuccess(res, faq, 201, 'FAQ created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/faqs/:id
 */
export async function updateFaq(req, res, next) {
  try {
    const faq = await findByIdOrCustom(FAQ, req.params.id);
    if (!faq) {
      return sendError(res, 404, 'FAQ not found', 'FAQ_NOT_FOUND');
    }

    Object.assign(faq, req.body);
    await faq.save();

    return sendSuccess(res, faq, 200, 'FAQ updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/faqs/:id
 */
export async function deleteFaq(req, res, next) {
  try {
    const faq = await findByIdOrCustom(FAQ, req.params.id);
    if (!faq) {
      return sendError(res, 404, 'FAQ not found', 'FAQ_NOT_FOUND');
    }
    await faq.deleteOne();
    return sendSuccess(res, null, 200, 'FAQ deleted successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/faqs/reorder
 * Bulk updates orders for drag-to-reorder
 */
export async function reorderFaqs(req, res, next) {
  try {
    const { orders = [] } = req.body;
    const bulkOps = orders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    if (bulkOps.length > 0) {
      await FAQ.bulkWrite(bulkOps);
    }

    const updated = await FAQ.find().sort({ category: 1, order: 1 }).lean();
    return sendSuccess(res, updated, 200, 'FAQs reordered successfully');
  } catch (err) {
    next(err);
  }
}
