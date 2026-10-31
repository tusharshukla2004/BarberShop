import { useState, useMemo } from 'react';
import { ShoppingBag, Search, Sparkles, Truck, Clock } from 'lucide-react';
import Seo from '@/components/common/Seo';
import PageBanner from '@/components/common/PageBanner';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import { products } from '@/features/shop/productsData';
import { ProductCard } from '@/features/shop/ProductCard';
import { ProductQuickView } from '@/features/shop/ProductQuickView';
import { CartDrawer } from '@/features/shop/CartDrawer';
import { cn } from '@/lib/utils';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const categories = ['All', 'Hair', 'Beard', 'Shave', 'Accessories'];

  // Add to cart handler
  const handleAddToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Filtered & Sorted products
  const displayedProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return result;
  }, [activeCategory, searchQuery, sortBy]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Seo
        title="Grooming Apothecary & Shop | Modern Mane"
        description="Shop artisan pomades, organic sandalwood beard oils, Japanese carbon straight razors, and luxury grooming sets."
        canonicalUrl="/shop"
      />

      {/* Hero Page Banner */}
      <PageBanner
        title="GROOMING APOTHECARY & SHOP"
        subtitle="Formulations crafted with certified organic botanicals and surgical-grade straight razors tested daily by our master barbers."
        breadcrumbs={[{ label: 'Shop' }]}
      />

      {/* Floating Bag Indicator on mobile/desktop */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          aria-label={`Open shopping bag, ${totalCartCount} items`}
          className="relative h-14 w-14 rounded-full bg-ink text-white flex items-center justify-center shadow-2xl hover:bg-accent hover:text-ink transition-all duration-fast hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ShoppingBag className="h-6 w-6" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent text-ink font-bold text-xs flex items-center justify-center shadow-md animate-scale-in">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Shop Section */}
      <Section tone="cream" py="lg">
        <Container>
          {/* Top Bar: Search, Category Chips & Sort Controls */}
          <div className="flex flex-col gap-6 mb-10 sm:mb-14">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-fast',
                      activeCategory === cat
                        ? 'bg-ink text-white shadow-sm'
                        : 'bg-white text-ink/80 hover:bg-white hover:text-ink border border-border-light'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Sort */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search Box */}
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search grooming products..."
                    className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-white border border-border-light text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent shadow-2xs"
                  />
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3.5 py-2 rounded-full text-xs bg-white border border-border-light text-ink focus:outline-none focus:ring-1 focus:ring-accent shadow-2xs cursor-pointer font-medium"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {displayedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white/70 rounded-2xl border border-border-light p-8">
              <ShoppingBag className="h-12 w-12 text-ink/20 mx-auto mb-3" />
              <h3 className="font-display text-2xl uppercase tracking-wide text-ink">
                No products found
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                No items match your filter criteria. Try choosing another category or clearing your search.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 rounded-full"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={() => setSelectedProduct(product)}
                  onAddToCart={() => handleAddToCart(product, 1)}
                />
              ))}
            </div>
          )}

          {/* Studio Assurance Pillars */}
          <div className="mt-16 sm:mt-24 pt-12 border-t border-border-light grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-border-light shadow-2xs">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-ink shrink-0">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-display text-lg uppercase tracking-wide text-ink">
                  Barber Tested Formulations
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Every product is rigorously proven on actual clients in our chairs for hold, finish, and skin comfort.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-border-light shadow-2xs">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-ink shrink-0">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-display text-lg uppercase tracking-wide text-ink">
                  Studio Pickup Available
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Reserve online and collect your curated grooming kit at our Bandra West studio reception anytime.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-border-light shadow-2xs">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-ink shrink-0">
                <Truck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-display text-lg uppercase tracking-wide text-ink">
                  Complimentary Express Shipping
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Free express delivery and sample gift packaging on all grooming orders over $50.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </>
  );
}
