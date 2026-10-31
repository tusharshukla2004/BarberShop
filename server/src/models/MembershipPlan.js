import mongoose from 'mongoose';

const membershipBenefitSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['discount_percent', 'free_service', 'priority_booking'],
      required: true,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceIds: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'Membership English name is required'],
        trim: true,
      },
      hi: {
        type: String,
        required: [true, 'Membership Hindi name is required'],
        trim: true,
      },
    },
    description: {
      en: {
        type: String,
        default: '',
        trim: true,
      },
      hi: {
        type: String,
        default: '',
        trim: true,
      },
    },
    price: {
      type: Number,
      required: [true, 'Membership price is required'],
      min: [0, 'Price cannot be negative'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration days is required'],
      min: [1, 'Duration must be at least 1 day'],
      default: 30,
    },
    benefits: {
      type: [membershipBenefitSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

membershipPlanSchema.index({ isActive: 1, createdAt: -1 });

export const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);

