import mongoose from 'mongoose';

const loyaltyHistorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['earn', 'redeem', 'reverse', 'adjust'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    actor: {
      type: String,
      default: 'system',
    },
    createdAt: {
      type: Date,
      default: Date.now,
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

const loyaltyAccountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
    history: {
      type: [loyaltyHistorySchema],
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

loyaltyAccountSchema.index({ customerId: 1 });

export const LoyaltyAccount = mongoose.model('LoyaltyAccount', loyaltyAccountSchema);

