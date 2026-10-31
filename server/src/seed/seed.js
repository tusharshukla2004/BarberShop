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
import { Product } from '../models/Product.js';

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

const seedProducts = [
  {
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
    imageUrl:
      'https://images.unsplash.com/photo-1597854710119-a5a84396736a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 128,
    isBestSeller: true,
    inStock: true,
    order: 1,
  },
  {
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
    imageUrl:
      'https://images.unsplash.com/photo-1608248597359-548451893c83?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewCount: 214,
    isBestSeller: true,
    inStock: true,
    order: 2,
  },
  {
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
    imageUrl:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 89,
    isBestSeller: true,
    inStock: true,
    order: 3,
  },
  {
    name: 'Sea Salt Texturizing Spray',
    category: 'Hair',
    tagline: 'Weightless Volume • Beach Texture',
    price: 750,
    size: '200ml / 6.8 fl oz',
    scent: 'Eucalyptus, Sea Kelp & Citrus',
    description:
      'Infused with Celtic sea salt and dead sea minerals to provide instant gritty texture, root lift, and effortless control without weighing your hair down.',
    ingredients:
      'Purified Aqua, Dead Sea Salt, Organic Kelp Extract, Witch Hazel, Aloe Vera Leaf Juice.',
    howToUse:
      'Spray 4–6 pumps onto damp hair before blow-drying, or onto dry hair for lived-in textured hold.',
    imageUrl:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 96,
    isBestSeller: false,
    inStock: true,
    order: 4,
  },
  {
    name: 'Conditioning Cedarwood Beard Balm',
    category: 'Beard',
    tagline: 'Medium Sculpt • Deep Conditioning',
    price: 800,
    size: '60g / 2.1 oz',
    scent: 'Atlas Cedar & Tobacco Leaf',
    description:
      'Formulated with unrefined Ghanaian shea butter, beeswax, and virgin coconut oil. Delivers light styling control to tame stubborn strays while sealing in vital moisture all day.',
    ingredients:
      'Butyrospermum Parkii (Shea Butter), Cera Alba (Beeswax), Cocos Nucifera (Coconut) Oil, Cedarwood Oil.',
    howToUse:
      'Scrape a thumbnail amount, warm between palms until melted, and work thoroughly through dry beard.',
    imageUrl:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 142,
    isBestSeller: false,
    inStock: true,
    order: 5,
  },
  {
    name: 'Cooling Menthol Post-Shave Tonic',
    category: 'Shave',
    tagline: 'Razor Burn Defense • Pore Tightening',
    price: 890,
    size: '120ml / 4 fl oz',
    scent: 'Menthol, Eucalyptus & Witch Hazel',
    description:
      'A refreshing botanical post-shave astringent splash that instantly calms razor bumps, eliminates burn, and closes pores with zero stinging alcohol burn.',
    ingredients:
      'Hamamelis Virginiana (Witch Hazel) Water, Menthol, Aloe Barbadensis Leaf Juice, Eucalyptus Globulus Oil.',
    howToUse: 'Splash onto freshly shaved skin with clean hands and gently pat dry.',
    imageUrl:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 78,
    isBestSeller: false,
    inStock: true,
    order: 6,
  },
  {
    name: 'Artisanal Double-Edge Safety Razor',
    category: 'Shave',
    tagline: 'Solid Brass Handle • Zero Plastic',
    price: 1650,
    size: 'Precision Machined Weight (95g)',
    scent: 'Metallic Chrome Finish',
    description:
      'Engineered for a lifetime of close, irritation-free shaves. Closed-comb head geometry protects sensitive skin while delivering surgical-level blade glide. Includes 10 Swedish steel replacement blades.',
    ingredients: 'Solid Knurled Brass, Chrome Plating, Swedish Stainless Steel Blades.',
    howToUse:
      'Unscrew head, drop in double-edge blade, screw tight, and shave using light gliding strokes with zero downward pressure.',
    imageUrl:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 165,
    isBestSeller: true,
    inStock: true,
    order: 7,
  },
  {
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
    imageUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewCount: 154,
    isBestSeller: false,
    inStock: true,
    order: 8,
  },
  {
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
    imageUrl:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewCount: 72,
    isBestSeller: true,
    inStock: true,
    order: 9,
  },
];

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

    // 8. Seed Products
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(seedProducts);
    // eslint-disable-next-line no-console
    console.log(`🛍️ Seeded ${insertedProducts.length} apothecary products`);

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
const isDirectCall =
  process.argv[1] &&
  (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/').replace(/^\/+/, '')}` ||
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')));

if (isDirectCall) {
  seedDatabase();
}

export { seedDatabase };
