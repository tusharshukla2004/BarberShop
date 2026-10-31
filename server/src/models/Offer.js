import mongoose from 'mongoose';

const bilingualStringSchema = new mongoose.Schema(
  {
    en: { type: String, required: true, trim: true },
    hi: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: bilingualStringSchema,
      required: [true, 'Offer title is required'],
    },
    description: {
      type: bilingualStringSchema,
      default: () => ({ en: '', hi: '' }),
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['percent', 'flat', 'free_addon', 'combo', 'info'],
      required: true,
      default: 'percent',
    },
    value: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    appliesToServiceIds: {
      type: [String],
      default: [], // empty means applies to all services
    },
    startsAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    showOnHome: {
      type: Boolean,
      default: false,
    },
    promoCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    daysOfWeek: {
      type: [Number], // 0 = Sunday, 1 = Monday, ... 6 = Saturday
      default: [], // empty means all days
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

// Unique partial index on non-empty promo codes (case-insensitive via uppercase)
offerSchema.index(
  { promoCode: 1 },
  {
    unique: true,
    partialFilterExpression: { promoCode: { $type: 'string', $gt: '' } },
  }
);

offerSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

export const Offer = mongoose.model('Offer', offerSchema);

