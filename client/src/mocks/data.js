import { assets } from '@/assets';
import { products as catalogProducts } from '@/features/shop/productsData';

/**
 * Mock data fixtures conforming strictly to src/types/index.js shapes
 */

/** @type {import('@/types').Service[]} */
export const mockServices = [
  {
    id: 'srv-1',
    name: 'CLASSIC HAIRCUT & STYLING',
    category: 'Hair',
    description: 'Precision haircut customized to your head shape and personal style with hot-towel refresh.',
    price: 40,
    durationMinutes: 45,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/fadehaircut/800/600',
  },
  {
    id: 'srv-2',
    name: 'TRADITIONAL HOT TOWEL SHAVE',
    category: 'Shave',
    description: 'Traditional hot lather straight razor shave with calming herbal balms and cool post-shave compress.',
    price: 35,
    durationMinutes: 30,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/hottowelshave/800/600',
  },
  {
    id: 'srv-3',
    name: 'THE EXECUTIVE COMBO',
    category: 'Combo',
    description: 'The ultimate signature gentleman grooming package: tailored haircut, hot-lather shave, and facial steam.',
    price: 70,
    durationMinutes: 75,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/barber12/800/600',
  },
  {
    id: 'srv-4',
    name: 'BEARD SCULPT & LINEUP',
    category: 'Beard',
    description: 'Artisanal beard shaping, foil detailing, razor neckline finish, and organic beard butter.',
    price: 15,
    durationMinutes: 20,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/beardcare/800/600',
  },
  {
    id: 'srv-5',
    name: 'HEAD SHAVE WITH HOT LATHER',
    category: 'Shave',
    description: 'Full head shave with calming herbal balms and cool moisturizing compress.',
    price: 45,
    durationMinutes: 40,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/barber14/800/600',
  },
  {
    id: 'srv-6',
    name: 'DETOX SCALP & CHARCOAL FACIAL',
    category: 'Treatment',
    description: 'Deep cleansing steam treatment, clay mask, and invigorating pressure-point scalp massage.',
    price: 60,
    durationMinutes: 45,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/scalphealth/800/600',
  },
  {
    id: 'srv-7',
    name: 'SKIN FADE & TEXTURED CROP',
    category: 'Hair',
    description: 'Zero foil transition, scissor texturing, matte clay finish, and razor perimeter alignment.',
    price: 45,
    durationMinutes: 50,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/barber10/800/600',
  },
  {
    id: 'srv-8',
    name: 'ROYAL MUSTACHE & BEARD RITUAL',
    category: 'Beard',
    description: 'Hot cedarwood steam, botanical growth serum massage, shaping, and mustache waxing.',
    price: 25,
    durationMinutes: 30,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/barber13/800/600',
  },
  {
    id: 'srv-9',
    name: 'GENTLEMAN RESTORATIVE FACIAL',
    category: 'Treatment',
    description: 'Deep pore exfoliation, cooling aloe-vera compress, and antioxidant face tonic treatment.',
    price: 55,
    durationMinutes: 40,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/barber16/800/600',
  },
  {
    id: 'srv-10',
    name: 'THE SOVEREIGN MASTER RITUAL',
    category: 'Combo',
    description: 'Signature haircut, beard trim & hot-towel shave, organic clay mask, and scalp massage.',
    price: 90,
    durationMinutes: 90,
    isActive: true,
    imageUrl: 'https://picsum.photos/seed/quiffhaircut/800/600',
  },
];

/** @type {import('@/types').Barber[]} */
export const mockBarbers = [
  {
    id: 'barb-1',
    name: 'John Smith',
    role: 'Master Barber',
    photoUrl: assets.barbers.barber1,
    imageUrl: assets.barbers.barber1,
    experienceYears: 12,
    specialties: ['Classic Scissor Fades', 'Hot Lather Shaves'],
    socials: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com/johnsmith.cuts',
    },
    isActive: true,
  },
  {
    id: 'barb-2',
    name: 'Sarah Johnson',
    role: 'Senior Stylist',
    photoUrl: assets.barbers.barber2,
    imageUrl: assets.barbers.barber2,
    experienceYears: 9,
    specialties: ['Beard Sculpting', 'Skin Tapers'],
    socials: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com/sarah.cuts',
    },
    isActive: true,
  },
  {
    id: 'barb-3',
    name: 'Mike Davis',
    role: 'Barber',
    photoUrl: assets.barbers.barber3,
    imageUrl: assets.barbers.barber3,
    experienceYears: 7,
    specialties: ['Textured Crops', 'Head Shaves'],
    socials: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com/mikedavis.barber',
    },
    isActive: true,
  },
];

/** @type {import('@/types').GalleryItem[]} */
export const mockGalleryItems = [
  {
    id: 'gal-1',
    imageUrl:
      'https://picsum.photos/seed/barber10/800/800',
    category: 'Haircut',
    caption: 'Textured Crop & Low Razor Fade',
  },
  {
    id: 'gal-2',
    imageUrl:
      'https://picsum.photos/seed/barber11/800/800',
    category: 'Haircut',
    caption: 'Classic Side Part & Taper',
  },
  {
    id: 'gal-3',
    imageUrl:
      'https://picsum.photos/seed/barber12/800/800',
    category: 'Shave',
    caption: 'Hot Towel Straight Razor Shave',
  },
  {
    id: 'gal-4',
    imageUrl:
      'https://picsum.photos/seed/barber13/800/800',
    category: 'Beard',
    caption: 'Sharp Beard Sculpt & Lineup',
  },
  {
    id: 'gal-5',
    imageUrl:
      'https://picsum.photos/seed/barber14/800/800',
    category: 'Haircut',
    caption: 'Modern Pompadour with Mid Fade',
  },
  {
    id: 'gal-6',
    imageUrl:
      'https://picsum.photos/seed/barber15/800/800',
    category: 'Haircut',
    caption: 'Traditional Scissor Cut & Styling',
  },
  {
    id: 'gal-7',
    imageUrl:
      'https://picsum.photos/seed/barber16/800/800',
    category: 'Treatment',
    caption: 'Luxury Facial & Steam Massage',
  },
  {
    id: 'gal-8',
    imageUrl:
      'https://picsum.photos/seed/barber17/800/800',
    category: 'Combo',
    caption: 'Executive Haircut & Beard Duo',
  },
];

