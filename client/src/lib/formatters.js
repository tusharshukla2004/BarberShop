import { siteConfig } from '@/config/site';

/**
 * Formats a numeric price using Indian currency format without decimals
 *
 * @param {number} amount - Numeric price value
 * @returns {string} Formatted string, e.g. "₹850"
 */
export function formatPrice(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return `${siteConfig.currency}0`;
  }

  const numberPart = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${siteConfig.currency}${numberPart}`;
}

export default formatPrice;
