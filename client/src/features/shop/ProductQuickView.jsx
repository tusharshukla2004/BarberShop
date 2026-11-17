import { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Check, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/formatters';
import { getProductFallbackImageUrl, getProductImageUrl } from './productImages';

/**
 * Product Quick View Modal Dialog
 *
 * @param {Object} props
 * @param {Object | null} props.product - Active product
 * @param {() => void} props.onClose - Close dialog callback
 * @param {(product: Object, quantity: number) => void} props.onAddToCart - Add to cart callback
 * @returns {JSX.Element | null}
 */
export function ProductQuickView({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const productImageUrl = getProductImageUrl(product);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-fade-in"
    >
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-card-border p-6 sm:p-8 shadow-2xl text-ink text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/80 hover:bg-white text-ink flex items-center justify-center shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Product Image */}
          <div className="md:col-span-5 relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-border-light">
            <img
              src={productImageUrl}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getProductFallbackImageUrl(product);
              }}
              className="h-full w-full object-cover object-center"
            />
            {product.isBestSeller && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-pill bg-accent text-ink text-[11px] font-bold uppercase tracking-wider shadow-sm">
                Barber Favorite
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-muted mb-2">
                <span className="uppercase tracking-widest text-[11px] font-semibold text-accent">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-ink font-semibold">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-muted font-normal">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <h2
                id="quick-view-title"
                className="font-display text-2xl sm:text-3xl text-ink uppercase tracking-wide leading-tight"
              >
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-ink/75 font-medium mt-1">{product.tagline}</p>

              {/* Price & Size */}
              <div className="flex items-baseline gap-3 my-4">
                <span className="font-display text-3xl font-bold text-ink">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-muted">/ {product.size}</span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-ink/80 leading-relaxed font-body mb-4">
                {product.description}
              </p>

              {/* Scent & Ingredients pill notes */}
              <div className="flex flex-col gap-2 text-xs text-ink/75 bg-white/70 p-3.5 rounded-xl border border-border-light mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>
                    <strong>Scent Profile:</strong> {product.scent}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>
                    <strong>Formula:</strong> 100% Barber Tested • Organic Ingredients
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add Button */}
            <div className="flex items-center gap-4 pt-4 border-t border-border-light">
              <div className="flex items-center rounded-full border border-ink/20 bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="h-7 w-7 rounded-full hover:bg-ink/5 flex items-center justify-center font-bold text-sm text-ink"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="h-7 w-7 rounded-full hover:bg-ink/5 flex items-center justify-center font-bold text-sm text-ink"
                >
                  +
                </button>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAdd}
                leftIcon={
                  added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />
                }
                className="flex-1 rounded-full uppercase tracking-wider font-semibold"
              >
                {added ? 'Added to Bag!' : `Add to Bag • ${formatPrice(product.price * quantity)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductQuickView;