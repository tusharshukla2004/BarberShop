/**
 * Curated Barbershop Apothecary & Grooming Products
 * Real artisanal products with rich descriptions, specs, and pricing
 */
import { BARBER_GALLERY_IMAGES } from '@/assets';

export const products = [
  {
    id: 'prod-1',
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
    imageUrl: '/images/products/sea-salt-texturizing-spray.jpg',
    rating: 4.8,
    reviewCount: 96,
    isBestSeller: false,
    inStock: true,
  },
  {
    id: 'prod-5',
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
    imageUrl: '/images/products/cedarwood-beard-balm.jpg',
    rating: 4.9,
    reviewCount: 142,
    isBestSeller: false,
    inStock: true,
  },
  {
    id: 'prod-6',
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
    imageUrl: '/images/products/post-shave-tonic.jpg',
    rating: 4.8,
    reviewCount: 78,
    isBestSeller: false,
    inStock: true,
  },
  {
    id: 'prod-7',
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
    imageUrl: '/images/products/double-edge-safety-razor.jpg',
    rating: 4.9,
    reviewCount: 165,
    isBestSeller: true,
    inStock: true,
  },
  {
    id: 'prod-8',
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
  {
    id: 'prod-10',
    name: 'Classic Cut Styling Kit',
    category: 'Hair',
    tagline: 'Barber-finished texture • Everyday hold',
    price: 1290,
    size: '3-Piece Grooming Kit',
    scent: 'Cedarwood & Citrus',
    description:
      'A daily styling set inspired by the clean finishes from our barber chairs, with flexible hold and a natural-looking finish.',
    ingredients: 'Water-based styling clay, botanical shampoo, and a wide-tooth styling comb.',
    howToUse:
      'Cleanse hair, warm a small amount of clay between your palms, then shape and finish with the comb.',
    imageUrl: BARBER_GALLERY_IMAGES[0].src,
    rating: 4.8,
    reviewCount: 43,
    isBestSeller: false,
    inStock: true,
  },
  {
    id: 'prod-11',
    name: 'Beard Shape & Condition Kit',
    category: 'Beard',
    tagline: 'Softens • Shapes • Adds natural sheen',
    price: 1590,
    size: '3-Piece Beard Kit',
    scent: 'Sandalwood & Cedar',
    description:
      'A simple beard-care routine inspired by the shape and finish of a professional barber trim.',
    ingredients: 'Sandalwood beard oil, conditioning balm, and a pocket beard comb.',
    howToUse:
      'Apply a few drops of oil to a clean beard, then use balm and comb to shape as desired.',
    imageUrl: BARBER_GALLERY_IMAGES[5].src,
    rating: 5.0,
    reviewCount: 51,
    isBestSeller: true,
    inStock: true,
  },
  {
    id: 'prod-12',
    name: 'Gentleman’s Shave Ritual Kit',
    category: 'Shave',
    tagline: 'Comfortable lather • Smooth shave',
    price: 2190,
    size: '4-Piece Shave Kit',
    scent: 'Warm Sandalwood',
    description:
      'A considered home-shave set inspired by the hot-towel shave ritual in our barbershop.',
    ingredients: 'Shave soap, soft lather brush, skin-comfort balm, and a stainless-steel razor.',
    howToUse:
      'Build a warm lather with the brush, shave gently, and finish with the skin-comfort balm.',
    imageUrl: BARBER_GALLERY_IMAGES[3].src,
    rating: 4.9,
    reviewCount: 29,
    isBestSeller: false,
    inStock: true,
  },
];
