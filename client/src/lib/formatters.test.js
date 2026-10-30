import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatters';

describe('formatPrice', () => {
  it('formats positive integers with rupee symbol and thousands commas', () => {
    expect(formatPrice(500)).toBe('₹500');
    expect(formatPrice(1200)).toBe('₹1,200');
    expect(formatPrice(15000)).toBe('₹15,000');
  });

  it('handles zero correctly', () => {
    expect(formatPrice(0)).toBe('₹0');
  });

  it('handles invalid inputs gracefully by returning ₹0', () => {
    expect(formatPrice(null)).toBe('₹0');
    expect(formatPrice(undefined)).toBe('₹0');
    expect(formatPrice(NaN)).toBe('₹0');
  });
});
