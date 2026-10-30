import mongoose from 'mongoose';

const workingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    start: {
      type: String,
      default: '09:00',
    },
    end: {
      type: String,
      default: '20:30',
    },
    isWorking: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const barberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Barber name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    photoUrl: {
      type: String,
      required: [true, 'Photo URL is required'],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    specialties: {
      type: [String],
      default: [],
    },
    socials: {
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
    },
    workingHours: {
      type: [workingHourSchema],
      default: [
        { day: 'Monday', start: '09:00', end: '20:30', isWorking: true },
        { day: 'Tuesday', start: '09:00', end: '20:30', isWorking: true },
        { day: 'Wednesday', start: '09:00', end: '20:30', isWorking: true },
        { day: 'Thursday', start: '09:00', end: '20:30', isWorking: true },
        { day: 'Friday', start: '09:00', end: '20:30', isWorking: true },
        { day: 'Saturday', start: '09:00', end: '20:30', isWorking: true },
        { day: 'Sunday', start: '10:00', end: '19:00', isWorking: true },
      ],
    },
    leaveDays: {
      type: [Date],
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

export const Barber = mongoose.model('Barber', barberSchema);
