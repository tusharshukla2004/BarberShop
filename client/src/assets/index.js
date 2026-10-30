import heroBgImg from './hero-bg.png';
import barber1Img from './team/barber-1.jpg';
import barber2Img from './team/barber-2.jpg';
import barber3Img from './team/barber-3.jpg';
import joinTeamBgImg from './team/join-team-bg.jpg';

/**
 * Centralized assets index
 * Production-ready luxury barbershop imagery
 */

export const HERO_BG_IMAGE = heroBgImg;

export const ABOUT_TEAM_IMAGE =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80';

export const PLACEHOLDER_BARBER_IMAGE = barber1Img;

export const PLACEHOLDER_JOIN_TEAM_IMAGE = joinTeamBgImg;

export const OG_DEFAULT_IMAGE = heroBgImg;

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
  ogDefault: OG_DEFAULT_IMAGE,
};

export default assets;