/** @type {import('@/types').Review[]} */
export const mockTestimonials = [
  {
    id: 'rev-1',
    customerName: 'John D.',
    role: 'Regular Client of 5 Years',
    rating: 5,
    text: "I've been coming to this barbershop for over five years now, and I've never been disappointed. The barbers here are skilled, friendly, and always know the latest trends. Every visit is a great experience!",
  },
  {
    id: 'rev-2',
    customerName: 'Kabir Sen',
    role: 'Creative Director',
    rating: 5,
    text: 'Stepping into this lounge feels like a private sanctuary. The master barbers treat their craft with surgical precision and the hospitality is top-tier.',
  },
  {
    id: 'rev-3',
    customerName: 'Aditya Singhania',
    role: 'Entrepreneur',
    rating: 5,
    text: 'Bespoke beard trimming done right. Sharp clean lines, soothing organic balms, and an ambiance where you can genuinely unwind after a grueling week.',
  },
  {
    id: 'rev-4',
    customerName: 'Rohan Mehra',
    role: 'Architect',
    rating: 5,
    text: 'The best scissor haircut in the city. No rushing, flawless fades, and a cup of warm artisanal coffee while you wait. Pure gentleman experience.',
  },
  {
    id: 'rev-5',
    customerName: 'Siddharth Roy',
    role: 'Film Producer',
    rating: 5,
    text: 'The hot lather straight razor shave is transformative. You leave feeling rejuvenated, sharp, and confident. Highest recommendation.',
  },
];

/** @type {import('@/types').Settings} */
export const mockSettings = {
  shopHours: [
    { days: 'Monday – Friday', time: '9:00 AM – 8:30 PM' },
    { days: 'Saturday', time: '8:30 AM – 9:00 PM' },
    { days: 'Sunday', time: '9:30 AM – 7:00 PM' },
  ],
  holidays: ['2026-12-25', '2026-01-01'],
  slotLengthMinutes: 30,
  whatsappNumber: '919876543210',
  googleReviewLink: 'https://g.page/r/modern-mane-reviews',
  messageTemplates: {
    confirmation:
      'Hello {name}! Your appointment at {shopName} is confirmed.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\n📍 Address: {address}\n🗺️ Maps: {mapsLink}\n\nFor any changes, reply to this WhatsApp message. See you soon!',
    reminder:
      'Hello {name}! Friendly reminder that your grooming session at {shopName} is coming up.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n\nPlease arrive 5 minutes early. Let us know if you need any adjustments!',
    reschedule:
      'Hello {name}! Your appointment at {shopName} has been rescheduled.\n\n📅 New Date: {date}\n⏰ New Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\nThank you! We look forward to seeing you.',
    cancellation:
      'Hello {name}! Your booking (Ref: {bookingRef}) at {shopName} has been cancelled.\n\nTo schedule a new appointment, visit our website or message us here. Thank you!',
    review_request:
      'Hello {name}! Thank you for visiting {shopName}! We hope you enjoyed your service.\n\nYour feedback means a lot to us. Please take a minute to leave a review:\n⭐ {reviewLink}\n\nHave a great day ahead!',
    running_late:
      'Hello {name}! Update from {shopName}: our chairs are running slightly behind and your appointment may start 10-15 minutes late. We apologize for the wait and will attend to you shortly!',
  },
  policies: {
    cancelWindowHours: 2,
    depositRequired: false,
    gracePeriodMinutes: 10,
    termsNotice: 'Free cancellation up to 2 hours prior to scheduled appointment.',
  },
  paymentSettings: {
    paymentsEnabled: true,
    paymentMode: 'deposit',
    depositType: 'percent',
    depositValue: 20,
    minimumServicePrice: 300,
    refundPolicyHours: 2,
    refundPolicyText: {
      en: 'Free cancellation up to 2 hours prior to scheduled appointment for full deposit refund.',
      hi: 'Free cancellation up to 2 hours prior to scheduled appointment for full deposit refund.',
    },
    holdTimeoutMinutes: 10,
  },
};

/** @type {import('@/types').Booking[]} */
export const mockBookings = [
  {
    id: 'bk-101',
    customerName: 'Arjun Verma',
    phone: '9876543210',
    email: 'arjun@example.com',
    serviceId: 'srv-1',
    barberId: 'barb-1',
    date: '2026-11-01',
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    status: 'confirmed',
    notes: 'Low fade on sides',
  },
  {
    id: 'bk-102',
    customerName: 'Karan Joshi',
    phone: '9876543211',
    serviceId: 'srv-3',
    barberId: 'barb-2',
    date: '2026-11-01',
    startTime: '11:30 AM',
    endTime: '12:00 PM',
    status: 'confirmed',
  },
];

export const mockCustomers = [
  {
    id: 'cust-101',
    name: 'Arjun Verma',
    phone: '919876543210',
    email: 'arjun@example.com',
    notes: 'Prefers zero skin fade with scissors on top. Drinks cold water.',
    tags: ['VIP', 'Fade', 'Regular'],
    preferredBarberId: 'barb-1',
    preferredServiceIds: ['srv-1'],
    whatsappConsent: true,
    stats: {
      totalVisits: 8,
      completedVisits: 7,
      cancelledCount: 1,
      noShowCount: 0,
      lastVisitAt: '2026-10-25T11:00:00+05:30',
      totalSpent: 4550,
    },
    isFlagged: false,
    flagReason: '',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'cust-102',
    name: 'Karan Joshi',
    phone: '919876543211',
    email: 'karan@example.com',
    notes: 'Beard trim always with hot oil treatment.',
    tags: ['Beard'],
    preferredBarberId: 'barb-2',
    preferredServiceIds: ['srv-3'],
    whatsappConsent: true,
    stats: {
      totalVisits: 4,
      completedVisits: 4,
      cancelledCount: 0,
      noShowCount: 0,
      lastVisitAt: '2026-10-18T14:30:00+05:30',
      totalSpent: 1800,
    },
    isFlagged: false,
    flagReason: '',
    createdAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'cust-103',
    name: 'Vikramaditya Roy',
    phone: '919876543212',
    email: 'vikram@example.com',
    notes: 'Missed appointments twice without calling in advance.',
    tags: ['Flagged'],
    preferredBarberId: 'barb-1',
    preferredServiceIds: ['srv-1'],
    whatsappConsent: false,
    stats: {
      totalVisits: 3,
      completedVisits: 1,
      cancelledCount: 0,
      noShowCount: 2,
      lastVisitAt: '2026-09-02T16:00:00+05:30',
      totalSpent: 650,
    },
    isFlagged: true,
    flagReason: 'Frequent late cancellations & no-shows',
    createdAt: '2026-07-20T09:30:00Z',
  },
];

