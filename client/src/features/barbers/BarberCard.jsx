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

        {/* Top-Left: Floating White Rounded Tag with Name & Role */}
        <div className="absolute top-4 left-4 z-10 max-w-[calc(100%-70px)]">
          <div className="inline-flex flex-col px-4 py-2.5 rounded-2xl bg-white text-ink shadow-sm border border-black/5 text-left">
            <Link
              to="/barbers"
              className="font-semibold text-xs sm:text-sm text-ink hover:text-accent transition-colors truncate focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
            >
              {name}
            </Link>
            <span className="text-[11px] text-muted truncate mt-0.5">{role}</span>
          </div>
        </div>

        {/* Top-Right: Minimalist Social Icons stacked vertically */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-2">
          {socials.linkedin && (
            <button
              type="button"
              aria-label={`Visit ${name}'s LinkedIn profile`}
              onClick={() => window.open(socials.linkedin, '_blank', 'noopener,noreferrer')}
              className="text-ink/60 hover:text-ink transition-colors p-1"
            >
              <Linkedin className="h-4 w-4" />
            </button>
          )}

          {socials.instagram && (
            <button
              type="button"
              aria-label={`Visit ${name}'s Instagram profile`}
              onClick={() => window.open(socials.instagram, '_blank', 'noopener,noreferrer')}
              className="text-ink/60 hover:text-ink transition-colors p-1"
            >
              <Instagram className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarberCard;
