import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Service } from '../models/Service.js';
import { Barber } from '../models/Barber.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { Review } from '../models/Review.js';
import { Settings, DEFAULT_MESSAGE_TEMPLATES } from '../models/Settings.js';
import { Booking } from '../models/Booking.js';
import { Product } from '../models/Product.js';
import Area from '../models/Area.js';
import Post from '../models/Post.js';
import Redirect from '../models/Redirect.js';
import { backfillCustomers } from './backfillCustomers.js';

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
      'https://picsum.photos/seed/barber10/800/800',
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
      'https://picsum.photos/seed/barber11/800/800',
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
      'https://picsum.photos/seed/barber12/800/800',
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
      'https://picsum.photos/seed/barber13/800/800',
    category: 'Haircut',
    caption: 'Low taper fade with textured top silhouette',
    order: 1,
  },
  {
    imageUrl:
      'https://picsum.photos/seed/barber14/800/800',
    category: 'Beard',
    caption: 'Handcrafted beard trim and natural balm treatment',
    order: 2,
  },
  {
    imageUrl:
      'https://picsum.photos/seed/barber15/800/800',
    category: 'Shave',
    caption: 'Hot lather lathering ritual with authentic sandalwood',
    order: 3,
  },
  {
    imageUrl:
      'https://picsum.photos/seed/barber16/800/800',
    category: 'Haircut',
    caption: 'Classic gentleman side part with high razor shine',
    order: 4,
  },
  {
    imageUrl:
      'https://picsum.photos/seed/barber17/800/800',
    category: 'Shave',
    caption: 'Japanese steel straight razor glide & cool aloe towel',
    order: 5,
  },
  {
    imageUrl:
      'https://picsum.photos/seed/barber18/800/800',
    category: 'Treatment',
    caption: 'Deep cleansing clay treatment and scalp revitalization',
    order: 6,
  },
  {
    imageUrl:
      'https://picsum.photos/seed/barber19/800/800',
    category: 'Combo',
    caption: 'Full bespoke grooming transformation package',
    order: 7,
  },
  {
    imageUrl:
      'https://picsum.photos/seed/barber20/800/800',
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
  whatsappNumber: '919876543210',
  googleReviewLink: 'https://g.page/r/modern-mane-reviews',
  messageTemplates: { ...DEFAULT_MESSAGE_TEMPLATES },
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
      'https://picsum.photos/seed/barber21/800/800',
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
      'https://picsum.photos/seed/barber22/800/800',
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
      'https://picsum.photos/seed/barber23/800/800',
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
      'https://picsum.photos/seed/barber24/800/800',
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
      'https://picsum.photos/seed/barber25/800/800',
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
      'https://picsum.photos/seed/barber26/800/800',
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
      'https://picsum.photos/seed/barber27/800/800',
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
      'https://picsum.photos/seed/barber28/800/800',
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
      'https://picsum.photos/seed/barber29/800/800',
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

    // 1. Seed Owner Admin only if no staff account exists
    const existingStaffCount = await Admin.countDocuments();
    if (existingStaffCount === 0) {
      const adminEmail = (env.ADMIN_EMAIL || env.OWNER_EMAIL).toLowerCase();
      const adminPassword = env.ADMIN_PASSWORD || env.OWNER_PASSWORD;
      const passwordHash = await Admin.hashPassword(adminPassword);
      await Admin.create({
        name: env.OWNER_NAME || 'Owner Admin',
        email: adminEmail,
        passwordHash,
        role: 'owner',
        isActive: true,
        mustChangePassword: false,
      });
      // eslint-disable-next-line no-console
      console.log(`👤 Initial Owner Admin created: ${adminEmail}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`👤 Staff accounts already exist (${existingStaffCount} accounts); preserving credentials.`);
      await Admin.migrateStaffDefaults();
    }

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
        whatsappConsent: true,
      },
    ]);
    // eslint-disable-next-line no-console
    console.log('📅 Seeded initial booking');

    // 8. Seed Products
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(seedProducts);
    // eslint-disable-next-line no-console
    console.log(`🛍️ Seeded ${insertedProducts.length} apothecary products`);

    // 9. Seed Areas (Quality-Checked Local SEO Hubs)
    await Area.deleteMany({});
    const seedAreas = [
      {
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
          {
            question: { en: 'Can I walk in or is an advance appointment required?', hi: 'Are walk-ins welcome?' },
            answer: {
              en: 'We welcome both walk-in clients and online bookings. To skip wait times on weekends, booking online is strongly recommended.',
              hi: 'Both walk-ins and online appointments are warmly welcomed. Online booking is recommended on weekends.',
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
    await Area.insertMany(seedAreas);
    // eslint-disable-next-line no-console
    console.log(`📍 Seeded ${seedAreas.length} local area landing pages`);

    // 10. Seed Blog Posts
    await Post.deleteMany({});
    const seedPosts = [
      {
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
          en: `## Understanding the Fade Spectrum

The fade has evolved from a vintage military standard into the cornerstone of modern men's hairdressing. But not all fades are created equal. The right variation should enhance your cheekbones, balance your jawline, and fit your lifestyle.

### 1. The Low Taper Fade
Best for professional workplaces, boardroom meetings, and square or oblong face shapes. The taper begins subtly right above the ears and neckline, preserving natural hair density on the sides while delivering a crisp clean perimeter.

### 2. The Mid Skin Fade
The most versatile cut in modern barbershop culture. Starting approximately one inch above the ears, it creates a striking gradient between bare skin and scissor-cut top lengths. Ideal for oval and round face shapes seeking vertical balance.

### 3. The High Drop Fade
A bold, angular cut where the taper curves downward behind the crown of the head. It pairs exceptionally well with textured crops, buzz cuts, and structured pompadours.

## How to Communicate with Your Barber

When you sit in the chair at Modern Mane, bring 1 or 2 reference photographs, but be open to your stylist's consultation regarding your crown growth pattern and hair thickness. Regular maintenance every 14 to 21 days keeps the transition seamlessly sharp.`,
          hi: 'Complete guide to fade haircut varieties and selecting the ideal cut for your face structure.',
        },
        coverImage: 'https://picsum.photos/seed/barber30/800/800',
        tags: ['haircut', 'fade', 'styling', 'tips'],
        category: 'haircut',
        author: {
          name: 'Master Barber Ravi',
          role: 'Senior Grooming Expert',
          avatar: 'https://picsum.photos/seed/barber31/800/800',
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 86400000 * 5),
        readingTimeMinutes: 3,
        viewsCount: 142,
        seoTitle: 'How to Choose the Perfect Fade Haircut | Modern Mane Guide',
        seoDescription: 'Master guide to low, mid, and high drop fades. Learn how face shape dictates your ideal taper gradient.',
      },
      {
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
          en: `## Taming Beard Frizz in Tropical Weather

Living in coastal cities like Mumbai poses unique challenges for facial hair: high humidity swells the hair cuticle, while city soot and sweat clog follicles beneath the beard. Here is the daily three-step regimen prescribed by our master barbers.

### 1. Wash with Sulfate-Free Cleanser
Avoid regular hair shampoos which strip away natural sebum. Wash your beard 3 times a week with an organic beard wash infused with tea tree or peppermint oil to gently disinfect pores without drying the skin.

### 2. Lock Moisture with Cold-Pressed Oil
Apply 3 to 4 drops of lightweight jojoba or argan oil onto slightly damp beard hair. Work from the roots outwards using your fingertips, ensuring the skin beneath receives hydration.

### 3. Comb with Wide-Toothed Sandalwood
Plastic combs generate static electricity which exacerbates beard puffiness. A polished wooden comb evenly distributes natural oils and gently untangles knots without snagging.`,
          hi: 'Professional and at-home techniques to keep your beard healthy, clean, and lustrous.',
        },
        coverImage: 'https://picsum.photos/seed/barber32/800/800',
        tags: ['beard', 'grooming', 'oil', 'skincare'],
        category: 'beard',
        author: {
          name: 'Vikram Singh',
          role: 'Master Barber & Stylist',
          avatar: 'https://picsum.photos/seed/barber33/800/800',
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 86400000 * 2),
        readingTimeMinutes: 3,
        viewsCount: 88,
        seoTitle: 'Beard Care Routine for Coastal Weather | Modern Mane',
        seoDescription: 'Combat beard itch, frizz, and dandruff in humid weather with master barber tips and organic oils.',
      },
    ];
    await Post.insertMany(seedPosts);
    // eslint-disable-next-line no-console
    console.log(`📝 Seeded ${seedPosts.length} editorial blog articles`);

    // 11. Seed Redirects
    await Redirect.deleteMany({});
    const seedRedirects = [
      {
        fromPath: '/mens-salon-bandra',
        toPath: '/locations/bandra-west',
        statusCode: 301,
        notes: 'Legacy keyword URL redirect to new area landing page',
      },
      {
        fromPath: '/beard-trim-prices',
        toPath: '/services',
        statusCode: 301,
        notes: 'Old service pricing table path',
      },
      {
        fromPath: '/discontinued-hair-color',
        toPath: '',
        statusCode: 410,
        notes: 'Permanently discontinued chemical hair dye service',
      },
    ];
    await Redirect.insertMany(seedRedirects);
    // eslint-disable-next-line no-console
    console.log(`🔀 Seeded ${seedRedirects.length} technical 301/410 redirect rules`);

    // Backfill customers and visit stats from seeded bookings
    await backfillCustomers();

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
