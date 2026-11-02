/**
 * Client Analytics Event Tracker
 *
 * Tracks conversion actions:
 * - booking_started
 * - booking_completed
 * - whatsapp_click
 * - call_click
 * - directions_click
 */

/**
 * Dispatches an analytics event
 *
 * @param {'booking_started' | 'booking_completed' | 'whatsapp_click' | 'call_click' | 'directions_click'} eventName
 * @param {Record<string, unknown>} [metadata={}]
 */
export function trackEvent(eventName, metadata = {}) {
  try {
    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      ...metadata,
    };

    // 1. Push to Google Tag Manager / window.dataLayer if available
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);

      // 2. Dispatch custom DOM event for local analytics listeners
      window.dispatchEvent(
        new CustomEvent('salon_analytics', {
          detail: payload,
        })
      );
    }

    // 3. Development console log
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.log(`📊 [Analytics] ${eventName}:`, payload);
    }
  } catch (err) {
    // Analytics should never break user interactions
    if (import.meta.env?.DEV) {
      console.warn('Analytics tracking error:', err);
    }
  }
}

