import { Star, Eye, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/formatters';

/**
 * Product Card for the Grooming Shop
 *
 * @param {Object} props
 * @param {Object} props.product - Product object
 * @param {() => void} props.onQuickView - Quick view trigger handler
 * @param {() => void} props.onAddToCart - Add to cart handler
 * @returns {JSX.Element}
 */
export function ProductCard({ product, onQuickView, onAddToCart }) {
  const { name, category, tagline, price, size, imageUrl, rating, reviewCount, isBestSeller } =
    product;

  return (
    <Card
      padding="none"
      className="group relative flex flex-col justify-between overflow-hidden bg-card border border-card-border/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-base rounded-2xl"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-white/50">
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-slow group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isBestSeller && (
            <span className="inline-flex px-2.5 py-1 rounded-pill bg-accent text-ink text-[11px] font-bold uppercase tracking-wider shadow-sm">
              Best Seller
            </span>
          )}
          <span className="inline-flex px-2 py-0.5 rounded-pill bg-white/90 backdrop-blur-sm text-ink text-[10px] font-semibold uppercase tracking-wider border border-black/5 shadow-xs">
            {category}
          </span>
        </div>

        {/* Quick View Floating Button */}
        <button
          type="button"
          onClick={onQuickView}
          aria-label={`Quick view ${name}`}
          className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-fast hover:bg-ink hover:text-white shadow-md focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Product Info & Actions */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4 text-left">
        <div>
          {/* Rating & Size */}
          <div className="flex items-center justify-between text-xs text-muted mb-1.5">
            <div className="flex items-center gap-1 text-ink font-medium">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-muted text-[11px]">({reviewCount})</span>
            </div>
            <span className="text-[11px]">{size}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-display text-xl sm:text-2xl text-ink uppercase tracking-wide leading-tight group-hover:text-accent transition-colors">
            {name}
          </h3>

          {/* Tagline */}
          <p className="text-xs text-ink/70 font-body line-clamp-1 mt-1">{tagline}</p>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 border-t border-border-light flex items-center justify-between gap-3">
          <span className="font-display text-2xl font-bold text-ink">{formatPrice(price)}</span>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAddToCart}
            leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
            className="rounded-full px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold"
          >
            Add to Bag
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ProductCard;