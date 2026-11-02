import mongoose from 'mongoose';

const areaFaqSchema = new mongoose.Schema(
  {
    question: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, default: '', trim: true },
    },
    answer: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, default: '', trim: true },
    },
  },
  { _id: true }
);

const areaSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'Area English name is required'],
        trim: true,
      },
      hi: {
        type: String,
        default: '',
        trim: true,
      },
    },
    slug: {
      type: String,
      required: [true, 'Area URL slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    landmarks: {
      type: [String],
      default: [],
    },
    description: {
      en: {
        type: String,
        required: [true, 'Area English description is required'],
        trim: true,
      },
      hi: {
        type: String,
        default: '',
        trim: true,
      },
    },
    directions: {
      en: {
        type: String,
        required: [true, 'Directions from this area are required'],
        trim: true,
      },
      hi: {
        type: String,
        default: '',
        trim: true,
      },
    },
    mapEmbedUrl: {
      type: String,
      default: '',
      trim: true,
    },
    faqs: {
      type: [areaFaqSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    qualityPassed: {
      type: Boolean,
      default: false,
    },
    qualityNotes: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      en: { type: String, default: '', trim: true },
      hi: { type: String, default: '', trim: true },
    },
    seoDescription: {
      en: { type: String, default: '', trim: true },
      hi: { type: String, default: '', trim: true },
    },
  },
  {
    timestamps: true,
  }
);

export const Area = mongoose.models.Area || mongoose.model('Area', areaSchema);
export default Area;

