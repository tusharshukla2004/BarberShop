import mongoose from 'mongoose';

const bilingualStringSchema = new mongoose.Schema(
  {
    en: { type: String, required: true, trim: true },
    hi: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: bilingualStringSchema,
      required: [true, 'Question is required'],
    },
    answer: {
      type: bilingualStringSchema,
      required: [true, 'Answer is required'],
    },
    category: {
      type: String,
      enum: ['Booking', 'Pricing', 'Services', 'Policies', 'Other'],
      default: 'Booking',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isPublished: {
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

faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isPublished: 1, order: 1 });

export const FAQ = mongoose.model('FAQ', faqSchema);