export const mockQueueEntries = [
  {
    id: 'q-101',
    tokenNumber: 1,
    customerName: 'Samir Khan',
    phone: '9876543220',
    serviceId: 'srv-1',
    barberId: 'barb-1',
    status: 'in_service',
    joinedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    startedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    estimatedStart: '10:00 AM',
    estimatedWaitMinutes: 0,
    source: 'admin',
    notes: 'Classic crop cut',
    date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'q-102',
    tokenNumber: 2,
    customerName: 'Rohan Sharma',
    phone: '9876543221',
    serviceId: 'srv-2',
    barberId: '',
    status: 'waiting',
    joinedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    estimatedStart: '10:30 AM',
    estimatedWaitMinutes: 20,
    source: 'public',
    notes: 'Beard trim',
    date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'q-103',
    tokenNumber: 3,
    customerName: 'Amit Patel',
    phone: '9876543222',
    serviceId: 'srv-1',
    barberId: 'barb-2',
    status: 'waiting',
    joinedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedStart: '11:00 AM',
    estimatedWaitMinutes: 35,
    source: 'admin',
    notes: '',
    date: new Date().toISOString().slice(0, 10),
  },
];

export const joinTeamBgImage =
  'https://picsum.photos/seed/barber18/800/800';

export const mockOffers = [
  {
    id: 'off-1',
    _id: 'off-1',
    title: { en: 'Festival Grooming 20% Off', hi: 'Festival Grooming 20% Off' },
    description: {
      en: 'Get 20% off on premium haircuts and beard styling packages.',
      hi: 'Get 20% off on premium haircuts and beard styling packages.',
    },
    imageUrl: 'https://picsum.photos/seed/barber19/800/800',
    type: 'percent',
    value: 20,
    appliesToServiceIds: [],
    startsAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true,
    showOnHome: true,
    promoCode: 'FESTIVE20',
    usageLimit: 100,
    usedCount: 14,
    daysOfWeek: [],
    statusBadge: 'Live',
  },
  {
    id: 'off-2',
    _id: 'off-2',
    title: { en: 'Welcome Gentleman Flat ₹100 Off', hi: 'Welcome Gentleman Flat ₹100 Off' },
    description: {
      en: 'Flat ₹100 off on your first grooming session with code WELCOME100.',
      hi: 'Flat ₹100 off on your first grooming session with code WELCOME100.',
    },
    imageUrl: 'https://picsum.photos/seed/barber20/800/800',
    type: 'flat',
    value: 100,
    appliesToServiceIds: [],
    startsAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    endsAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    isActive: true,
    showOnHome: true,
    promoCode: 'WELCOME100',
    usageLimit: null,
    usedCount: 38,
    daysOfWeek: [],
    statusBadge: 'Live',
  },
  {
    id: 'off-3',
    _id: 'off-3',
    title: { en: 'Signature Combo Grooming Saver', hi: 'Signature Combo Grooming Saver' },
    description: {
      en: 'Special package discount when booking Haircut + Beard trim combo.',
      hi: 'Special package discount when booking Haircut + Beard trim combo.',
    },
    imageUrl: 'https://picsum.photos/seed/barber21/800/800',
    type: 'combo',
    value: 150,
    appliesToServiceIds: ['srv-1', 'srv-3'],
    startsAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    endsAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    isActive: true,
    showOnHome: false,
    promoCode: 'COMBO150',
    usageLimit: 50,
    usedCount: 9,
    daysOfWeek: [1, 2, 3, 4],
    statusBadge: 'Live',
  },
];

export const mockFaqs = [
  {
    id: 'faq-1',
    _id: 'faq-1',
    question: {
      en: 'Do I need an appointment or can I walk in?',
      hi: 'Do I need an appointment or can I walk in?',
    },
    answer: {
      en: 'Both! You can book in advance for guaranteed zero-wait chair time, or visit us directly and join our digital walk-in queue.',
      hi: 'Both! You can book in advance for guaranteed zero-wait chair time, or visit us directly and join our digital walk-in queue.',
    },
    category: 'Booking',
    order: 1,
    isPublished: true,
  },
  {
    id: 'faq-2',
    _id: 'faq-2',
    question: {
      en: 'Can I choose my favorite barber?',
      hi: 'Can I choose my favorite barber?',
    },
    answer: {
      en: 'Absolutely. During booking or upon joining the queue, you can choose any preferred barber or select "Any Available" for the earliest slot.',
      hi: 'Absolutely. During booking or upon joining the queue, you can choose any preferred barber or select "Any Available" for the earliest slot.',
    },
    category: 'Services',
    order: 1,
    isPublished: true,
  },
  {
    id: 'faq-3',
    _id: 'faq-3',
    question: {
      en: 'What payment methods are accepted?',
      hi: 'What payment methods are accepted?',
    },
    answer: {
      en: 'We accept UPI (Google Pay, PhonePe, Paytm), cash, cards, and digital wallets at checkout.',
      hi: 'We accept UPI (Google Pay, PhonePe, Paytm), cash, cards, and digital wallets at checkout.',
    },
    category: 'Pricing',
    order: 1,
    isPublished: true,
  },
  {
    id: 'faq-4',
    _id: 'faq-4',
    question: {
      en: 'What is your cancellation and reschedule policy?',
      hi: 'What is your cancellation and reschedule policy?',
    },
    answer: {
      en: 'You can reschedule or cancel free of charge up to 2 hours before your scheduled appointment time via WhatsApp link or by calling us.',
      hi: 'You can reschedule or cancel free of charge up to 2 hours before your scheduled appointment time via WhatsApp link or by calling us.',
    },
    category: 'Policies',
    order: 1,
    isPublished: true,
  },
  {
    id: 'faq-5',
    _id: 'faq-5',
    question: {
      en: 'What sanitization and hygiene measures do you follow?',
      hi: 'What sanitization and hygiene measures do you follow?',
    },
    answer: {
      en: 'All blades are single-use, scissors and clippers are sanitized in barbicide between every client, and disposable neck strips are used for every service.',
      hi: 'All blades are single-use, scissors and clippers are sanitized in barbicide between every client, and disposable neck strips are used for every service.',
    },
    category: 'Other',
    order: 1,
    isPublished: true,
  },
];

