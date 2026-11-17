export const SHOP_PRODUCT_IMAGES = [
  '/images/products/matte-clay-pomade.jpg',
  '/images/products/sandalwood-beard-oil.jpg',
  '/images/products/straight-razor-shave-set.jpg',
  '/images/products/sea-salt-texturizing-spray.jpg',
  '/images/products/cedarwood-beard-balm.jpg',
  '/images/products/post-shave-tonic.jpg',
  '/images/products/tea-tree-scalp-shampoo.jpg',
  '/images/products/double-edge-safety-razor.jpg',
  '/images/products/boar-bristle-beard-brush.jpg',
  '/images/products/leather-dopp-kit.jpg',
];

const SHOP_PRODUCT_IMAGE_LABELS = [
  'Matte clay pomade',
  'Sandalwood beard oil',
  'Straight razor shave set',
  'Sea salt texturizing spray',
  'Cedarwood beard balm',
  'Post-shave tonic',
  'Tea tree scalp shampoo',
  'Double-edge safety razor',
  'Boar bristle beard brush',
  'Leather grooming kit',
];

export function getShopImageForIndex(index = 0) {
  const imageIndex = Math.abs(Math.trunc(index)) % SHOP_PRODUCT_IMAGES.length;
  return SHOP_PRODUCT_IMAGES[imageIndex];
}

export function getShopImageDetailsForIndex(index = 0) {
  const imageIndex = Math.abs(Math.trunc(index)) % SHOP_PRODUCT_IMAGES.length;
  return {
    src: SHOP_PRODUCT_IMAGES[imageIndex],
    alt: `Barbershop grooming product: ${SHOP_PRODUCT_IMAGE_LABELS[imageIndex]}`,
  };
}

function getContentImageIndex(category, identifier) {
  const value = `${category || ''}:${identifier || category || ''}`.toLowerCase();
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash % SHOP_PRODUCT_IMAGES.length;
}

export function getShopImageForContent(category, identifier) {
  return getShopImageForIndex(getContentImageIndex(category, identifier));
}

export function getShopImageDetailsForContent(category, identifier) {
  return getShopImageDetailsForIndex(getContentImageIndex(category, identifier));
}

const PRODUCT_IMAGES = {
  'matte clay pomade': '/images/products/matte-clay-pomade.jpg',
  'organic sandalwood beard oil': '/images/products/sandalwood-beard-oil.jpg',
  'traditional straight razor & shave set': '/images/products/straight-razor-shave-set.jpg',
  'sea salt texturizing spray': '/images/products/sea-salt-texturizing-spray.jpg',
  'conditioning cedarwood beard balm': '/images/products/cedarwood-beard-balm.jpg',
  'cooling menthol post-shave tonic': '/images/products/post-shave-tonic.jpg',
  'invigorating tea tree scalp shampoo': '/images/products/tea-tree-scalp-shampoo.jpg',
  'artisanal double-edge safety razor': '/images/products/double-edge-safety-razor.jpg',
  'precision double-edge safety razor': '/images/products/double-edge-safety-razor.jpg',
  'wild boar bristle beard brush': '/images/products/boar-bristle-beard-brush.jpg',
  'heritage full-grain leather dopp kit': '/images/products/leather-dopp-kit.jpg',
};

const CATEGORY_IMAGES = {
  hair: '/images/products/matte-clay-pomade.jpg',
  beard: '/images/products/sandalwood-beard-oil.jpg',
  shave: '/images/products/straight-razor-shave-set.jpg',
  accessories: '/images/products/leather-dopp-kit.jpg',
};

const SERVICE_CATEGORY_IMAGES = {
  hair: PRODUCT_IMAGES['matte clay pomade'],
  beard: PRODUCT_IMAGES['organic sandalwood beard oil'],
  shave: PRODUCT_IMAGES['traditional straight razor & shave set'],
  combo: PRODUCT_IMAGES['traditional straight razor & shave set'],
  treatment: PRODUCT_IMAGES['invigorating tea tree scalp shampoo'],
};

export function getShopImageForServiceCategory(category) {
  return SERVICE_CATEGORY_IMAGES[category?.trim().toLowerCase()] || CATEGORY_IMAGES.shave;
}

export function getProductFallbackImageUrl(product) {
  const name = product?.name?.trim().toLowerCase();
  const category = product?.category?.trim().toLowerCase();

  return PRODUCT_IMAGES[name] || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.shave;
}

export function getProductImageUrl(product) {
  const imageUrl = product?.imageUrl;

  if (typeof imageUrl === 'string' && imageUrl && !/(picsum\.photos|placehold\.co)/i.test(imageUrl)) {
    return imageUrl;
  }

  return getProductFallbackImageUrl(product);
}
