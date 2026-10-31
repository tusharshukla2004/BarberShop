import { buildWhatsAppLink, renderTemplate } from '../../utils/whatsapp.js';
import { Settings, DEFAULT_MESSAGE_TEMPLATES } from '../../models/Settings.js';

class NotImplementedError extends Error {
  constructor(channel) {
    super(`Notification channel '${channel}' is not implemented yet.`);
    this.name = 'NotImplementedError';
    this.statusCode = 501;
  }
}

/**
 * Registry of notification channel handlers
 */
const channels = {
  /**
   * Free wa.me click-to-chat deep link channel
   */
  whatsapp_link: async (booking, type, options = {}) => {
    const settings = (await Settings.findOne()) || {};
    const templates = settings.messageTemplates || DEFAULT_MESSAGE_TEMPLATES;
    const template = templates[type] || templates.confirmation || '';

    const phone = booking.phone;
    if (!phone) {
      throw new Error('Customer phone number is required for WhatsApp notifications.');
    }

    const rendered = renderTemplate(template, {
      name: booking.customerName || booking.name,
      date: booking.date,
      time: booking.startTime,
      service: booking.serviceName || (booking.serviceId ? 'Grooming Service' : ''),
      barber: booking.barberName || (booking.barberId ? 'Master Barber' : ''),
      shopName: settings.shopName || 'Modern Mane',
      address: settings.address || '42 Heritage Lane, Bandra West, Mumbai',
      mapsLink: settings.mapsLink || 'https://maps.google.com/?q=Modern+Mane',
      bookingRef: booking.id ? `BK-${booking.id.slice(-6).toUpperCase()}` : '',
      reviewLink: settings.googleReviewLink || 'https://g.page/r/modern-mane-reviews',
      cancelPolicy:
        settings.policies?.termsNotice ||
        'Free cancellation up to 2 hours prior to scheduled appointment.',
      ...options.data,
    });

    const link = buildWhatsAppLink(phone, rendered);

    return {
      success: true,
      channel: 'whatsapp_link',
      type,
      recipient: phone,
      message: rendered,
      url: link,
    };
  },

  /**
   * WhatsApp Cloud API (Automated) - Future extension stub
   */
  whatsapp_cloud: async () => {
    throw new NotImplementedError('whatsapp_cloud');
  },

  /**
   * Automated Transactional Email - Future extension stub
   */
  email: async () => {
    throw new NotImplementedError('email');
  },
};

/**
 * Dispatches a notification for a booking via the selected channel
 *
 * @param {Object} booking - Booking document or object
 * @param {'confirmation'|'reminder'|'reschedule'|'cancellation'|'review_request'|'running_late'|'custom'} type
 * @param {Object} [options={}]
 * @param {'whatsapp_link'|'whatsapp_cloud'|'email'} [options.channel='whatsapp_link']
 * @returns {Promise<{success: boolean, channel: string, message: string, url?: string}>}
 */
export async function notify(booking, type, options = {}) {
  const channelName = options.channel || 'whatsapp_link';
  const handler = channels[channelName];

  if (!handler) {
    throw new Error(`Unknown notification channel: ${channelName}`);
  }

  return handler(booking, type, options);
}

export { channels, NotImplementedError };
