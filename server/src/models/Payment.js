import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true,
      trim: true,
    },
    amount: {
      type: Number, // in paise
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['deposit', 'full', 'balance'],
      default: 'deposit',
      index: true,
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'],
      default: 'created',
      index: true,
    },
    method: {
      type: String,
      default: '',
      trim: true,
    },
    failureReason: {
      type: String,
      default: '',
      trim: true,
    },
    refundedAmount: {
      type: Number, // in paise
      default: 0,
      min: 0,
    },
    refundReason: {
      type: String,
      default: '',
      trim: true,
    },
    refundId: {
      type: String,
      default: '',
      trim: true,
    },
    rawEvents: {
      type: [mongoose.Schema.Types.Mixed],
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

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
