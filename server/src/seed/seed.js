import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Service } from '../models/Service.js';
import { Barber } from '../models/Barber.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { Review } from '../models/Review.js';
import { Settings } from '../models/Settings.js';
import { Booking } from '../models/Booking.js';

const seedServices = [
  {
    name: 'CLASSIC HAIRCUT & STYLING',
    category: 'Hair',
    description: 'Precision consultation, razor neckline finish, tonic & hot towel.',
    price: 850,
    durationMinutes: 45,
    isActive: true,
  },
  {
    name: 'TRADITIONAL HOT TOWEL SHAVE',
    category: 'Shave',
    description: 'Pre-shave essential oils, dual hot lather wraps, straight razor glide.',
    price: 650,
    durationMinutes: 35,
    isActive: true,
  },
  {
    name: 'BEARD SCULPT & LINEUP',
    category: 'Beard',
    description: 'Artisanal beard shaping, foil razor detailing, and organic beard butter.',
    price: 550,
    durationMinutes: 30,
    isActive: true,
  },
  {
    name: 'THE EXECUTIVE COMBO',
    category: 'Combo',
    description: 'Haircut, straight razor shave, scalp massage & revitalizing facial towel.',
    price: 1350,
    durationMinutes: 75,
    isActive: true,
  },
  {
    name: 'HEAD SHAVE WITH HOT LATHER',
    category: 'Shave',
    description: 'Full head shave with calming herbal balms and cool moisturizing compress.',
    price: 700,
    durationMinutes: 40,
    isActive: true,
  },
  {
    name: 'DETOX SCALP & CHARCOAL FACIAL',
    category: 'Treatment',
    description: 'Deep cleansing steam treatment, clay mask, and pressure-point massage.',
    price: 950,
    durationMinutes: 45,
    isActive: true,
  },
];

const seedBarbers = [
  {
    name: 'Devraj Saxena',
    role: 'Master Craftsman & Founder',
    photoUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    experienceYears: 14,
    specialties: ['Classic Scissor Fades', 'Hot Lather Shaves'],
    socials: {
      instagram: 'https://instagram.com/devraj.cuts',
      twitter: 'https://twitter.com/devrajcuts',
    },
    workingHours: [
      { day: 'Monday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Tuesday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Wednesday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Thursday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Friday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Saturday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Sunday', start: '10:00', end: '19:00', isWorking: true },
    ],
    leaveDays: [],
    isActive: true,
  },
  {
    name: 'Arbaaz Khan',
    role: 'Senior Stylist & Beard Artisan',
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    experienceYears: 9,
    specialties: ['Beard Sculpting', 'Skin Tapers'],
    socials: {
      instagram: 'https://instagram.com/arbaazbarber',
    },
    workingHours: [
      { day: 'Monday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Tuesday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Wednesday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Thursday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Friday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Saturday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Sunday', start: '10:00', end: '19:00', isWorking: false },
    ],
    leaveDays: [],
    isActive: true,
  },
  {
    name: 'Neil Fernandes',
    role: 'Traditional Barber',
    photoUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    experienceYears: 7,
    specialties: ['Textured Crops', 'Head Shaves'],
    socials: {
      instagram: 'https://instagram.com/neilfernandes',
    },
    workingHours: [
      { day: 'Monday', start: '10:00', end: '20:30', isWorking: false },
      { day: 'Tuesday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Wednesday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Thursday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Friday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Saturday', start: '09:00', end: '20:30', isWorking: true },
      { day: 'Sunday', start: '10:00', end: '19:00', isWorking: true },
    ],
    leaveDays: [],
    isActive: true,
  },
];

const seedGallery = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    category: 'Haircut',
    caption: 'Low taper fade with textured top silhouette',
    order: 1,
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    category: 'Beard',
    caption: 'Handcrafted beard trim and natural balm treatment',
    order: 2,
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1517832606589-715753d4f323?auto=format&fit=crop&w=800&q=80',
    category: 'Shave',
    caption: 'Hot lather lathering ritual with authentic sandalwood',
    order: 3,
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    category: 'Haircut',
    caption: 'Classic gentleman side part with high razor shine',
    order: 4,
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    category: 'Shave',
    caption: 'Japanese steel straight razor glide & cool aloe towel',
    order: 5,
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    category: 'Treatment',
    caption: 'Deep cleansing clay treatment and scalp revitalization',
    order: 6,
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80',
    category: 'Combo',
    caption: 'Full bespoke grooming transformation package',
    order: 7,
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1504703395950-b89145a5425b?auto=format&fit=crop&w=800&q=80',
    category: 'Haircut',
    caption: 'Slick pompadour with razor neckline perfection',
    order: 8,
  },
];

