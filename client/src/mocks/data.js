/**
 * Mock data fixtures for Services, Gallery, Customer Reviews, and Barbers
 */

export const mockGalleryItems = [
  {
    id: 'gal-1',
    title: 'Textured Crop & Low Razor Fade',
    category: 'Haircut',
    imageUrl:
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '4/5',
  },
  {
    id: 'gal-2',
    title: 'Classic Side Part & Taper',
    category: 'Haircut',
    imageUrl:
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '4/5',
  },
  {
    id: 'gal-3',
    title: 'Hot Towel Straight Razor Shave',
    category: 'Shave',
    imageUrl:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '4/5',
  },
  {
    id: 'gal-4',
    title: 'Sharp Beard Sculpt & Lineup',
    category: 'Beard',
    imageUrl:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '4/5',
  },
  {
    id: 'gal-5',
    title: 'Modern Pompadour with Mid Fade',
    category: 'Haircut',
    imageUrl:
      'https://images.unsplash.com/photo-1517832606589-7629c3397143?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '4/5',
  },
  {
    id: 'gal-6',
    title: 'Traditional Scissor Cut & Styling',
    category: 'Haircut',
    imageUrl:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '4/5',
  },
  {
    id: 'gal-7',
    title: 'Luxury Facial & Steam Massage',
    category: 'Treatment',
    imageUrl:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '4/5',
  },
  {
    id: 'gal-8',
    title: 'Executive Haircut & Beard Duo',
    category: 'Combo',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    aspectRatio: '4/5',
  },
];

export const mockTestimonials = [
  {
    id: 'rev-1',
    author: 'Vikram Malhotra',
    role: 'Loyal Client of 3 Years',
    rating: 5,
    quote:
      'The attention to detail here is genuinely unparalleled. From the eucalyptus hot towel to the flawless razor taper, this is the only barbershop I trust in Mumbai.',
  },
  {
    id: 'rev-2',
    author: 'Kabir Sen',
    role: 'Creative Director',
    rating: 5,
    quote:
      'Stepping into this lounge feels like a private sanctuary. The master barbers treat their craft with surgical precision and the hospitality is top-tier.',
  },
  {
    id: 'rev-3',
    author: 'Aditya Singhania',
    role: 'Entrepreneur',
    rating: 5,
    quote:
      'Bespoke beard trimming done right. Sharp clean lines, soothing organic balms, and an ambiance where you can genuinely unwind after a grueling week.',
  },
];

export const mockServices = [
  {
    id: 'srv-1',
    name: 'CLASSIC HAIRCUT & STYLING',
    description: 'Precision consultation, razor neckline finish, tonic & hot towel.',
    price: 850,
    durationMinutes: 45,
    category: 'Hair',
  },
  {
    id: 'srv-2',
    name: 'TRADITIONAL HOT TOWEL SHAVE',
    description: 'Pre-shave essential oils, dual hot lather wraps, straight razor glide.',
    price: 650,
    durationMinutes: 35,
    category: 'Shave',
  },
  {
    id: 'srv-3',
    name: 'BEARD SCULPT & LINEUP',
    description: 'Artisanal beard shaping, foil razor detailing, and organic beard butter.',
    price: 550,
    durationMinutes: 30,
    category: 'Beard',
  },
  {
    id: 'srv-4',
    name: 'THE EXECUTIVE COMBO',
    description: 'Haircut, straight razor shave, scalp massage & revitalizing facial towel.',
    price: 1350,
    durationMinutes: 75,
    category: 'Combo',
  },
  {
    id: 'srv-5',
    name: 'HEAD SHAVE WITH HOT LATHER',
    description: 'Full head shave with calming herbal balms and cool moisturizing compress.',
    price: 700,
    durationMinutes: 40,
    category: 'Shave',
  },
  {
    id: 'srv-6',
    name: 'DETOX SCALP & CHARCOAL FACIAL',
    description: 'Deep cleansing steam treatment, clay mask, and pressure-point massage.',
    price: 950,
    durationMinutes: 45,
    category: 'Treatment',
  },
];

export const mockBarbers = [
  {
    id: 'barb-1',
    name: 'Devraj Saxena',
    role: 'Master Craftsman & Founder',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    specialties: ['Classic Scissor Fades', 'Hot Lather Shaves'],
    experience: '14 Years Exp.',
    isActive: true,
    socials: {
      instagram: 'https://instagram.com/devraj.cuts',
      twitter: 'https://twitter.com/devrajcuts',
    },
  },
  {
    id: 'barb-2',
    name: 'Arbaaz Khan',
    role: 'Senior Stylist & Beard Artisan',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    specialties: ['Beard Sculpting', 'Skin Tapers'],
    experience: '9 Years Exp.',
    isActive: true,
    socials: {
      instagram: 'https://instagram.com/arbaazbarber',
    },
  },
  {
    id: 'barb-3',
    name: 'Neil Fernandes',
    role: 'Traditional Barber',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    specialties: ['Textured Crops', 'Head Shaves'],
    experience: '7 Years Exp.',
    isActive: true,
    socials: {
      instagram: 'https://instagram.com/neil.barber',
      twitter: 'https://twitter.com/neilbarber',
    },
  },
  {
    id: 'barb-4',
    name: 'Sameer Sheikh',
    role: 'Grooming Specialist',
    imageUrl:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    specialties: ['Executive Styling', 'Scalp Care'],
    experience: '6 Years Exp.',
    isActive: true,
    socials: {
      instagram: 'https://instagram.com/sameer.grooming',
    },
  },
];

export const joinTeamBgImage =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80';
