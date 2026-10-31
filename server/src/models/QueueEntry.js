import mongoose from 'mongoose';

const queueEntrySchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
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
      default: '', // Empty means 'any available barber'
      index: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'in_service', 'done', 'left', 'no_show'],
      default: 'waiting',
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    estimatedStart: {
      type: String,
      default: '',
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['admin', 'kiosk', 'public'],
      default: 'admin',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Queue date is required (YYYY-MM-DD)'],
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

queueEntrySchema.index({ date: 1, status: 1 });
queueEntrySchema.index({ date: 1, tokenNumber: 1 });

export const QueueEntry = mongoose.model('QueueEntry', queueEntrySchema);