export const mockPayments = [
  {
    id: 'pay_mock_1',
    _id: 'pay_mock_1',
    bookingId: 'bk-101',
    razorpayOrderId: 'order_mock_101',
    razorpayPaymentId: 'pay_mock_trans_101',
    amount: 13000,
    currency: 'INR',
    purpose: 'deposit',
    status: 'captured',
    method: 'upi',
    refundedAmount: 0,
    createdAt: '2026-10-31T09:00:00.000Z',
    booking: {
      id: 'bk-101',
      customerName: 'Arjun Verma',
      phone: '9876543210',
      date: '2026-11-05',
      startTime: '10:00 AM',
      priceAtBooking: 650,
      status: 'confirmed',
      paymentStatus: 'paid',
    },
  },
  {
    id: 'pay_mock_2',
    _id: 'pay_mock_2',
    bookingId: 'bk-102',
    razorpayOrderId: 'order_mock_102',
    razorpayPaymentId: 'pay_mock_trans_102',
    amount: 8000,
    currency: 'INR',
    purpose: 'deposit',
    status: 'refunded',
    method: 'card',
    refundedAmount: 8000,
    refundReason: 'Customer requested cancellation 24h prior',
    createdAt: '2026-10-30T14:30:00.000Z',
    booking: {
      id: 'bk-102',
      customerName: 'Devraj Saxena',
      phone: '9812345678',
      date: '2026-11-06',
      startTime: '02:00 PM',
      priceAtBooking: 400,
      status: 'cancelled',
      paymentStatus: 'refunded',
    },
  },
];


export const mockPackages = [
  {
    id: 'pkg-1',
    _id: 'pkg-1',
    name: { en: 'Executive 5x Haircut Pack', hi: 'Executive 5x Haircut Pack' },
    description: {
      en: 'Prepay for 5 haircuts and save ₹250.',
      hi: 'Prepay for 5 haircuts and save ₹250.',
    },
    serviceIds: ['srv-1'],
    sessions: 5,
    price: 1750,
    validityDays: 90,
    isActive: true,
  },
  {
    id: 'pkg-2',
    _id: 'pkg-2',
    name: { en: 'Gentleman Grooming 3x Combo', hi: 'Gentleman Grooming 3x Combo' },
    description: {
      en: '3 full haircut + beard styling sessions.',
      hi: '3 full haircut + beard styling sessions.',
    },
    serviceIds: ['srv-3'],
    sessions: 3,
    price: 2400,
    validityDays: 120,
    isActive: true,
  },
];

export const mockMembershipPlans = [
  {
    id: 'plan-1',
    _id: 'plan-1',
    name: { en: 'Black Card VIP Club', hi: 'Black Card VIP Club' },
    description: {
      en: '20% off all styling and complimentary beard styling.',
      hi: '20% off all styling and complimentary beard styling.',
    },
    price: 1499,
    durationDays: 30,
    benefits: [
      { type: 'discount_percent', value: 20, serviceIds: [] },
      { type: 'free_service', value: 0, serviceIds: ['srv-4'] },
    ],
    isActive: true,
  },
];

export const mockCustomerWallet = {
  walletToken: 'mock-pass-token-777',
  birthday: '1995-11-15T00:00:00.000Z',
  packages: [
    {
      id: 'cust-pkg-1',
      _id: 'cust-pkg-1',
      packageName: { en: 'Executive 5x Haircut Pack', hi: 'Executive 5x Haircut Pack' },
      sessionsTotal: 5,
      sessionsUsed: 2,
      sessionsRemaining: 3,
      pricePaid: 1750,
      paymentMethod: 'upi',
      expiresAt: '2027-01-31T23:59:59.000Z',
      status: 'active',
    },
  ],
  membership: {
    id: 'cust-mem-1',
    _id: 'cust-mem-1',
    planName: { en: 'Black Card VIP Club', hi: 'Black Card VIP Club' },
    pricePaid: 1499,
    paymentMethod: 'card',
    endsAt: '2026-12-01T23:59:59.000Z',
    benefits: [
      { type: 'discount_percent', value: 20, serviceIds: [] },
      { type: 'free_service', value: 0, serviceIds: ['srv-4'] },
    ],
    status: 'active',
  },
  loyalty: {
    enabled: true,
    mode: 'stamps',
    balance: 8,
    stampsForReward: 10,
    isRewardReady: false,
    rewardDefinition: {
      type: 'free_service',
      value: 0,
    },
    totalEarned: 18,
    totalRedeemed: 10,
    history: [
      {
        _id: 'lh-1',
        type: 'earn',
        amount: 1,
        notes: 'Haircut appointment',
        createdAt: '2026-10-25T10:00:00.000Z',
      },
    ],
  },
};

