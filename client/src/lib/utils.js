import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names safely with Tailwind conflict resolution
 * @param {...any} inputs - Class names, objects, or arrays
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
