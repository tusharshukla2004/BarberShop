import mongoose from 'mongoose';
import { Offer } from '../models/Offer.js';
import { Service } from '../models/Service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateAndCalculateDiscount } from '../utils/offers.js';
import { getKolkataCurrentDateAndMinutes } from '../utils/slots.js';

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
 * GET /api/offers
 * Public active offers inside validity window
 */
export async function getPublicOffers(req, res, next) {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    })
      .sort({ showOnHome: -1, startsAt: -1 })
      .lean();

    return sendSuccess(res, offers);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/offers/validate
 * Validates promo code and calculates discount against booking services and date
 */
export async function validateOfferCode(req, res, next) {
  try {
    const { code, serviceIds = [], date } = req.body;
    if (!code) {
      return sendError(res, 400, 'Promo code is required', 'MISSING_PROMO_CODE');
    }

    const cleanCode = code.trim().toUpperCase();
    const offer = await Offer.findOne({ promoCode: cleanCode });

    if (!offer) {
      return sendSuccess(res, {
        valid: false,
        isValid: false,
        reason: 'Promo code is invalid or does not exist.',
        discountAmount: 0,
        finalPrice: 0,
      });
    }

    // Determine gross price of provided services
    let grossPrice = 0;
    if (Array.isArray(serviceIds) && serviceIds.length > 0) {
      const services = await Service.find({
        $or: [{ id: { $in: serviceIds } }, { _id: { $in: serviceIds.filter((id) => mongoose.Types.ObjectId.isValid(id)) } }],
      }).lean();

      grossPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
    }

    const { dateStr: todayKolkata } = getKolkataCurrentDateAndMinutes();
    const calculation = validateAndCalculateDiscount({
      offer,
      serviceIds,
      totalPrice: grossPrice,
      dateStr: date || todayKolkata,
      nowDate: new Date(),
    });

    return sendSuccess(res, calculation);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/offers
 * Full list of offers with automatic computed status badges (Live, Scheduled, Expired)
 */
export async function listAdminOffers(req, res, next) {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 }).lean();
    const now = new Date();

    const enriched = offers.map((off) => {
      let statusBadge = 'Live';
      const starts = new Date(off.startsAt);
      const ends = new Date(off.endsAt);

      if (!off.isActive) {
        statusBadge = 'Inactive';
      } else if (now < starts) {
        statusBadge = 'Scheduled';
      } else if (now > ends || (typeof off.usageLimit === 'number' && off.usedCount >= off.usageLimit)) {
        statusBadge = 'Expired';
      }

      return {
        ...off,
        statusBadge,
      };
    });

    return sendSuccess(res, enriched);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/offers
 */
export async function createOffer(req, res, next) {
  try {
    const body = req.body;
    if (body.promoCode) {
      body.promoCode = body.promoCode.trim().toUpperCase();
      const existing = await Offer.findOne({ promoCode: body.promoCode });
      if (existing) {
        return sendError(res, 400, 'Promo code already exists. Please choose a unique code.', 'CODE_EXISTS');
      }
    }

    const offer = await Offer.create(body);
    return sendSuccess(res, offer, 201, 'Offer created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/offers/:id
 */
export async function getOfferById(req, res, next) {
  try {
    const offer = await findByIdOrCustom(Offer, req.params.id);
    if (!offer) {
      return sendError(res, 404, 'Offer not found', 'OFFER_NOT_FOUND');
    }
    return sendSuccess(res, offer);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/offers/:id
 */
export async function updateOffer(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body;

    const offer = await findByIdOrCustom(Offer, id);
    if (!offer) {
      return sendError(res, 404, 'Offer not found', 'OFFER_NOT_FOUND');
    }

    if (body.promoCode) {
      body.promoCode = body.promoCode.trim().toUpperCase();
      const existing = await Offer.findOne({
        promoCode: body.promoCode,
        _id: { $ne: offer._id },
      });
      if (existing) {
        return sendError(res, 400, 'Promo code already exists on another offer.', 'CODE_EXISTS');
      }
    }

    Object.assign(offer, body);
    await offer.save();

    return sendSuccess(res, offer, 200, 'Offer updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/offers/:id
 */
export async function deleteOffer(req, res, next) {
  try {
    const offer = await findByIdOrCustom(Offer, req.params.id);
    if (!offer) {
      return sendError(res, 404, 'Offer not found', 'OFFER_NOT_FOUND');
    }
    await offer.deleteOne();
    return sendSuccess(res, null, 200, 'Offer deleted successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/offers/:id/duplicate
 * Clones an existing offer with a duplicate label
 */
export async function duplicateOffer(req, res, next) {
  try {
    const original = await findByIdOrCustom(Offer, req.params.id);
    if (!original) {
      return sendError(res, 404, 'Offer not found', 'OFFER_NOT_FOUND');
    }

    const doc = original.toObject ? original.toObject() : { ...original };
    delete doc._id;
    delete doc.id;
    delete doc.createdAt;
    delete doc.updatedAt;

    doc.title = {
      en: `Copy of ${doc.title.en}`,
      hi: doc.title.hi ? `Copy of ${doc.title.hi}` : `Copy of ${doc.title.en}`,
    };

    if (doc.promoCode) {
      doc.promoCode = `${doc.promoCode}_COPY_${Date.now().toString().slice(-4)}`;
    }

    doc.usedCount = 0;
    const clone = await Offer.create(doc);

    return sendSuccess(res, clone, 201, 'Offer duplicated successfully');
  } catch (err) {
    next(err);
  }
}
