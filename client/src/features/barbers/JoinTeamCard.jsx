import { siteConfig } from '@/config/site';
import { assets } from '@/assets';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Join Our Team recruitment card
 * Full-bleed photo background with dark gradient and white rounded-lg pill at the bottom
 *
 * @param {Object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function JoinTeamCard({ className = '' }) {
  const { careers } = siteConfig;

  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden bg-ink text-white shadow-sm transition-all duration-base hover:-translate-y-1.5 hover:shadow-xl flex flex-col',
        'aspect-[3/4] w-full',
        className
      )}
    >
      {/* Full-bleed Background Image with Dark Gradients */}
      <img
        src={assets.joinTeamBg}
        alt="Barbershop workstation with vintage shears and leather chairs"
        loading="lazy"
        className="h-full w-full object-cover object-center opacity-45 scale-100 transition-transform duration-slow group-hover:scale-105"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative top badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1 rounded-pill bg-accent/20 border border-accent/40 text-[11px] font-semibold tracking-widest uppercase text-accent backdrop-blur-sm">
          Careers &bull; Hiring
        </span>
      </div>

      {/* Bottom White Rounded-lg Pill Card */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="p-4 sm:p-5 rounded-lg bg-white text-ink shadow-lg flex flex-col gap-2.5 text-left border border-border-light">
          <h3 className="font-display text-xl sm:text-2xl text-ink uppercase tracking-wide leading-tight">
            {careers.title}
          </h3>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border-light">
            <a
              href={careers.href}
              className="text-xs sm:text-sm font-semibold text-ink underline decoration-accent hover:text-accent transition-colors"
            >
              {careers.label}
            </a>

            {/* Accent square arrow button */}
            <a
              href={careers.href}
              aria-label={`${careers.label} - ${careers.title}`}
              className="h-8 w-8 rounded-sm bg-accent text-ink flex items-center justify-center hover:bg-accent-hover transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinTeamCard;
