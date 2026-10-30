import { Link } from 'react-router-dom';
import { IconButton } from '@/components/ui';
import { Instagram, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Single Barber Profile Card
 * Features a 3:4 portrait image, floating pill tag with name and role, and social icon buttons
 *
 * @param {Object} props
 * @param {Object} props.barber
 * @param {string} props.barber.id
 * @param {string} props.barber.name
 * @param {string} props.barber.role
 * @param {string} props.barber.imageUrl
 * @param {Object} [props.barber.socials]
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function BarberCard({ barber, className = '' }) {
  const { name, role, imageUrl, socials = {} } = barber;

  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden bg-card border border-card-border shadow-sm transition-all duration-base hover:-translate-y-1.5 hover:shadow-xl flex flex-col',
        className
      )}
    >
      {/* 3:4 Aspect Ratio Portrait Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-ink/10">
        <img
          src={imageUrl}
          alt={`Portrait of ${name}, ${role}`}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-slow group-hover:scale-105"
        />

        {/* Subtle Dark Gradient Overlay for pill readability */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40 pointer-events-none"
          aria-hidden="true"
        />

        {/* Top-Left: Floating White Rounded-Pill Tag with Name & Role */}
        <div className="absolute top-4 left-4 z-10 max-w-[calc(100%-80px)]">
          <div className="inline-flex flex-col px-3.5 py-1.5 rounded-pill bg-white/95 text-ink shadow-md backdrop-blur-sm border border-white/40">
            <Link
              to="/barbers"
              className="font-semibold text-xs sm:text-sm text-ink hover:text-accent transition-colors truncate focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
            >
              {name}
            </Link>
            <span className="text-[11px] text-muted truncate">{role}</span>
          </div>
        </div>

        {/* Top-Right: Social Icons (only rendered when URL exists) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
          {socials.instagram && (
            <IconButton
              aria-label={`Visit ${name}'s Instagram profile`}
              variant="outline"
              size="sm"
              onClick={() => window.open(socials.instagram, '_blank', 'noopener,noreferrer')}
              className="h-8 w-8 rounded-pill bg-white/90 text-ink hover:bg-white hover:text-accent shadow-md border-transparent"
            >
              <Instagram className="h-3.5 w-3.5" />
            </IconButton>
          )}

          {socials.twitter && (
            <IconButton
              aria-label={`Visit ${name}'s Twitter profile`}
              variant="outline"
              size="sm"
              onClick={() => window.open(socials.twitter, '_blank', 'noopener,noreferrer')}
              className="h-8 w-8 rounded-pill bg-white/90 text-ink hover:bg-white hover:text-accent shadow-md border-transparent"
            >
              <Twitter className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </div>

        {/* Bottom subtle specialties bar */}
        {barber.specialties && barber.specialties.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-1.5 pointer-events-none">
            {barber.specialties.map((spec) => (
              <span
                key={spec}
                className="px-2 py-0.5 rounded-sm bg-ink/75 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm border border-border-dark"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BarberCard;
