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
    'Namaste {name}! Aapka appointment {shopName} me confirm ho gaya hai.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\n📍 Address: {address}\n🗺️ Maps: {mapsLink}\n\nKisi bhi change ke liye hume yahan WhatsApp par reply karein. See you soon!',
  reminder:
    'Namaste {name}! Yeh ek friendly reminder hai ki aapka grooming session {shopName} par scheduled hai.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n\nKripya 5 minute pehle pahuchein. Agar koi change chahiye toh please bataiye!',
  reschedule:
    'Namaste {name}! Aapka {shopName} ka appointment naye samay par reschedule kar diya gaya hai.\n\n📅 Nayi Date: {date}\n⏰ Naya Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\nShukriya! Hum aapka intezar karenge.',
  cancellation:
    'Namaste {name}! Aapka booking (Ref: {bookingRef}) {shopName} par cancel kar diya gaya hai.\n\nNaye appointment ke liye aap kabhi bhi humari website par visit kar sakte hain ya hume yahan message karein. Shukriya!',
  review_request:
    'Namaste {name}! {shopName} visit karne ke liye bohot shukriya! Ummeed hai aapko hamara service aur cut pasand aaya.\n\nAapka feedback hamare liye bohot keemti hai. Kripya 1 minute nikaal kar apna review zaroor dein:\n⭐ {reviewLink}\n\nHave a great day ahead!',
  running_late:
    'Namaste {name}! {shopName} se update: aaj chair thodi busy hone ke karan aapka slot lagbhag 10-15 minute late ho sakta hai. Asuvidha ke liye khed hai. Hum jaldi hi aapko attend karenge!',
  queue_turn_near:
    'Namaste {name}! Aapka turn {shopName} me aane wala hai (Token #{tokenNumber}). Kripya reception/waiting area me rahein. Service: {service}. Barber: {barber}. Dekhne ke liye shukriya!',
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
        default: 'पूरे डिपॉजिट रिफंड के लिए अपॉइंटमेंट से 2 घंटे पहले तक मुफ्त रद्दीकरण।',
      },
    },
    holdTimeoutMinutes: { type: Number, default: 10 },
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
