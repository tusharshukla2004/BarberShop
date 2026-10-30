/**
 * @typedef {Object} BusinessHours
 * @property {string} days - Day range (e.g., 'Mon - Fri')
 * @property {string} time - Operating hours (e.g., '9:00 AM - 9:00 PM')
 */

/**
 * @typedef {Object} NavLink
 * @property {string} label - Display label
 * @property {string} href - Route path
 */

/**
 * @typedef {Object} SocialLinks
 * @property {string} instagram - Instagram URL
 * @property {string} facebook - Facebook URL
 * @property {string} twitter - Twitter/X URL
 * @property {string} youtube - YouTube URL
 */

/**
 * @typedef {Object} SiteConfig
 * @property {string} name - Shop brand name
 * @property {string} tagline - Catchy hero tagline
 * @property {string} description - Shop description for meta and about
 * @property {string} address - Physical location address
 * @property {string} phone - Contact phone number
 * @property {string} email - Contact email address
 * @property {BusinessHours[]} hours - Business operating schedule
 * @property {string} currency - Default currency symbol
 * @property {SocialLinks} social - Social media channels
 * @property {NavLink[]} navLinks - Main navigation items
 * @property {{ label: string, href: string }} cta - Primary Call To Action
 */

/**
 * Centralized barbershop configuration
 * @type {SiteConfig}
 */
export const siteConfig = {
  name: 'Modern Mane',
  url: 'https://modernmane.com',
  tagline: 'Where Tradition Meets Modern Style',
  description:
    'Experience high-precision haircuts, classic hot towel straight razor shaves, and bespoke beard trims in a vintage lounge atmosphere.',
  address: '42 Heritage Lane, Near Clock Tower, Bandra West, Mumbai 400050',
  location: {
    lat: 19.0596,
    lng: 72.8295,
    zoom: 15,
  },
  phone: '+91 98765 43210',
  email: 'hello@vintageblade.in',
  hours: [
    { days: 'Monday – Friday', time: '9:00 AM – 8:30 PM' },
    { days: 'Saturday', time: '8:30 AM – 9:00 PM' },
    { days: 'Sunday', time: '9:30 AM – 7:00 PM' },
  ],
  currency: '₹',
  social: {
    instagram: 'https://instagram.com/vintageblade',
    facebook: 'https://facebook.com/vintageblade',
    twitter: 'https://twitter.com/vintageblade',
    youtube: 'https://youtube.com/@vintageblade',
  },
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Barbers', href: '/barbers' },
    { label: 'About', href: '/about' },
  ],
  cta: {
    label: 'Book Appointment',
    href: '/book',
  },
  careers: {
    title: 'Would you like to join our team?',
    label: 'Send a resume',
    href: 'mailto:careers@vintageblade.in?subject=Master%20Barber%20Application',
  },
};

export default siteConfig;
