import mongoose from 'mongoose';
import { normalizeIndianPhone } from '../utils/whatsapp.js';

const customerStatsSchema = new mongoose.Schema(
  {
    totalVisits: {
      type: Number,
      default: 0,
    },
    completedVisits: {
      type: Number,
      default: 0,
    },
    cancelledCount: {
      type: Number,
      default: 0,
    },
    noShowCount: {
      type: Number,
      default: 0,
    },
    lastVisitAt: {
      type: Date,
      default: null,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      unique: true,
      trim: true,
      set: (val) => {
        if (!val) return val;
        return normalizeIndianPhone(val) || val.replace(/\D/g, '');
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    preferredBarberId: {
      type: String, // Barber ID or string
      default: null,
    },
    preferredServiceIds: {
      type: [String],
      default: [],
    },
    whatsappConsent: {
      type: Boolean,
      default: false,
    },
    stats: {
      type: customerStatsSchema,
      default: () => ({
        totalVisits: 0,
        completedVisits: 0,
        cancelledCount: 0,
        noShowCount: 0,
        lastVisitAt: null,
        totalSpent: 0,
      }),
    },
    isFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: {
      type: String,
      default: '',
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
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

// Indexes
customerSchema.index({ name: 'text', phone: 'text' });
customerSchema.index({ 'stats.lastVisitAt': -1 });
customerSchema.index({ 'stats.totalVisits': -1 });

export const Customer = mongoose.model('Customer', customerSchema);