/** @type {import('@/types').Area[]} */
export const mockAreas = [
  {
    id: 'area-1',
    _id: 'area-1',
    name: { en: 'Bandra West', hi: 'Bandra West' },
    slug: 'bandra-west',
    landmarks: ['Linking Road', 'Hill Road', 'Bandra Railway Station', 'Clock Tower'],
    description: {
      en: 'Bandra West is Mumbai’s quintessential neighborhood for contemporary lifestyle, seaside heritage, and discerning fashion. Modern Mane brings timeless Italian barber craft, hot towel razor shaves, and sharp low taper fades directly to gentlemen living and working across Bandra West. Enjoy an unhurried, private grooming session with cold brews and vintage music.',
      hi: 'Bandra West is Mumbai’s premier lifestyle and heritage destination. Modern Mane delivers bespoke Italian barber craft, hot towel shaves, and precision styling.',
    },
    directions: {
      en: 'Our studio is located 5 minutes walking distance from Bandra Railway Station (West exit). From Linking Road, head west down Turner Road towards the historic Clock Tower landmark. Dedicated valet parking is provided right outside our entrance at 42 Heritage Lane.',
      hi: 'Located 5 minutes walk from Bandra Railway Station towards Turner Road near the Clock Tower. Complimentary valet parking is available.',
    },
    mapEmbedUrl: 'https://maps.google.com/?q=Bandra+West+Mumbai',
    faqs: [
      {
        question: { en: 'Is valet or dedicated parking available in Bandra West?', hi: 'Is parking available?' },
        answer: {
          en: 'Yes, complimentary valet parking is available for all confirmed appointments at our studio entrance on Heritage Lane.',
          hi: 'Yes, complimentary valet parking is available right at our studio entrance.',
        },
      },
    ],
    isActive: true,
    isPublished: true,
    qualityPassed: true,
    qualityNotes: [],
    order: 1,
    seoTitle: { en: 'Best Men’s Haircut & Barber in Bandra West | Modern Mane', hi: 'Best Men’s Salon in Bandra West' },
    seoDescription: { en: 'Looking for a premier haircut or hot towel shave in Bandra West? Visit Modern Mane on Turner Road near Clock Tower. Book online today.', hi: 'Top gentleman grooming and styling studio in Bandra West.' },
  },
  {
    id: 'area-2',
    _id: 'area-2',
    name: { en: 'Khar West', hi: 'Khar West' },
    slug: 'khar-west',
    landmarks: ['Khar Danda', '14th Road', 'Union Park', 'Khar Station'],
    description: {
      en: 'Situated right adjacent to Bandra, Khar West is renowned for its tranquil residential avenues, boutique cafes, and fashion studios. Clients from Khar West regularly visit Modern Mane for executive grooming combos, beard alignment, and precision scissor tapers tailored to executive standards.',
      hi: 'Renowned for serene residential avenues and upscale cafes. Gentlemen from Khar West visit Modern Mane for unmatched grooming luxury.',
    },
    directions: {
      en: 'From 14th Road or Khar Station, take S.V. Road southward into Turner Road for approximately 800 meters. Turn left into 42 Heritage Lane. Studio is marked by the illuminated gold barber pole.',
      hi: 'Located 800m from Khar Station via S.V. Road heading into Turner Road. Studio is marked by the illuminated gold barber pole.',
    },
    mapEmbedUrl: 'https://maps.google.com/?q=Khar+West+Mumbai',
    faqs: [
      {
        question: { en: 'How far is Modern Mane from Khar Station?', hi: 'How far is Modern Mane from Khar Station?' },
        answer: {
          en: 'We are roughly a 6-minute auto-rickshaw ride or a brisk 12-minute walk from Khar Station West.',
          hi: 'Approximately a 6-minute auto ride or 12-minute walk from Khar Station West.',
        },
      },
    ],
    isActive: true,
    isPublished: true,
    qualityPassed: true,
    qualityNotes: [],
    order: 2,
    seoTitle: { en: 'Luxury Men’s Salon Near Khar West | Modern Mane Studio', hi: 'Luxury Men’s Salon Near Khar West' },
    seoDescription: { en: 'Top-tier gentleman haircuts, beard styling, and head shaves minutes away from Khar West. Valet parking and master stylists.', hi: 'Top-tier haircuts and beard styling studio near Khar West.' },
  },
];

