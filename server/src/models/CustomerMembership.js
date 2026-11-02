import mongoose from 'mongoose';

const membershipUsageLogSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    serviceId: {
      type: String,
      default: '',
    },
    benefitType: {
      type: String,
      default: '',
    },
    discountApplied: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    actor: {
      type: String,
      default: 'staff',
    },
    reversed: {
      type: Boolean,
      default: false,
    },
    reversedAt: {
      type: Date,
      default: null,
    },
    reversalReason: {
      type: String,
      default: '',
    },
    reversedBy: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const customerMembershipSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
      index: true,
    },
    planName: {
      en: { type: String, default: 'VIP Membership' },
      hi: { type: String, default: 'VIP Membership' },
    },
    pricePaid: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'online'],
      default: 'cash',
    },
    benefits: {
      type: [
        {
          type: {
            type: String,
            enum: ['discount_percent', 'free_service', 'priority_booking'],
            required: true,
          },
          value: { type: Number, default: 0 },
          serviceIds: { type: [String], default: [] },
        },
      ],
      default: [],
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    endsAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    usageLog: {
      type: [membershipUsageLogSchema],
      default: [],
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
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

customerMembershipSchema.index({ customerId: 1, status: 1 });
customerMembershipSchema.index({ endsAt: 1, status: 1 });

export const CustomerMembership = mongoose.model('CustomerMembership', customerMembershipSchema);

