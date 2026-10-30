import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill AbortSignal and fetch compatibility between Node 24 and jsdom
if (typeof globalThis.AbortSignal !== 'undefined') {
  window.AbortSignal = globalThis.AbortSignal;
}

// Mock window APIs for jsdom environment
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();

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
