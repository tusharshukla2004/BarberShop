import { useState } from 'react';
import { X, Trash2, ArrowRight, CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/formatters';

/**
 * Slide-over Shopping Cart Drawer
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Open state
 * @param {() => void} props.onClose - Close drawer callback
 * @param {Array<{product: Object, quantity: number}>} props.cart - Cart items
 * @param {(productId: string, quantity: number) => void} props.onUpdateQuantity - Update quantity
 * @param {(productId: string) => void} props.onRemove - Remove item
 * @param {() => void} props.onClearCart - Clear cart
 * @returns {JSX.Element | null}
 */
export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onClearCart,
}) {
  const [isOrdered, setIsOrdered] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 1500;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsOrdered(true);
  };

  const handleFinish = () => {
    setIsOrdered(false);
    onClearCart();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 flex justify-end bg-ink/70 backdrop-blur-sm animate-fade-in"
    >
      {/* Clickable Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Slide-over Drawer */}
      <div className="relative z-10 w-full max-w-md h-full bg-white text-ink shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left text-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border-light flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <h2 className="font-display text-2xl uppercase tracking-wide text-ink">
              Your Grooming Bag ({totalItems})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="h-8 w-8 rounded-full bg-white text-ink flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-[#fcf8f2] px-5 py-3 border-b border-border-light text-xs text-ink/80">
          {subtotal >= freeShippingThreshold ? (
            <span className="font-semibold text-green-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              You qualify for Complimentary Studio Delivery & Concierge Gift!
            </span>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span>
                Add{' '}
                <strong>{formatPrice(freeShippingThreshold - subtotal)}</strong> more for free
                express delivery.
              </span>
              <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-base rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isOrdered ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-4 animate-scale-in">
              <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-3xl uppercase tracking-wide text-ink">
                Order Reserved!
              </h3>
              <p className="text-sm text-ink/75 leading-relaxed">
                Thank you{customerName ? `, ${customerName}` : ''}. Your bespoke grooming selection
                has been reserved. You can collect it at our Bandra studio counter or our concierge
                will coordinate delivery via {customerPhone || 'your contact'}.
              </p>
              <div className="bg-card p-4 rounded-xl border border-border-light text-xs text-muted w-full mt-2">
                Reference ID: #MM-{Math.floor(100000 + Math.random() * 900000)}
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleFinish}
                className="w-full rounded-full mt-4 uppercase tracking-wider"
              >
                Back to Shop
              </Button>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted gap-3">
              <ShoppingBag className="h-14 w-14 text-ink/20" />
              <p className="font-display text-2xl uppercase tracking-wide text-ink">
                Your bag is empty
              </p>
              <p className="text-xs text-ink/60 max-w-xs">
                Explore our handcrafted pomades, straight razors, and conditioning oils.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="mt-2 rounded-full uppercase tracking-wider"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border-light">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-4 items-center">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-18 w-18 sm:h-20 sm:w-20 rounded-xl object-cover border border-border-light shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-base uppercase tracking-wide text-ink leading-tight">
                        {product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemove(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="text-muted hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <span className="text-xs text-muted mb-2">{product.size}</span>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-ink/20 bg-card px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="h-5 w-5 rounded-full hover:bg-ink/10 flex items-center justify-center text-xs font-bold text-ink"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          className="h-5 w-5 rounded-full hover:bg-ink/10 flex items-center justify-center text-xs font-bold text-ink"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-display text-lg font-bold text-ink">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout Form */}
        {!isOrdered && cart.length > 0 && (
          <form onSubmit={handleCheckout} className="p-5 border-t border-border-light bg-card flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Estimated Subtotal</span>
              <span className="font-display text-2xl font-bold text-ink">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-1">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-border-light bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-border-light bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Studio pickup or direct dispatch with cash/card on arrival</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full rounded-full uppercase tracking-wider font-semibold"
            >
              Reserve & Checkout • {formatPrice(subtotal)}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;