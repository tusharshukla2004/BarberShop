import { describe, expect, it } from 'vitest';
import { products } from './productsData';
import {
  getProductFallbackImageUrl,
  getProductImageUrl,
  getShopImageForContent,
  getShopImageForServiceCategory,
  getShopImageForIndex,
  getShopImageDetailsForContent,
  getShopImageDetailsForIndex,
  SHOP_PRODUCT_IMAGES,
} from './productImages';

describe('product image assets', () => {
  it('uses local barbershop product images in the storefront catalog', () => {
    expect(products).toHaveLength(12);
    expect(products.slice(0, 9).every(({ imageUrl }) => imageUrl.startsWith('/images/products/'))).toBe(
      true
    );
    expect(products.slice(9).every(({ imageUrl }) => imageUrl.includes('/assets/gallery/'))).toBe(
      true
    );
  });

  it('replaces legacy random product images with the matching local asset', () => {
    expect(
      getProductImageUrl({
        name: 'Organic Sandalwood Beard Oil',
        category: 'Beard',
        imageUrl: 'https://picsum.photos/seed/beardoil/800/800',
      })
    ).toBe('/images/products/sandalwood-beard-oil.jpg');
  });

  it('keeps valid custom product images and provides a category fallback', () => {
    expect(
      getProductImageUrl({
        name: 'Custom Pomade',
        category: 'Hair',
        imageUrl: 'https://cdn.example.com/custom-pomade.jpg',
      })
    ).toBe('https://cdn.example.com/custom-pomade.jpg');

    expect(getProductFallbackImageUrl({ name: 'Custom Product', category: 'Beard' })).toBe(
      '/images/products/sandalwood-beard-oil.jpg'
    );
  });

  it('uses local shop products to illustrate services by category', () => {
    expect(getShopImageForServiceCategory('Hair')).toBe('/images/products/matte-clay-pomade.jpg');
    expect(getShopImageForServiceCategory('Beard')).toBe('/images/products/sandalwood-beard-oil.jpg');
    expect(getShopImageForServiceCategory('Treatment')).toBe(
      '/images/products/tea-tree-scalp-shampoo.jpg'
    );
    expect(getShopImageForServiceCategory('Unknown')).toBe(
      '/images/products/straight-razor-shave-set.jpg'
    );
  });

  it('provides local shop images for offer cards', () => {
    expect(SHOP_PRODUCT_IMAGES).toHaveLength(10);
    expect(SHOP_PRODUCT_IMAGES.every((imageUrl) => imageUrl.startsWith('/images/products/'))).toBe(
      true
    );
  });

  it('provides stable local product images for gallery and blog content', () => {
    expect(getShopImageForIndex(0)).toBe(SHOP_PRODUCT_IMAGES[0]);
    expect(getShopImageForIndex(SHOP_PRODUCT_IMAGES.length)).toBe(SHOP_PRODUCT_IMAGES[0]);
    expect(getShopImageDetailsForIndex(0).src).toBe(SHOP_PRODUCT_IMAGES[0]);
    expect(getShopImageDetailsForIndex(0).alt).toMatch(/Matte clay pomade/i);
    expect(getShopImageForContent('haircut', 'classic-taper-fade')).toMatch(
      /^\/images\/products\/.+\.jpg$/
    );
    expect(getShopImageForContent('haircut', 'classic-taper-fade')).toBe(
      getShopImageForContent('haircut', 'classic-taper-fade')
    );
    expect(
      getShopImageDetailsForContent('haircut', 'classic-taper-fade').src
    ).toBe(getShopImageForContent('haircut', 'classic-taper-fade'));
  });
});
