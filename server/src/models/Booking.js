import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    serviceId: {
      type: String,
      required: [true, 'Service ID is required'],
      index: true,
    },
    barberId: {
      type: String,
      default: '',
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      index: true,
    },
    startTime: {
      type: String, // Format: e.g. "10:00 AM" or "10:00"
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // Format: e.g. "10:45 AM" or "10:45"
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
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

// Prevent double booking at the database level for active appointments
bookingSchema.index(
  { barberId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] },
    },
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
