import { Link } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Single Barber Profile Card matching the reference design.
 * Features a 3:4 portrait image, floating white tag with name and role, and minimal social icons.
 *
 * @param {Object} props
 * @param {Object} props.barber
 * @param {string} props.barber.id
 * @param {string} props.barber.name
 * @param {string} props.barber.role
 * @param {string} [props.barber.imageUrl]
 * @param {string} [props.barber.photoUrl]
 * @param {Object} [props.barber.socials]
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function BarberCard({ barber, className = '' }) {
  const { name, role, socials = {} } = barber;
  const imageSrc = barber.imageUrl || barber.photoUrl;

  return (
    <div
      className={cn(
        'group relative rounded-3xl overflow-hidden bg-[#f4efe8] shadow-sm transition-all duration-base hover:-translate-y-1.5 hover:shadow-xl flex flex-col',
        'aspect-[3/4] w-full',
        className
      )}
    >
      {/* 3:4 Aspect Ratio Portrait Container */}
      <div className="relative w-full h-full overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`Portrait of ${name}, ${role}`}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-slow group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-card flex items-center justify-center text-muted text-xs">
            {name}
          </div>
        )}

        {/* Top-Left: Compact Floating White Badge (Hugs the corner to stay completely clear of the face) */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 max-w-[55%]">
          <div className="inline-flex flex-col px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/95 backdrop-blur-xs text-ink shadow-sm border border-black/5 text-left">
            <Link
              to="/barbers"
              className="font-semibold text-[11px] sm:text-xs text-ink hover:text-accent transition-colors truncate focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm leading-tight"
            >
              {name}
            </Link>
            <span className="text-[9px] sm:text-[10px] text-muted truncate leading-tight mt-0.5">
              {role}
            </span>
          </div>
        </div>

        {/* Top-Right: Minimalist Social Icons stacked vertically */}
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 flex flex-col items-center gap-1.5">
          {socials.linkedin && (
            <button
              type="button"
              aria-label={`Visit ${name}'s LinkedIn profile`}
              onClick={() => window.open(socials.linkedin, '_blank', 'noopener,noreferrer')}
              className="text-ink/60 hover:text-ink transition-colors p-1"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </button>
          )}

          {socials.instagram && (
            <button
              type="button"
              aria-label={`Visit ${name}'s Instagram profile`}
              onClick={() => window.open(socials.instagram, '_blank', 'noopener,noreferrer')}
              className="text-ink/60 hover:text-ink transition-colors p-1"
            >
              <Instagram className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarberCard;
