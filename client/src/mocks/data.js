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

export const joinTeamBgImage =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80';