/** @type {import('@/types').BlogPost[]} */
export const mockPosts = [
  {
    id: 'post-1',
    _id: 'post-1',
    title: {
      en: 'How to Choose the Perfect Fade Haircut for Your Face Shape',
      hi: 'How to Choose the Perfect Fade Haircut for Your Face Shape',
    },
    slug: 'how-to-choose-the-perfect-fade-haircut',
    excerpt: {
      en: 'From low skin tapers to high drop fades, discover which fade style accentuates your jawline and personal aesthetic.',
      hi: 'From low skin tapers to high drop fades, discover which fade style accentuates your jawline.',
    },
    content: {
      en: `## Understanding the Fade Spectrum\n\nThe fade has evolved from a vintage military standard into the cornerstone of modern men's hairdressing.\n\n### 1. The Low Taper Fade\nBest for professional workplaces, boardroom meetings, and square or oblong face shapes.\n\n### 2. The Mid Skin Fade\nThe most versatile cut in modern barbershop culture.\n\n## How to Communicate with Your Barber\n\nWhen you sit in the chair at Modern Mane, bring reference photographs and discuss your lifestyle.`,
      hi: 'Complete guide to fade haircut varieties and selecting the ideal cut for your face structure.',
    },
    coverImage: 'https://picsum.photos/seed/fadehaircut/1200/800',
    tags: ['haircut', 'fade', 'styling', 'tips'],
    category: 'haircut',
    author: {
      name: 'Master Barber Ravi',
      role: 'Senior Grooming Expert',
      avatar: 'https://picsum.photos/seed/barber23/800/800',
    },
    status: 'published',
    publishedAt: '2026-10-25T10:00:00.000Z',
    readingTimeMinutes: 3,
    viewsCount: 142,
    seoTitle: 'How to Choose the Perfect Fade Haircut | Modern Mane Guide',
    seoDescription: 'Master guide to low, mid, and high drop fades. Learn how face shape dictates your ideal taper gradient.',
  },
  {
    id: 'post-2',
    _id: 'post-2',
    title: {
      en: 'The Ultimate Beard Care Routine for Humid Coastal Climates',
      hi: 'The Ultimate Beard Care Routine for Humid Coastal Climates',
    },
    slug: 'the-ultimate-beard-care-routine-for-coastal-climates',
    excerpt: {
      en: 'Stop beard itch and humidity frizz with cold-pressed oils, proper hydration, and straight-razor cheek alignment.',
      hi: 'Simple and effective tips to conquer beard itch and frizz in humid weather.',
    },
    content: {
      en: `## Taming Beard Frizz in Tropical Weather\n\nLiving in coastal cities like Mumbai poses unique challenges for facial hair.\n\n### 1. Wash with Sulfate-Free Cleanser\nAvoid regular hair shampoos which strip away natural sebum.\n\n### 2. Lock Moisture with Cold-Pressed Oil\nApply 3 to 4 drops of lightweight jojoba or argan oil onto damp beard hair.`,
      hi: 'Professional and at-home techniques to keep your beard healthy, clean, and lustrous.',
    },
    coverImage: 'https://picsum.photos/seed/beardcare/1200/800',
    tags: ['beard', 'grooming', 'oil', 'skincare'],
    category: 'beard',
    author: {
      name: 'Vikram Singh',
      role: 'Master Barber & Stylist',
      avatar: 'https://picsum.photos/seed/barber25/800/800',
    },
    status: 'published',
    publishedAt: '2026-10-28T10:00:00.000Z',
    readingTimeMinutes: 3,
    viewsCount: 88,
    seoTitle: 'Beard Care Routine for Coastal Weather | Modern Mane',
    seoDescription: 'Combat beard itch, frizz, and dandruff in humid weather with master barber tips and organic oils.',
  },
  {
    id: 'post-3',
    _id: 'post-3',
    title: {
      en: 'Hot Towel Shave: The Complete Guide to a Barbershop-Quality Ritual at Home',
      hi: 'Hot Towel Shave: The Complete Guide to a Barbershop-Quality Ritual at Home',
    },
    slug: 'hot-towel-shave-complete-guide',
    excerpt: {
      en: 'Master the art of the hot towel straight-razor shave from prep to aftercare — smooth skin guaranteed.',
      hi: 'Master the hot towel straight-razor shave from prep to aftercare for smooth skin.',
    },
    content: {
      en: `## The Hot Towel Pre-Shave Ritual\n\nA steamed towel opens pores, softens beard hair, and relaxes facial muscles for a dramatically closer shave.\n\n### Step 1: Steam the Towel\nSoak a clean hand towel in hot water, wring it out, and press it against your face for 60 to 90 seconds.\n\n### Step 2: Apply Pre-Shave Oil\nMassage 4 to 5 drops of lightweight jojoba oil into the beard area before lathering.\n\n### Step 3: Build the Lather\nWhip shave soap or cream with a badger brush in circular motions until you achieve a rich, dense foam.`,
      hi: 'Step-by-step guide to achieving a professional hot towel shave at home.',
    },
    coverImage: 'https://picsum.photos/seed/hottowelshave/1200/800',
    tags: ['shave', 'grooming', 'skincare', 'tips'],
    category: 'styling',
    author: {
      name: 'Master Barber Ravi',
      role: 'Senior Grooming Expert',
      avatar: 'https://picsum.photos/seed/avatar1/300/300',
    },
    status: 'published',
    publishedAt: '2026-10-30T10:00:00.000Z',
    readingTimeMinutes: 4,
    viewsCount: 211,
    seoTitle: 'Hot Towel Shave Guide | Modern Mane Barbershop',
    seoDescription: 'Learn how to perform a professional hot towel straight-razor shave at home with master barber tips.',
  },
  {
    id: 'post-4',
    _id: 'post-4',
    title: {
      en: 'Hair Pomade vs. Clay vs. Wax: Which Styling Product Is Right for You?',
      hi: 'Hair Pomade vs. Clay vs. Wax: Which Styling Product Is Right for You?',
    },
    slug: 'pomade-vs-clay-vs-wax-guide',
    excerpt: {
      en: 'Confused by the grooming aisle? Our master barbers break down every styling formula so you can choose the right hold, shine, and finish every time.',
      hi: 'Our master barbers break down every styling formula to help you choose the right product.',
    },
    content: {
      en: `## The Hold & Shine Matrix\n\nChoosing the wrong styling product is the most common grooming mistake men make.\n\n### Pomade (Oil-Based)\nHigh shine, medium-to-firm hold. Best for slick-backs, side parts, and classic 1950s styles.\n\n### Clay\nMatte finish, strong hold. Ideal for textured crops, modern quiffs, and messy French crops.\n\n### Wax\nNatural sheen, light-to-medium hold. Perfect for layered hairstyles that need definition without stiffness.`,
      hi: 'Complete comparison of pomade, clay, and wax to find the right styling product for your hair.',
    },
    coverImage: 'https://picsum.photos/seed/hairproducts/1200/800',
    tags: ['styling', 'pomade', 'haircut', 'grooming'],
    category: 'styling',
    author: {
      name: 'Vikram Singh',
      role: 'Master Barber & Stylist',
      avatar: 'https://picsum.photos/seed/avatar2/300/300',
    },
    status: 'published',
    publishedAt: '2026-11-01T10:00:00.000Z',
    readingTimeMinutes: 3,
    viewsCount: 174,
    seoTitle: 'Pomade vs Clay vs Wax | Best Hair Styling Products | Modern Mane',
    seoDescription: 'Not sure which hair styling product to use? Compare pomade, clay, wax, and paste with our master barber guide.',
  },
  {
    id: 'post-5',
    _id: 'post-5',
    title: {
      en: 'Scalp Health 101: Why Your Scalp Is the Foundation of Great Hair',
      hi: 'Scalp Health 101: Why Your Scalp Is the Foundation of Great Hair',
    },
    slug: 'scalp-health-guide',
    excerpt: {
      en: 'Flaking, itching, thinning — most hair problems start at the scalp. Here is how to build a healthy scalp routine in five steps.',
      hi: 'Flaking, itching, thinning — most hair problems start at the scalp. Fix them in five steps.',
    },
    content: {
      en: `## Why Scalp Care Is Non-Negotiable\n\nYour scalp is living skin — it needs cleansing, exfoliation, and hydration just like your face.\n\n### Step 1: Switch to a Sulfate-Free Shampoo\nHarsh sulfates strip the protective acid mantle, triggering dryness and flaking.\n\n### Step 2: Clarify Monthly\nUse a scalp-specific detox mask or tea tree clay wash once a month to clear product buildup.`,
      hi: 'A five-step scalp care routine to address flaking, itching, and hair thinning.',
    },
    coverImage: 'https://picsum.photos/seed/scalphealth/1200/800',
    tags: ['grooming', 'haircut', 'skincare'],
    category: 'grooming',
    author: {
      name: 'Master Barber Ravi',
      role: 'Senior Grooming Expert',
      avatar: 'https://picsum.photos/seed/avatar1/300/300',
    },
    status: 'published',
    publishedAt: '2026-11-02T10:00:00.000Z',
    readingTimeMinutes: 3,
    viewsCount: 98,
    seoTitle: 'Scalp Health Guide | Modern Mane Barbershop Blog',
    seoDescription: 'Build a healthy scalp routine that prevents dandruff, hair loss, and itching with master barber tips.',
  },
  {
    id: 'post-6',
    _id: 'post-6',
    title: {
      en: 'The Modern Quiff: How to Cut, Style, and Maintain the Timeless Silhouette',
      hi: 'The Modern Quiff: How to Cut, Style, and Maintain the Timeless Silhouette',
    },
    slug: 'modern-quiff-haircut-guide',
    excerpt: {
      en: "The quiff never goes out of style — but this decade's version is softer, more textured, and demands a specific cutting technique. Here is everything you need to know.",
      hi: 'Everything you need to know about the modern quiff — cutting, styling, and maintenance.',
    },
    content: {
      en: `## Anatomy of the Modern Quiff\n\nThe contemporary quiff combines a high or mid fade on the sides with 3 to 4 inches of length on top swept upward and forward.\n\n### Cutting the Foundation\nAsk your barber for a mid skin fade on the sides and a disconnected top section at 3 to 4 inches.\n\n### Product Selection\nChoose a medium-hold clay or paste for a matte, lived-in texture rather than the lacquered look of older quiff variants.`,
      hi: 'Professional guide to cutting and styling the modern textured quiff haircut.',
    },
    coverImage: 'https://picsum.photos/seed/quiffhaircut/1200/800',
    tags: ['haircut', 'fade', 'styling', 'trends'],
    category: 'haircut',
    author: {
      name: 'Vikram Singh',
      role: 'Master Barber & Stylist',
      avatar: 'https://picsum.photos/seed/avatar2/300/300',
    },
    status: 'published',
    publishedAt: '2026-11-02T14:00:00.000Z',
    readingTimeMinutes: 4,
    viewsCount: 63,
    seoTitle: 'Modern Quiff Haircut Guide | Modern Mane Barbershop',
    seoDescription: "Master the modern quiff haircut with our barber's guide to cutting, styling, and daily maintenance.",
  },
];

