import mongoose from 'mongoose';

const shopHourSchema = new mongoose.Schema(
  {
    days: { type: String, required: true },
    time: { type: String, required: true },
  },
  { _id: false }
);

export const DEFAULT_MESSAGE_TEMPLATES = {
  confirmation:
    'Hello {name}! Your appointment at {shopName} is confirmed.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n🔗 Manage / Reschedule: {manageLink}\n\n📍 Address: {address}\n🗺️ Maps: {mapsLink}\n\nTo make any changes, use the link above or reply to this WhatsApp message. See you soon!',
  reminder:
    'Hello {name}! This is a friendly reminder that your grooming session at {shopName} is scheduled.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n\nPlease arrive 5 minutes early. Let us know if you need any adjustments!',
  reschedule:
    'Hello {name}! Your appointment at {shopName} has been rescheduled.\n\n📅 New Date: {date}\n⏰ New Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\nThank you! We look forward to welcoming you.',
  cancellation:
    'Hello {name}! Your booking (Ref: {bookingRef}) at {shopName} has been cancelled.\n\nTo book a new appointment, visit our website anytime or message us here. Thank you!',
  review_request:
    'Hello {name}! Thank you for visiting {shopName}! We hope you enjoyed your service.\n\nYour feedback means a lot to us. Please take a minute to leave a review:\n⭐ {reviewLink}\n\nHave a great day ahead!',
  running_late:
    'Hello {name}! Update from {shopName}: our chairs are running slightly behind and your appointment may start 10-15 minutes late. We sincerely apologize for the wait and will attend to you shortly!',
  queue_turn_near:
    'Hello {name}! Your turn at {shopName} is approaching (Token #{tokenNumber}). Please proceed to the waiting area. Service: {service}. Barber: {barber}. Thank you!',
  rebooking_nudge:
    'Hello {name}! Checking in from {shopName}—your last visit was about {lastVisitAgo}. Keep your look sharp and book your next appointment today: {bookingLink}',
  birthday_greeting:
    'Happy Birthday {name}! 🎂 Warm wishes from the team at {shopName}. Treat yourself to a premium grooming session today: {bookingLink}',
};

const messageTemplatesSchema = new mongoose.Schema(
  {
    confirmation: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.confirmation },
    reminder: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.reminder },
    reschedule: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.reschedule },
    cancellation: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.cancellation },
    review_request: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.review_request },
    running_late: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.running_late },
    queue_turn_near: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.queue_turn_near },
    rebooking_nudge: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.rebooking_nudge },
    birthday_greeting: { type: String, default: DEFAULT_MESSAGE_TEMPLATES.birthday_greeting },
  },
  { _id: false }
);

const queueSettingsSchema = new mongoose.Schema(
  {
    walkInsEnabled: { type: Boolean, default: true },
    maxQueueLength: { type: Number, default: 20 },
    publicQueueEnabled: { type: Boolean, default: true },
    bufferMinutes: { type: Number, default: 5 },
    stopAcceptingBeforeClosingMinutes: { type: Number, default: 45 },
  },
  { _id: false }
);

const paymentSettingsSchema = new mongoose.Schema(
  {
    paymentsEnabled: { type: Boolean, default: false },
    paymentMode: { type: String, enum: ['none', 'deposit', 'full'], default: 'none' },
    depositType: { type: String, enum: ['flat', 'percent'], default: 'percent' },
    depositValue: { type: Number, default: 20 },
    minimumServicePrice: { type: Number, default: 0 },
    refundPolicyHours: { type: Number, default: 2 },
    refundPolicyText: {
      en: {
        type: String,
        default:
          'Free cancellation up to 2 hours prior to scheduled appointment for full deposit refund.',
      },
      hi: {
        type: String,
        default:
          'Free cancellation up to 2 hours prior to scheduled appointment for full deposit refund.',
      },
    },
    holdTimeoutMinutes: { type: Number, default: 10 },
  },
  { _id: false }
);

const loyaltySettingsSchema = new mongoose.Schema(
  {
    loyaltyEnabled: { type: Boolean, default: false },
    mode: { type: String, enum: ['stamps', 'points'], default: 'stamps' },
    stampsForReward: { type: Number, default: 10, min: 1 },
    rewardDefinition: {
      type: {
        type: String,
        enum: ['free_service', 'flat_discount', 'percent_discount'],
        default: 'free_service',
      },
      value: { type: Number, default: 0 },
      serviceId: { type: String, default: null },
    },
    stampsPerBooking: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const rebookingSettingsSchema = new mongoose.Schema(
  {
    rebookingNudgeDays: { type: Number, default: 28, min: 7 },
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
    whatsappNumber: {
      type: String,
      default: '919876543210',
      trim: true,
    },
    googleReviewLink: {
      type: String,
      default: 'https://g.page/r/modern-mane-reviews',
      trim: true,
    },
    messageTemplates: {
      type: messageTemplatesSchema,
      default: () => ({ ...DEFAULT_MESSAGE_TEMPLATES }),
    },
    queueSettings: {
      type: queueSettingsSchema,
      default: () => ({}),
    },
    paymentSettings: {
      type: paymentSettingsSchema,
      default: () => ({}),
    },
    loyaltySettings: {
      type: loyaltySettingsSchema,
      default: () => ({}),
    },
    rebookingSettings: {
      type: rebookingSettingsSchema,
      default: () => ({}),
    },
    policies: {
      cancellationGraceMinutes: { type: Number, default: 120 },
      advanceBookingDays: { type: Number, default: 30 },
      noShowThreshold: { type: Number, default: 3 },
      privacyNotice: {
        type: String,
        default: 'We use your phone number only for booking updates.',
      },
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
export default Settings;
