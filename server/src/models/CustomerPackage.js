import mongoose from 'mongoose';

const packageUsageLogSchema = new mongoose.Schema(
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

const customerPackageSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
      index: true,
    },
    packageName: {
      en: { type: String, default: 'Prepaid Package' },
      hi: { type: String, default: 'प्रीपेड पैकेज' },
    },
    sessionsTotal: {
      type: Number,
      required: true,
      min: 1,
    },
    sessionsUsed: {
      type: Number,
      default: 0,
      min: 0,
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
    serviceIds: {
      type: [String],
      default: [],
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'exhausted', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    usageLog: {
      type: [packageUsageLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.sessionsRemaining = Math.max(0, (ret.sessionsTotal || 0) - (ret.sessionsUsed || 0));
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.sessionsRemaining = Math.max(0, (ret.sessionsTotal || 0) - (ret.sessionsUsed || 0));
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

customerPackageSchema.virtual('sessionsRemaining').get(function () {
  return Math.max(0, (this.sessionsTotal || 0) - (this.sessionsUsed || 0));
});

customerPackageSchema.index({ customerId: 1, status: 1 });
customerPackageSchema.index({ expiresAt: 1, status: 1 });

export const CustomerPackage = mongoose.model('CustomerPackage', customerPackageSchema);