/** @type {import('@/types').RedirectRule[]} */
export const mockRedirects = [
  {
    id: 'redir-1',
    _id: 'redir-1',
    fromPath: '/mens-salon-bandra',
    toPath: '/locations/bandra-west',
    statusCode: 301,
    isActive: true,
    hitCount: 38,
    lastHitAt: '2026-10-30T14:20:00.000Z',
    notes: 'Legacy keyword URL redirect to new area landing page',
  },
  {
    id: 'redir-2',
    _id: 'redir-2',
    fromPath: '/discontinued-hair-color',
    toPath: '',
    statusCode: 410,
    isActive: true,
    hitCount: 14,
    lastHitAt: '2026-10-29T11:15:00.000Z',
    notes: 'Permanently discontinued chemical hair dye service',
  },
];

export const mockSeoHealthReport = {
  score: 92,
  totalAudited: 12,
  issuesCount: 1,
  issues: [
    {
      type: 'area',
      id: 'area-3',
      title: 'Area: Juhu Beach',
      slug: 'juhu-beach',
      severity: 'warning',
      problem: 'Short introduction description (18 words; minimum 25 words recommended)',
      url: '/locations/juhu-beach',
    },
  ],
};

export const mockGbpHelpers = {
  reviewLink: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
  businessDescriptions: {
    en: 'Modern Mane is a premier luxury barbershop in Bandra West, Mumbai, offering master haircuts, razor fades, beard sculpting, and hot towel treatments.',
    hi: 'Modern Mane is a premier luxury barbershop in Bandra West, Mumbai, offering master haircuts, razor fades, beard sculpting, and hot towel treatments.',
    characterCountEn: 154,
    characterCountHi: 154,
  },
  services: [
    {
      name: 'HAIRCUT',
      category: 'Hair',
      price: '₹40',
      description: 'Precision haircut customized to your head shape.',
    },
  ],
  faqs: [
    {
      question: 'Do you accept walk-in clients or appointments only?',
      answer: 'We happily accept both walk-in clients and advance appointments. Online booking is recommended on weekends.',
    },
  ],
  postIdeas: [
    {
      type: 'Offer',
      title: 'Festival Grooming Special',
      body: 'Looking for a clean fade before the weekend? Enjoy a refreshing hot towel shave and haircut combo at Modern Mane.',
    },
  ],
  checklist: [
    { id: 'claim', label: 'Claim and verify Google Business Profile', completed: true },
    { id: 'nap', label: 'Verify NAP (Name, Address, Phone) matches website footer identically', completed: true },
    { id: 'qr_review', label: 'Print Counter QR Code and place at checkout desk', completed: false },
  ],
};

