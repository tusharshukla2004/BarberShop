import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Service } from '../models/Service.js';
import { Barber } from '../models/Barber.js';
import { Settings } from '../models/Settings.js';
import { Offer } from '../models/Offer.js';
import { env } from '../config/env.js';
import {
  calculateDepositRequired,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
  checkRefundEligibility,
} from '../utils/payment.js';
import { validateAndCalculateDiscount } from '../utils/offers.js';
import {
  createRazorpayOrder,
  createRazorpayRefund,
} from '../services/razorpayService.js';
import { cleanExpiredHolds } from '../services/slotHoldService.js';
import {
  findOrCreateCustomer,
  recalculateCustomerStats,
} from '../services/customerService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Helper to find document by MongoDB ObjectId or custom id string
 */
async function findByIdOrCustom(model, id) {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await model.findById(id);
    if (doc) return doc;
  }
  return model.findOne({ id });
}

/**
 * Public: Prepares booking and creates Razorpay order for slot hold
 * POST /api/payments/create-order
 */
export async function createPaymentOrder(req, res, next) {
  try {
    const {
      customerName,
      phone,
      email,
      serviceId,
      barberId,
      date,
      startTime,
      endTime,
      notes,
      whatsappConsent,
      promoCode,
    } = req.body;

    if (!customerName || !phone || !serviceId || !date || !startTime) {
      return sendError(res, 400, 'Missing required booking details', 'MISSING_FIELDS');
    }

    // 1. Resolve Barber & Service
    let barberIdStr = '';
    if (barberId && barberId !== 'any' && barberId !== 'unassigned') {
      const barber = await findByIdOrCustom(Barber, barberId);
      if (!barber) {
        return sendError(res, 404, 'Selected barber was not found', 'BARBER_NOT_FOUND');
      }
      barberIdStr = barber.id || barber._id.toString();
    }

    const service = await findByIdOrCustom(Service, serviceId);
    if (!service) {
      return sendError(res, 404, 'Selected service was not found', 'SERVICE_NOT_FOUND');
    }

    // 2. Clean expired holds immediately
    await cleanExpiredHolds();

    // 3. Conflict check on slot
    if (barberIdStr) {
      const conflict = await Booking.findOne({
        barberId: { $in: [barberId, barberIdStr] },
        date,
        startTime,
        $or: [
          { status: { $in: ['pending', 'confirmed'] } },
          { status: 'pending_payment', expiresAt: { $gt: new Date() } },
        ],
      });

      if (conflict) {
        return sendError(
          res,
          409,
          'This slot is currently held or already booked. Please choose an alternate slot.',
          'SLOT_CONFLICT'
        );
      }
    }

    // 4. Calculate prices and promotional discounts
    const originalPrice = service.price || 0;
    let priceAtBooking = originalPrice;
    let discountAmount = 0;
    let appliedOfferId = null;
    let cleanPromoCode = '';

    if (promoCode) {
      cleanPromoCode = String(promoCode).trim().toUpperCase();
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
          appliedOfferId = offer._id;
          discountAmount = discountCalc.discountAmount;
          priceAtBooking = discountCalc.finalPrice;
        }
      }
    }

    // 5. Fetch Settings & Determine Deposit Requirement
    const settings = (await Settings.findOne()) || {};
    const depositCalc = calculateDepositRequired({
      service,
      priceAtBooking,
      settings,
    });

    // If online payment is not required, client can proceed with standard free booking
    if (!depositCalc.required) {
      return sendSuccess(res, {
        paymentRequired: false,
        depositRequired: false,
        message: 'No online deposit required. You can pay at the salon.',
        priceAtBooking,
      });
    }

    // 6. Resolve customer profile
    let customerId = null;
    try {
      const customer = await findOrCreateCustomer({
        phone,
        name: customerName,
        email,
        whatsappConsent,
        preferredBarberId: barberIdStr || null,
        preferredServiceId: serviceId || null,
      });
      if (customer) customerId = customer._id;
    } catch {
      // Continue even if profile resolution encounters minor edge
    }

    // 7. Calculate Hold Expiry (Default 10 minutes from now)
    const holdMinutes = Number(settings?.paymentSettings?.holdTimeoutMinutes || 10);
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

    // 8. Create Booking with 'pending_payment' status and active hold
    const booking = await Booking.create({
      customerName,
      phone,
      email: email || '',
      customerId,
      serviceId,
      barberId: barberIdStr,
      date,
      startTime,
      endTime: endTime || startTime,
      notes: notes || '',
      whatsappConsent: Boolean(whatsappConsent),
      originalPrice,
      discountAmount,
      appliedOfferId,
      promoCode: cleanPromoCode,
      priceAtBooking,
      amountPaid: 0,
      balanceDue: depositCalc.balanceDue,
      status: 'pending_payment',
      paymentStatus: 'pending',
      expiresAt,
    });

    // 9. Create Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder({
        amountPaise: depositCalc.amountPaise,
        receipt: booking.id,
        notes: {
          bookingId: booking.id,
          customerName,
          phone,
          serviceName: service.name,
        },
      });
    } catch (orderError) {
      // If Razorpay order creation fails, roll back the pending hold booking
      await Booking.findByIdAndDelete(booking._id);
      return sendError(
        res,
        500,
        `Payment gateway order creation failed: ${orderError.message}`,
        'GATEWAY_ERROR'
      );
    }

    // 10. Record initial Payment log
    const payment = await Payment.create({
      bookingId: booking._id,
      razorpayOrderId: razorpayOrder.id,
      amount: depositCalc.amountPaise,
      purpose: depositCalc.purpose,
      status: 'created',
      currency: 'INR',
    });

    return sendSuccess(res, {
      paymentRequired: true,
      booking: booking.toJSON(),
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        keyId: env.RAZORPAY_KEY_ID,
      },
      paymentId: payment.id,
      breakdown: {
        totalPrice: priceAtBooking,
        depositAmount: depositCalc.amount,
        balanceDue: depositCalc.balanceDue,
        purpose: depositCalc.purpose,
      },
      expiresAt: expiresAt.toISOString(),
      holdTimeoutMinutes: holdMinutes,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Public: Verifies Razorpay payment signature and confirms booking
 * POST /api/payments/verify
 */
export async function verifyPayment(req, res, next) {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendError(res, 400, 'Missing verification parameters', 'MISSING_PARAMS');
    }

    // 1. Verify HMAC SHA256 Signature
    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      secret: env.RAZORPAY_KEY_SECRET,
    });

    if (!isValid) {
      await Payment.updateOne(
        { razorpayOrderId },
        {
          $set: {
            status: 'failed',
            failureReason: 'Cryptographic signature verification failed',
          },
        }
      );
      return sendError(
        res,
        400,
        'Invalid payment signature. Payment could not be verified.',
        'INVALID_SIGNATURE'
      );
    }

    // 2. Find associated Payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return sendError(res, 404, 'Payment record not found', 'PAYMENT_NOT_FOUND');
    }

    // 3. Find and verify Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return sendError(res, 404, 'Booking not found', 'BOOKING_NOT_FOUND');
    }

    // If already confirmed, return success idempotently
    if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      return sendSuccess(res, {
        success: true,
        booking: booking.toJSON(),
        payment: payment.toJSON(),
      });
    }

    // 4. Update Payment to captured
    payment.status = 'captured';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.method = req.body.method || 'razorpay';
    await payment.save();

    // 5. Update Booking to confirmed and clear hold
    const paidAmount = payment.amount / 100;
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.amountPaid = paidAmount;
    booking.balanceDue = Math.max(0, (booking.priceAtBooking || 0) - paidAmount);
    booking.expiresAt = null;
    await booking.save();

    // 6. Recalculate customer statistics
    if (booking.customerId) {
      await recalculateCustomerStats(booking.customerId);
    }

    return sendSuccess(res, {
      success: true,
      booking: booking.toJSON(),
      payment: payment.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Public Webhook: Processes async events from Razorpay
 * POST /api/payments/webhook
 */
export async function handlePaymentWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
      secret: env.RAZORPAY_WEBHOOK_SECRET,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
        if (payment) {
          payment.status = 'captured';
          payment.razorpayPaymentId = paymentEntity.id;
          payment.method = paymentEntity.method || payment.method;
          payment.rawEvents.push(payload);
          await payment.save();

          const booking = await Booking.findById(payment.bookingId);
          if (booking && booking.status !== 'confirmed') {
            const paid = paymentEntity.amount / 100;
            booking.status = 'confirmed';
            booking.paymentStatus = 'paid';
            booking.amountPaid = paid;
            booking.balanceDue = Math.max(0, (booking.priceAtBooking || 0) - paid);
            booking.expiresAt = null;
            await booking.save();

            if (booking.customerId) {
              await recalculateCustomerStats(booking.customerId);
            }
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        await Payment.updateOne(
          { razorpayOrderId: paymentEntity.order_id },
          {
            $set: {
              status: 'failed',
              failureReason: paymentEntity.error_description || 'Payment failed',
            },
            $push: { rawEvents: payload },
          }
        );
      }
    } else if (event === 'refund.processed') {
      const refundEntity = payload?.refund?.entity;
      if (refundEntity?.payment_id) {
        const payment = await Payment.findOne({ razorpayPaymentId: refundEntity.payment_id });
        if (payment) {
          const refundPaise = refundEntity.amount || 0;
          payment.refundedAmount = (payment.refundedAmount || 0) + refundPaise;
          payment.status =
            payment.refundedAmount >= payment.amount ? 'refunded' : 'partially_refunded';
          payment.rawEvents.push(payload);
          await payment.save();

          const booking = await Booking.findById(payment.bookingId);
          if (booking) {
            booking.paymentStatus = payment.status;
            booking.amountPaid = Math.max(0, booking.amountPaid - refundPaise / 100);
            booking.balanceDue = Math.max(0, booking.priceAtBooking - booking.amountPaid);
            await booking.save();
          }
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return next(error);
  }
}

/**
 * Admin / Cancel flow: Processes refund via Razorpay API
 * POST /api/admin/payments/:id/refund
 */
export async function refundPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { amountPaise, reason = 'Customer request', bypassPolicy = false } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return sendError(res, 404, 'Payment not found', 'PAYMENT_NOT_FOUND');
    }

    if (payment.status !== 'captured' && payment.status !== 'partially_refunded') {
      return sendError(
        res,
        400,
        `Cannot refund payment with status '${payment.status}'`,
        'INVALID_STATUS'
      );
    }

    const booking = await Booking.findById(payment.bookingId);
    if (!booking) {
      return sendError(res, 404, 'Associated booking not found', 'BOOKING_NOT_FOUND');
    }

    const settings = (await Settings.findOne()) || {};

    // Check policy cancellation window unless admin overrides
    if (!bypassPolicy) {
      const eligibility = checkRefundEligibility({ booking, settings });
      if (!eligibility.eligible) {
        return sendError(
          res,
          400,
          `Cancellation window has passed (${settings.paymentSettings?.refundPolicyHours || 2} hours notice required). Refund denied by policy.`,
          'REFUND_POLICY_EXPIRED'
        );
      }
    }

    // Trigger Razorpay Refund API
    const refundRes = await createRazorpayRefund({
      paymentId: payment.razorpayPaymentId || `pay_mock_${payment.id}`,
      amountPaise,
      notes: { reason, bookingId: booking.id },
    });

    const refundedPaise = amountPaise || payment.amount;
    payment.refundedAmount = (payment.refundedAmount || 0) + refundedPaise;
    payment.status =
      payment.refundedAmount >= payment.amount ? 'refunded' : 'partially_refunded';
    payment.refundReason = reason;
    payment.refundId = refundRes.id;
    await payment.save();

    booking.paymentStatus = payment.status;
    booking.amountPaid = Math.max(0, booking.amountPaid - refundedPaise / 100);
    booking.balanceDue = Math.max(0, (booking.priceAtBooking || 0) - booking.amountPaid);
    await booking.save();

    return sendSuccess(res, {
      success: true,
      refund: refundRes,
      payment: payment.toJSON(),
      booking: booking.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Admin: Lists all payments with filters and pagination
 * GET /api/admin/payments
 */
export async function getPaymentsList(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      search,
      from,
      to,
      purpose,
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (purpose && purpose !== 'all') {
      query.purpose = purpose;
    }
    if (method && method !== 'all') {
      query.method = method;
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // If search term provided, find matching bookings or order IDs
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      const matchingBookings = await Booking.find({
        $or: [{ customerName: regex }, { phone: regex }],
      }).select('_id');

      const bookingIds = matchingBookings.map((b) => b._id);
      query.$or = [
        { razorpayOrderId: regex },
        { razorpayPaymentId: regex },
        { bookingId: { $in: bookingIds } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'bookingId',
          select: 'customerName phone date startTime serviceId barberId priceAtBooking status paymentStatus',
        })
        .lean(),
      Payment.countDocuments(query),
    ]);

    const formatted = payments.map((p) => ({
      ...p,
      id: p._id.toString(),
      booking: p.bookingId
        ? {
            ...p.bookingId,
            id: p.bookingId._id?.toString(),
          }
        : null,
    }));

    return sendSuccess(res, {
      payments: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Admin: Financial reconciliation summary
 * GET /api/admin/payments/reconciliation
 */
export async function getReconciliation(req, res, next) {
  try {
    const { from, to } = req.query;
    const dateQuery = {};
    if (from || to) {
      dateQuery.createdAt = {};
      if (from) dateQuery.createdAt.$gte = new Date(from);
      if (to) dateQuery.createdAt.$lte = new Date(to);
    }

    // Aggregate Payments
    const payments = await Payment.find(dateQuery).lean();

    let collectedOnline = 0;
    let refundedOnline = 0;

    payments.forEach((p) => {
      if (p.status === 'captured') {
        collectedOnline += (p.amount || 0) / 100;
      }
      if (p.refundedAmount > 0) {
        refundedOnline += (p.refundedAmount || 0) / 100;
      }
    });

    // Aggregate Bookings for Expected Total and Shop Collected
    const bookingQuery = { status: { $in: ['confirmed', 'completed'] } };
    if (from || to) {
      bookingQuery.createdAt = dateQuery.createdAt;
    }

    const bookings = await Booking.find(bookingQuery).lean();

    let totalExpected = 0;
    let pendingBalance = 0;
    let collectedAtShop = 0;

    bookings.forEach((b) => {
      const price = b.priceAtBooking || 0;
      totalExpected += price;
      pendingBalance += b.balanceDue || 0;

      // If booking is completed and paid, any difference between price and online paid was collected at shop
      if (b.status === 'completed' && b.balanceDue === 0) {
        collectedAtShop += Math.max(0, price - (b.amountPaid || 0));
      }
    });

    return sendSuccess(res, {
      totalExpected,
      collectedOnline: Math.max(0, collectedOnline - refundedOnline),
      collectedAtShop,
      pendingBalance,
      refundedOnline,
      totalCollected: Math.max(0, collectedOnline - refundedOnline) + collectedAtShop,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Admin: Marks remaining balance as collected at shop
 * PATCH /api/admin/bookings/:id/mark-paid
 */
export async function markPaidAtShop(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return sendError(res, 404, 'Booking not found', 'BOOKING_NOT_FOUND');
    }

    booking.amountPaid = booking.priceAtBooking || 0;
    booking.balanceDue = 0;
    booking.paymentStatus = 'paid';
    await booking.save();

    return sendSuccess(res, {
      success: true,
      booking: booking.toJSON(),
      message: 'Booking balance marked as paid at studio.',
    });
  } catch (error) {
    return next(error);
  }
}

