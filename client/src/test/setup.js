import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Fix AbortController / AbortSignal in browser/jsdom environment
if (typeof window !== 'undefined') {
  if (typeof globalThis.AbortController !== 'undefined') {
    window.AbortController = globalThis.AbortController;
    window.AbortSignal = globalThis.AbortSignal;
  }

  window.scrollTo = vi.fn();

  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  };

  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };

  window.matchMedia =
    window.matchMedia ||
    function (query) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    };
}
