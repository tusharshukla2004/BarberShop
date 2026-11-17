import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { products as allProducts } from '@/features/shop/productsData';
import { useGetProductsQuery } from '@/features/shop/productsApi';
import { ProductCard } from '@/features/shop/ProductCard';
import { ProductQuickView } from '@/features/shop/ProductQuickView';
import { CartDrawer } from '@/features/shop/CartDrawer';

/**
 * Curated Products Showcase Section
 * Displays top gentleman apothecary products with Quick View and Shop link
 * Enhanced with Framer Motion scroll reveals
 */
export function ProductsShowcaseSection({
  eyebrow = 'Artisanal Care',
  title = 'THE BARBERSHOP APOTHECARY',
  subtitle = 'Formulated with cold-pressed botanical oils, bentonite clays, and pure essential extracts. Take the sovereign grooming ritual home.',
  limit = 4,
  tone = 'cream',
}) {
  const { data: dbProducts } = useGetProductsQuery();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const displayedProducts = (
    dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0
      ? dbProducts
      : allProducts
  ).slice(0, limit);

  const handleAddToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
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

  return (
    <Section
      tone={tone}
      className="py-16 sm:py-20 md:py-24 border-t border-border-light/60 overflow-hidden"
    >
      <Container>
        {/* Header with scroll reveal */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {eyebrow}
            </span>
            <SectionHeading level={2} tone="dark" className="text-3xl md:text-4xl text-ink">
              {title}
            </SectionHeading>
            <p className="text-sm md:text-base text-ink/75 font-body leading-relaxed mt-3">
              {subtitle}
            </p>
          </div>

          <Link to="/shop" className="shrink-0">
            <Button
              variant="outline"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="rounded-full px-6 text-xs uppercase tracking-wider font-semibold border-ink text-ink hover:bg-ink hover:text-white"
            >
              Explore Full Shop
            </Button>
          </Link>
        </motion.div>

        {/* Product Cards Grid with staggered entrance */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {displayedProducts.map((product) => (
            <motion.div
              key={product.id || product._id}
              className="h-full"
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <ProductCard
                product={product}
                onQuickView={() => setSelectedProduct(product)}
                onAddToCart={() => handleAddToCart(product, 1)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Callout Bar */}
        <motion.div
          className="mt-12 p-6 rounded-2xl bg-white border border-border-light shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-ink">Free Studio Pickup &amp; Orders Over ₹1,500</h4>
              <p className="text-xs text-muted">All grooming products come with an authenticity certificate.</p>
            </div>
          </div>
          <Link to="/shop">
            <span className="text-xs font-bold text-accent hover:text-accent-hover uppercase tracking-wider inline-flex items-center gap-1">
              View All 12 Essentials <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </motion.div>
      </Container>

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-over Cart */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </Section>
  );
}

export default ProductsShowcaseSection;
