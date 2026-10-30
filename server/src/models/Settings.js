import mongoose from 'mongoose';

const shopHourSchema = new mongoose.Schema(
  {
    days: { type: String, required: true },
    time: { type: String, required: true },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    shopHours: {
      type: [shopHourSchema],
      default: [
        { days: 'Monday – Friday', time: '9:00 AM – 8:30 PM' },
        { days: 'Saturday', time: '9:00 AM – 8:30 PM' },
        { days: 'Sunday', time: '10:00 AM – 7:00 PM' },
      ],
    },
    holidays: {
      type: [String], // Array of YYYY-MM-DD
      default: ['2026-12-25', '2027-01-01', '2026-08-15'],
    },
    slotLengthMinutes: {
      type: Number,
      default: 30,
      min: 15,
      max: 120,
    },
    policies: {
      cancellationGraceMinutes: { type: Number, default: 120 },
      advanceBookingDays: { type: Number, default: 30 },
      termsNotice: {
        type: String,
        default: 'Free cancellation up to 2 hours prior to scheduled appointment.',
      },
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

export const Settings = mongoose.model('Settings', settingsSchema);
