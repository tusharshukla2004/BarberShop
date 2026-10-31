import { assets } from '@/assets';

/**
 * Mock data fixtures conforming strictly to src/types/index.js shapes
 */

/** @type {import('@/types').Service[]} */
export const mockServices = [
  {
    id: 'srv-1',
    name: 'HAIRCUT',
    category: 'Hair',
    description: 'Precision haircut customized to your head shape and personal style.',
    price: 40,
    durationMinutes: 45,
    isActive: true,
  },
  {
    id: 'srv-2',
    name: 'SHAVE',
    category: 'Shave',
    description: 'Traditional hot lather straight razor shave with cooling post-shave balm.',
    price: 35,
    durationMinutes: 30,
    isActive: true,
  },
  {
    id: 'srv-3',
    name: 'HAIRCUT + SHAVE',
    category: 'Combo',
    description: 'The ultimate signature gentleman grooming package.',
    price: 70,
    durationMinutes: 75,
    isActive: true,
  },
  {
    id: 'srv-4',
    name: 'BEARD TRIM',
    category: 'Beard',
    description: 'Artisanal beard shaping, foil detailing, and razor neckline finish.',
    price: 15,
    durationMinutes: 20,
    isActive: true,
  },
  {
    id: 'srv-5',
    name: 'HEAD SHAVE WITH HOT LATHER',
    category: 'Shave',
    description: 'Full head shave with calming herbal balms and cool moisturizing compress.',
    price: 45,
    durationMinutes: 40,
    isActive: true,
  },
  {
    id: 'srv-6',
    name: 'DETOX SCALP & CHARCOAL FACIAL',
    category: 'Treatment',
    description: 'Deep cleansing steam treatment, clay mask, and pressure-point massage.',
    price: 60,
    durationMinutes: 45,
    isActive: true,
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
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    category: 'Haircut',
    caption: 'Textured Crop & Low Razor Fade',
  },
  {
    id: 'gal-2',
    imageUrl:
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    category: 'Haircut',
    caption: 'Classic Side Part & Taper',
  },
  {
    id: 'gal-3',
    imageUrl:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    category: 'Shave',
    caption: 'Hot Towel Straight Razor Shave',
  },
  {
    id: 'gal-4',
    imageUrl:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    category: 'Beard',
    caption: 'Sharp Beard Sculpt & Lineup',
  },
  {
    id: 'gal-5',
    imageUrl:
      'https://images.unsplash.com/photo-1517832606589-7629c3397143?auto=format&fit=crop&w=800&q=80',
    category: 'Haircut',
    caption: 'Modern Pompadour with Mid Fade',
  },
  {
    id: 'gal-6',
    imageUrl:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    category: 'Haircut',
    caption: 'Traditional Scissor Cut & Styling',
  },
  {
    id: 'gal-7',
    imageUrl:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    category: 'Treatment',
    caption: 'Luxury Facial & Steam Massage',
  },
  {
    id: 'gal-8',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
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
      hi: 'पूरे डिपॉजिट रिफंड के लिए अपॉइंटमेंट से 2 घंटे पहले तक मुफ्त रद्दीकरण।',
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
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80';

export const mockOffers = [
  {
    id: 'off-1',
    _id: 'off-1',
    title: { en: 'Festival Grooming 20% Off', hi: 'त्योहार ग्रूमिंग 20% छूट' },
    description: {
      en: 'Get 20% off on premium haircuts and beard styling packages.',
      hi: 'प्रीमियम हेयरकट और दाढ़ी स्टाइलिंग पर 20% की छूट प्राप्त करें।',
    },
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
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
    title: { en: 'Welcome Gentleman Flat ₹100 Off', hi: 'वेलकम जेंटलमैन ₹100 छूट' },
    description: {
      en: 'Flat ₹100 off on your first grooming session with code WELCOME100.',
      hi: 'कोड WELCOME100 के साथ अपने पहले ग्रूमिंग सत्र पर ₹100 की फ्लैट छूट।',
    },
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
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
    title: { en: 'Signature Combo Grooming Saver', hi: 'सिग्नेचर कॉम्बो सेवर' },
    description: {
      en: 'Special package discount when booking Haircut + Beard trim combo.',
      hi: 'हेयरकट + दाढ़ी ट्रिम कॉम्बो बुक करने पर विशेष छूट।',
    },
    imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
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
      hi: 'क्या मुझे अपॉइंटमेंट की आवश्यकता है या मैं सीधे आ सकता हूँ?',
    },
    answer: {
      en: 'Both! You can book in advance for guaranteed zero-wait chair time, or visit us directly and join our digital walk-in queue.',
      hi: 'दोनों! आप कुर्सी पर शून्य प्रतीक्षा के लिए पहले से बुक कर सकते हैं, या सीधे आकर हमारी डिजिटल कतार में शामिल हो सकते हैं।',
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
      hi: 'क्या मैं अपने पसंदीदा नाई को चुन सकता हूँ?',
    },
    answer: {
      en: 'Absolutely. During booking or upon joining the queue, you can choose any preferred barber or select "Any Available" for the earliest slot.',
      hi: 'बिल्कुल। बुकिंग के दौरान या कतार में शामिल होते समय, आप अपनी पसंद का नाई चुन सकते हैं या जल्द से जल्द स्लॉट के लिए "कोई भी उपलब्ध" चुन सकते हैं।',
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
      hi: 'कौन से भुगतान के तरीके स्वीकार किए जाते हैं?',
    },
    answer: {
      en: 'We accept UPI (Google Pay, PhonePe, Paytm), cash, cards, and digital wallets at checkout.',
      hi: 'हम चेकआउट पर UPI (गूगल पे, फोनपे, पेटीएम), नकद, कार्ड और डिजिटल वॉलेट स्वीकार करते हैं।',
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
      hi: 'आपकी रद्दीकरण और पुनर्निर्धारण नीति क्या है?',
    },
    answer: {
      en: 'You can reschedule or cancel free of charge up to 2 hours before your scheduled appointment time via WhatsApp link or by calling us.',
      hi: 'आप अपने निर्धारित समय से 2 घंटे पहले तक व्हाट्सएप लिंक या हमें कॉल करके नि:शुल्क पुनर्निर्धारित या रद्द कर सकते हैं।',
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
      hi: 'आप स्वच्छता के क्या उपाय अपनाते हैं?',
    },
    answer: {
      en: 'All blades are single-use, scissors and clippers are sanitized in barbicide between every client, and disposable neck strips are used for every service.',
      hi: 'सभी ब्लेड सिंगल-यूज़ हैं, कैंची और क्लिपर्स हर ग्राहक के बीच कीटाणुरहित किए जाते हैं, और हर सेवा के लिए डिस्पोजेबल नेक स्ट्रिप्स का उपयोग किया जाता है।',
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
    name: { en: 'Executive 5x Haircut Pack', hi: 'एग्जीक्यूटिव 5x हेयरकट पैक' },
    description: {
      en: 'Prepay for 5 haircuts and save ₹250.',
      hi: '5 हेयरकट का अग्रिम भुगतान करें और ₹250 बचाएं।',
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
    name: { en: 'Gentleman Grooming 3x Combo', hi: 'जेंटलमैन ग्रूमिंग 3x कॉम्बो' },
    description: {
      en: '3 full haircut + beard styling sessions.',
      hi: '3 संपूर्ण हेयरकट + दाढ़ी स्टाइलिंग सत्र।',
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
    name: { en: 'Black Card VIP Club', hi: 'ब्लैक कार्ड वीआईपी क्लब' },
    description: {
      en: '20% off all styling and complimentary beard styling.',
      hi: 'सभी स्टाइलिंग पर 20% की छूट और मानार्थ दाढ़ी स्टाइलिंग।',
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
      packageName: { en: 'Executive 5x Haircut Pack', hi: 'एग्जीक्यूटिव 5x हेयरकट पैक' },
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
    planName: { en: 'Black Card VIP Club', hi: 'ब्लैक कार्ड वीआईपी क्लब' },
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
