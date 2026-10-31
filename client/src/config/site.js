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
  url: 'https://vintageblade.in',
  tagline: 'Where Tradition Meets Modern Style',
  description:
    "Our mission is to provide exceptional grooming services in a relaxed and friendly environment. Whether you're here for a classic haircut, a modern fade, or a clean shave, our skilled barbers are dedicated to ensuring you leave looking and feeling your best.",
  address: '42 Heritage Lane, Near Clock Tower, Bandra West, Mumbai 400050',
  location: {
    lat: 19.0596,
    lng: 72.8295,
    zoom: 15,
  },
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'hello@modernmane.in',
  hours: [
    { days: 'Monday – Friday', time: '9:00 AM – 8:30 PM' },
    { days: 'Saturday', time: '8:30 AM – 9:00 PM' },
    { days: 'Sunday', time: '9:30 AM – 7:00 PM' },
  ],
  currency: '₹',
  social: {
    instagram: 'https://instagram.com/modernmane',
    facebook: 'https://facebook.com/modernmane',
    twitter: 'https://twitter.com/modernmane',
    youtube: 'https://youtube.com/@modernmane',
  },
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About us', href: '/about' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Shop', href: '/shop' },
  ],
  cta: {
    label: 'Contact us',
    href: '/contact',
  },
  careers: {
    title: 'Would you like to join our team?',
    label: 'Send a resume',
    href: 'mailto:careers@vintageblade.in?subject=Master%20Barber%20Application',
  },
};

export default siteConfig;
