import { siteConfig } from '@/config/site';

let scriptPromise = null;

/**
 * Dynamically loads the official Razorpay Checkout script on demand.
 * Avoids loading third-party scripts on initial app boot.
 *
 * @returns {Promise<boolean>}
 */
export function loadRazorpayCheckout() {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

/**
 * Opens Razorpay Checkout modal
 *
 * @param {Object} options
 * @param {string} options.keyId - Razorpay Public Key ID
 * @param {Object} options.order - Order object { id, amount, currency }
 * @param {Object} options.booking - Pending booking details
 * @param {Object} [options.customer] - { name, phone, email }
 * @param {Function} options.onSuccess - Callback({ razorpay_payment_id, razorpay_order_id, razorpay_signature })
 * @param {Function} options.onDismiss - Callback when user closes without paying
 */
export async function openRazorpayModal({
  keyId,
  order,
  booking,
  customer,
  onSuccess,
  onDismiss,
}) {
  const isLoaded = await loadRazorpayCheckout();
  if (!isLoaded || !window.Razorpay) {
    throw new Error('Could not load secure Razorpay gateway. Please check your internet connection.');
  }

  const razorpayOptions = {
    key: keyId,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: siteConfig.name,
    description: `Booking deposit for ${booking?.serviceName || 'Grooming reservation'}`,
    order_id: order.id,
    prefill: {
      name: customer?.name || booking?.customerName || '',
      contact: customer?.phone || booking?.phone || '',
      email: customer?.email || booking?.email || '',
    },
    theme: {
      color: '#1a1a1a', // Match theme ink
    },
    handler: function (response) {
      if (typeof onSuccess === 'function') {
        onSuccess(response);
      }
    },
    modal: {
      ondismiss: function () {
        if (typeof onDismiss === 'function') {
          onDismiss();
        }
      },
      escape: true,
      backdropclose: false,
    },
  };

  const rzp = new window.Razorpay(razorpayOptions);
  rzp.open();
  return rzp;
}
