import { siteConfig } from '@/config/site';
import { assets } from '@/assets';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Join Our Team recruitment card matching the reference screenshot.
 * Full-bleed photo background with white rounded card at the bottom.
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
        'group relative rounded-3xl overflow-hidden bg-ink text-white shadow-sm transition-all duration-base hover:-translate-y-1.5 hover:shadow-xl flex flex-col',
        'aspect-[3/4] w-full',
        className
      )}
    >
      {/* Full-bleed Background Image */}
      <img
        src={assets.joinTeamBg}
        alt="Master barber styling client beard in chair"
        loading="lazy"
        className="h-full w-full object-cover object-center scale-100 transition-transform duration-slow group-hover:scale-105"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Bottom White Rounded Card */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="p-4 sm:p-5 rounded-2xl bg-white text-ink shadow-md flex flex-col gap-2.5 text-left border border-white/60">
          <h3 className="font-sans font-medium text-sm sm:text-base text-ink leading-snug">
            {careers.title}
          </h3>

          <div className="flex items-center justify-between gap-3 pt-1">
            <a
              href={careers.href}
              className="text-xs sm:text-sm font-normal text-ink underline decoration-ink/40 hover:decoration-accent hover:text-accent transition-colors"
            >
              {careers.label}
            </a>

            {/* Accent square arrow button */}
            <a
              href={careers.href}
              aria-label={`${careers.label} - ${careers.title}`}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-[#f9a55a] text-ink flex items-center justify-center hover:bg-[#e89243] transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinTeamCard;
