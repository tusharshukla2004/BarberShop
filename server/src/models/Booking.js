import mongoose from 'mongoose';
import crypto from 'crypto';

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    appliedOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null,
      index: true,
    },
    promoCode: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    appliedBenefitType: {
      type: String,
      enum: ['none', 'package', 'membership', 'loyalty_reward', 'offer'],
      default: 'none',
      index: true,
    },
    appliedBenefitDetails: {
      customerPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerPackage', default: null },
      customerMembershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerMembership', default: null },
      rewardRedemptionId: { type: String, default: null },
      notes: { type: String, default: '' },
    },
    priceAtBooking: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceId: {
      type: String,
      required: [true, 'Service ID is required'],
      index: true,
    },
    barberId: {
      type: String,
      default: '',
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      index: true,
    },
    startTime: {
      type: String, // Format: e.g. "10:00 AM" or "10:00"
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // Format: e.g. "10:45 AM" or "10:45"
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'pending_payment'],
      default: 'confirmed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid', 'refunded', 'partially_refunded'],
      default: 'not_required',
      index: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      enum: ['appointment', 'walk_in', 'admin'],
      default: 'appointment',
    },
    whatsappConsent: {
      type: Boolean,
      default: false,
    },
    confirmationSentAt: {
      type: Date,
      default: null,
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
    reviewRequestSentAt: {
      type: Date,
      default: null,
    },
    notifications: {
      type: [
        new mongoose.Schema(
          {
            type: {
              type: String,
              required: true,
            },
            channel: {
              type: String,
              default: 'whatsapp_link',
            },
            sentAt: {
              type: Date,
              default: Date.now,
            },
            by: {
              type: String,
              default: 'staff',
            },
          },
          { _id: true }
        ),
      ],
      default: [],
    },
    bookingRef: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    manageTokenHash: {
      type: String,
      default: null,
      index: true,
    },
    manageTokenExpiresAt: {
      type: Date,
      default: null,
    },
    rescheduleCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.manageTokenHash;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.manageTokenHash;
        return ret;
      },
    },
  }
);

bookingSchema.statics.generateBookingRef = function () {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'MM-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

bookingSchema.statics.hashManageToken = function (token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

bookingSchema.statics.backfillBookingRefs = async function () {
  const bookingsWithoutRef = await this.find({
    $or: [{ bookingRef: null }, { bookingRef: { $exists: false } }],
  });
  for (const b of bookingsWithoutRef) {
    b.bookingRef = this.generateBookingRef();
    await b.save();
  }
};

// Prevent double booking at the database level for active appointments
bookingSchema.index(
  { barberId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed', 'pending_payment'] },
    },
  }
);

// High-performance compound indexes for reports and analytics aggregations
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ date: 1, barberId: 1, status: 1 });
bookingSchema.index({ customerId: 1, date: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