const seedReviews = [
  {
    customerName: 'Vikram Malhotra',
    role: 'Creative Director',
    rating: 5,
    text: 'The best hot-towel straight razor shave in Bangalore. Devraj has incredible precision and understands old-school gentleman craftsmanship like no other.',
    isApproved: true,
  },
  {
    customerName: 'Aman Singhal',
    role: 'Architect & Founder',
    rating: 5,
    text: 'A sanctuary in the middle of Indiranagar. The coffee is rich, the barbers take zero shortcuts, and the consultation genuinely changed my everyday style.',
    isApproved: true,
  },
  {
    customerName: 'Rohan Mehra',
    role: 'Fintech Executive',
    rating: 5,
    text: 'Stepping into this shop feels like a bespoke tailoring appointment. Warm towels, authentic leather chairs, and razor work second to none.',
    isApproved: true,
  },
  {
    customerName: 'Karthik Rao',
    role: 'Product Designer',
    rating: 5,
    text: 'The beard sculpt and charcoal detox service is indispensable before keynote presentations. Absolutely elevated and refined experience.',
    isApproved: true,
  },
];

const seedSettings = {
  shopHours: [
    { days: 'Monday – Friday', time: '9:00 AM – 8:30 PM' },
    { days: 'Saturday', time: '9:00 AM – 8:30 PM' },
    { days: 'Sunday', time: '10:00 AM – 7:00 PM' },
  ],
  holidays: ['2026-12-25', '2027-01-01', '2026-08-15'],
  slotLengthMinutes: 30,
  policies: {
    cancellationGraceMinutes: 120,
    advanceBookingDays: 30,
    termsNotice: 'Free cancellation up to 2 hours prior to scheduled appointment.',
  },
};

async function seedDatabase() {
  try {
    // eslint-disable-next-line no-console
    console.log('🌱 Starting database seeding...');
    await connectDB();

    // 1. Seed Admin
    await Admin.deleteMany({});
    const passwordHash = await Admin.hashPassword(env.OWNER_PASSWORD);
    await Admin.create({
      name: env.OWNER_NAME,
      email: env.OWNER_EMAIL.toLowerCase(),
      passwordHash,
      role: 'owner',
    });
    // eslint-disable-next-line no-console
    console.log(`👤 Owner Admin seeded: ${env.OWNER_EMAIL}`);

    // 2. Seed Services
    await Service.deleteMany({});
    const insertedServices = await Service.insertMany(seedServices);
    // eslint-disable-next-line no-console
    console.log(`💈 Seeded ${insertedServices.length} services`);

    // 3. Seed Barbers
    await Barber.deleteMany({});
    const insertedBarbers = await Barber.insertMany(seedBarbers);
    // eslint-disable-next-line no-console
    console.log(`✂️ Seeded ${insertedBarbers.length} barbers`);

    // 4. Seed Gallery
    await GalleryItem.deleteMany({});
    const insertedGallery = await GalleryItem.insertMany(seedGallery);
    // eslint-disable-next-line no-console
    console.log(`🖼️ Seeded ${insertedGallery.length} gallery items`);

    // 5. Seed Reviews
    await Review.deleteMany({});
    const insertedReviews = await Review.insertMany(seedReviews);
    // eslint-disable-next-line no-console
    console.log(`⭐ Seeded ${insertedReviews.length} client reviews`);

    // 6. Seed Settings
    await Settings.deleteMany({});
    await Settings.create(seedSettings);
    // eslint-disable-next-line no-console
    console.log('⚙️ Seeded system settings');

    // 7. Seed Sample Bookings
    await Booking.deleteMany({});
    const primaryBarber = insertedBarbers[0];
    const primaryService = insertedServices[0];
    await Booking.create([
      {
        customerName: 'Rahul Verma',
        phone: '+919876543210',
        email: 'rahul.verma@example.com',
        serviceId: primaryService.id,
        barberId: primaryBarber.id,
        date: '2026-11-01',
        startTime: '10:00 AM',
        endTime: '10:45 AM',
        status: 'confirmed',
        notes: 'Requested low scissor taper fade',
      },
    ]);
    // eslint-disable-next-line no-console
    console.log('📅 Seeded initial booking');

    // eslint-disable-next-line no-console
    console.log('🎉 Seeding successfully completed!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  seedDatabase();
}

export { seedDatabase };
