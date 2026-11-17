import heroBgImg from './hero-bg.png';
import barberHeroBackgroundImg from './barber-hero-background.png';
import barber1Img from './team/barber-1.jpg';
import barber2Img from './team/barber-2.jpg';
import barber3Img from './team/barber-3.jpg';
import joinTeamBgImg from './team/join-team-bg.jpg';
import barberCuttingHairImg from './gallery/barber-cutting-hair.jpg';
import barberDetailingFadeImg from './gallery/barber-detailing-fade.jpg';
import barberHaircutImg from './gallery/barber-haircut.jpg';
import barberBeardTrimImg from './gallery/barber-beard-trim.jpg';
import barbershopInteriorImg from './gallery/barbershop-interior.jpg';
import barbershopChairsImg from './gallery/barbershop-chairs.jpg';
import classicBarberChairsImg from './gallery/classic-barber-chairs.jpg';
import groomingKitImg from './gallery/grooming-kit.jpg';

/**
 * Centralized assets index
 * Production-ready luxury barbershop imagery
 */

export const HERO_BG_IMAGE = heroBgImg;
export const BARBER_HERO_BACKGROUND_IMAGE = barberHeroBackgroundImg;

export const ABOUT_TEAM_IMAGE =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80';

export const PLACEHOLDER_BARBER_IMAGE = barber1Img;

export const PLACEHOLDER_JOIN_TEAM_IMAGE = joinTeamBgImg;

export const OG_DEFAULT_IMAGE = heroBgImg;

export const BARBER_GALLERY_IMAGES = [
  { src: barberCuttingHairImg, alt: 'Barber cutting a client’s hair' },
  { src: barberDetailingFadeImg, alt: 'Barber detailing a client’s fade' },
  { src: barbershopInteriorImg, alt: 'Brick-walled barbershop interior' },
  { src: barberHaircutImg, alt: 'Barber shaping a client’s haircut' },
  { src: barbershopChairsImg, alt: 'Barber chairs inside a modern shop' },
  { src: barberBeardTrimImg, alt: 'Barber trimming a client’s beard' },
  { src: groomingKitImg, alt: 'Travel grooming kit and toiletries' },
  { src: classicBarberChairsImg, alt: 'Classic leather barber chairs' },
];

export const assets = {
  heroBg: HERO_BG_IMAGE,
  aboutTeam: ABOUT_TEAM_IMAGE,
  placeholderBarber: PLACEHOLDER_BARBER_IMAGE,
  joinTeamBg: joinTeamBgImg,
  barbers: {
    barber1: barber1Img,
    barber2: barber2Img,
    barber3: barber3Img,
  },
  barberGallery: BARBER_GALLERY_IMAGES,
  ogDefault: OG_DEFAULT_IMAGE,
};

export default assets;
