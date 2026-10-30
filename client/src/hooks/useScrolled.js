import { useState, useEffect } from 'react';

/**
 * Detects whether the window has scrolled past a vertical threshold
 *
 * @param {number} [threshold=24] - Scroll offset in pixels
 * @returns {boolean} True if scrolled past threshold
 */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isPast = window.scrollY > threshold;
      setScrolled((prev) => (prev !== isPast ? isPast : prev));
    };

    // Check initial position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}

export default useScrolled;
