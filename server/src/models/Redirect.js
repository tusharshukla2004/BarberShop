import mongoose from 'mongoose';

const redirectSchema = new mongoose.Schema(
  {
    fromPath: {
      type: String,
      required: [true, 'Source path is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    toPath: {
      type: String,
      required: [true, 'Destination path is required'],
      trim: true,
    },
    statusCode: {
      type: Number,
      enum: [301, 302, 410],
      default: 301,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hitCount: {
      type: Number,
      default: 0,
    },
    lastHitAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Redirect = mongoose.models.Redirect || mongoose.model('Redirect', redirectSchema);
export default Redirect;

