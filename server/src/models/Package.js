import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'Package English name is required'],
        trim: true,
      },
      hi: {
        type: String,
        required: [true, 'Package Hindi name is required'],
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
    serviceIds: {
      type: [String],
      default: [],
    },
    sessions: {
      type: Number,
      required: [true, 'Total sessions count is required'],
      min: [1, 'Must have at least 1 session'],
    },
    price: {
      type: Number,
      required: [true, 'Package price is required'],
      min: [0, 'Price cannot be negative'],
    },
    validityDays: {
      type: Number,
      required: [true, 'Validity days is required'],
      min: [1, 'Must be valid for at least 1 day'],
      default: 90,
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

packageSchema.index({ isActive: 1, createdAt: -1 });

export const Package = mongoose.model('Package', packageSchema);