export const mockProducts = [
  {
    id: 'prod-1',
    _id: 'prod-1',
    name: 'Matte Clay Pomade',
    category: 'Hair',
    tagline: 'High Hold • Natural Matte Finish',
    price: 850,
    size: '100ml / 3.4 fl oz',
    scent: 'Cedarwood, Amber & Sandalwood',
    description:
      'Formulated with natural bentonite clay, beeswax, and botanical oils. Delivers all-day pliable structure with zero greasy residue. Rinses out effortlessly with warm water.',
    ingredients: 'Bentonite Clay, Kaolin, Beeswax, Jojoba Seed Oil, Cedarwood Essential Oil.',
    howToUse:
      'Rub a dime-sized amount between palms and distribute evenly through towel-dried or dry hair. Style with comb or fingers.',
    imageUrl: '/images/products/matte-clay-pomade.jpg',
    rating: 4.9,
    reviewCount: 128,
    isBestSeller: true,
    inStock: true,
  },
  {
    id: 'prod-2',
    _id: 'prod-2',
    name: 'Organic Sandalwood Beard Oil',
    category: 'Beard',
    tagline: 'Deep Hydration • Itch Relief & Luster',
    price: 950,
    size: '50ml / 1.7 fl oz',
    scent: 'Mysore Sandalwood & Bergamot',
    description:
      'A non-greasy elixir of cold-pressed Moroccan argan oil, golden jojoba, and pure sandalwood. Softens coarse facial whiskers while eliminating beard itch and skin flaking underneath.',
    ingredients:
      'Simmondsia Chinensis (Jojoba) Oil, Argania Spinosa (Argan) Kernel Oil, Sweet Almond Oil, Sandalwood Essential Oil.',
    howToUse:
      'Dispense 3–5 drops into palms and massage upward into beard hair and skin down to roots.',
    imageUrl: '/images/products/sandalwood-beard-oil.jpg',
    rating: 5.0,
    reviewCount: 214,
    isBestSeller: true,
    inStock: true,
  },
  {
    id: 'prod-3',
    _id: 'prod-3',
    name: 'Traditional Straight Razor & Shave Set',
    category: 'Shave',
    tagline: 'Japanese Carbon Steel • Complete Kit',
    price: 2450,
    size: 'Complete 4-Piece Ritual Kit',
    scent: 'Natural Sandalwood Shaving Soap',
    description:
      'The quintessential gentleman’s ritual. Includes our handcrafted folding carbon steel straight razor, synthetic silvertip badger brush, stainless steel lather bowl, and organic shave soap.',
    ingredients:
      'Japanese High-Carbon Steel Blade, Handcrafted Wood Scale, Vegan Badger-Style Fiber.',
    howToUse:
      'Whip hot water and shave soap into a rich lather in the bowl. Apply in circular motions before razor gliding at a 30-degree angle.',
    imageUrl: '/images/products/straight-razor-shave-set.jpg',
    rating: 4.9,
    reviewCount: 89,
    isBestSeller: true,
    inStock: true,
  },
  {
    id: 'prod-4',
    _id: 'prod-4',
    name: 'Sea Salt Texturizing Spray',
    category: 'Hair',
    tagline: 'Weightless Volume • Beach Texture',
    price: 750,
    size: '200ml / 6.8 fl oz',
    scent: 'Eucalyptus, Sea Kelp & Citrus',
    description:
      'Infused with Celtic sea salt and dead sea minerals to provide instant gritty texture, root lift, and effortless control without weighing your hair down.',
    ingredients:
      'Purified Aqua, Dead Sea Salt, Organic Kelp Extract, Witch Kane, Aloe Vera Leaf Juice.',
    howToUse:
      'Spray 4–6 pumps onto damp hair before blow-drying, or onto dry hair for lived-in textured hold.',
    imageUrl: '/images/products/sea-salt-texturizing-spray.jpg',
    rating: 4.8,
    reviewCount: 96,
    isBestSeller: false,
    inStock: true,
  },
  {
    id: 'prod-5',
    _id: 'prod-5',
    name: 'Conditioning Cedarwood Beard Balm',
    category: 'Beard',
    tagline: 'Medium Sculpt • Deep Conditioning',
    price: 800,
    size: '60g / 2.1 oz',
    scent: 'Atlas Cedar & Tobacco Leaf',
    description:
      'Formulated with unrefined Ghanaian shea butter, beeswax, and virgin coconut oil. Delivers light styling control to tame stubborn strays while sealing in vital moisture all day.',
    ingredients:
      'Butyrospermum Parkii (Shea) Butter, Cera Alba, Cocos Nucifera Oil, Cedarwood Essential Oil.',
    howToUse:
      'Warm a thumbnail-sized amount between fingers and brush through beard with thumbs and fingers to shape.',
    imageUrl: '/images/products/cedarwood-beard-balm.jpg',
    rating: 4.9,
    reviewCount: 142,
    isBestSeller: false,
    inStock: true,
  },
  {
    id: 'prod-6',
    _id: 'prod-6',
    name: 'Invigorating Tea Tree Scalp Shampoo',
    category: 'Hair',
    tagline: 'Clarifying • Follicle Stimulation',
    price: 900,
    size: '250ml / 8.5 fl oz',
    scent: 'Peppermint & Australian Tea Tree',
    description:
      'A clarifying, sulfate-free scalp wash powered by Australian tea tree oil and peppermint. Washes away styling product buildup and soothes sensitive scalps without stripping natural moisture.',
    ingredients:
      'Aqua, Cocamidopropyl Betaine, Melaleuca Alternifolia (Tea Tree) Oil, Mentha Piperita Oil.',
    howToUse:
      'Lather generously onto wet hair and massage deeply into scalp for 60 seconds before rinsing thoroughly.',
    imageUrl: '/images/products/tea-tree-scalp-shampoo.jpg',
    rating: 4.7,
    reviewCount: 68,
    isBestSeller: false,
    inStock: true,
  },
  {
    id: 'prod-7',
    _id: 'prod-7',
    name: 'Precision Double-Edge Safety Razor',
    category: 'Shave',
    tagline: 'Heavyweight Brass • Zero Irritation',
    price: 1850,
    size: '110g Solid Weight',
    scent: 'Chrome & Polished Brass',
    description:
      'Engineered with knurled grip brass for maximum balance and precision. Provides an ultra-close shave without ingrown hairs or skin irritation commonly caused by multi-blade cartridges.',
    ingredients: 'Solid Knurled Brass, Chrome Plating, Swedish Stainless Steel Blades.',
    howToUse:
      'Unscrew head, drop in double-edge blade, screw tight, and shave using light gliding strokes with zero downward pressure.',
    imageUrl: '/images/products/double-edge-safety-razor.jpg',
    rating: 4.9,
    reviewCount: 165,
    isBestSeller: true,
    inStock: true,
  },
  {
    id: 'prod-8',
    _id: 'prod-8',
    name: 'Wild Boar Bristle Beard Brush',
    category: 'Accessories',
    tagline: 'Solid Walnut Wood • Stimulates Follicles',
    price: 990,
    size: 'Ergonomic Palm Contour',
    scent: 'Natural Walnut Grain',
    description:
      'Hand-finished walnut timber fitted with first-cut natural wild boar bristles. Evenly distributes natural sebum oils through your beard while untangling knots without tugging or static.',
    ingredients: 'Solid Walnut Wood, 100% Natural Boar Bristle.',
    howToUse:
      'Brush downward with gentle firm strokes daily, preferably after applying beard oil or balm.',
    imageUrl: '/images/products/boar-bristle-beard-brush.jpg',
    rating: 5.0,
    reviewCount: 154,
    isBestSeller: false,
    inStock: true,
  },
  {
    id: 'prod-9',
    _id: 'prod-9',
    name: 'Heritage Full-Grain Leather Dopp Kit',
    category: 'Accessories',
    tagline: 'Hand-Stitched Leather • Waterproof Lining',
    price: 2800,
    size: '10" L x 5" W x 5" H',
    scent: 'Natural Tanned Leather',
    description:
      'Handcrafted from full-grain vegetable-tanned buffalo leather. Features heavy-duty YKK antique brass zippers and a spill-resistant waterproof ballistic nylon interior lining for life on the move.',
    ingredients:
      'Full-Grain Buffalo Hide, Water-Resistant Ballistic Nylon, Solid Brass Hardware.',
    howToUse: 'Pack your razor, pomade, beard oils, and personal travel essentials securely.',
    imageUrl: '/images/products/leather-dopp-kit.jpg',
    rating: 5.0,
    reviewCount: 72,
    isBestSeller: true,
    inStock: true,
  },
  ...catalogProducts.slice(9),
];
