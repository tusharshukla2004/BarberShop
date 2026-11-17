import { siteConfig } from '@/config/site';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Join Our Team recruitment card matching the luxury dark aesthetic.
 * Showcases the artisan neon shears & comb in active loop motion,
 * alongside siteConfig careers CTA.
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
        'group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#1c1c20] via-[#141416] to-[#0d0d0f] text-white shadow-sm transition-all duration-base hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between border border-white/10 hover:border-accent/50',
        'aspect-[3/4] w-full p-4 sm:p-5',
        className
      )}
    >
      {/* Top Bar: Active Hiring Status Pill */}
      <div className="flex items-center justify-between z-10 w-full">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-bold uppercase tracking-wider shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span>Now Hiring</span>
        </span>

        <span className="text-white/40 group-hover:text-accent transition-colors">
          <Sparkles className="h-4 w-4" />
        </span>
      </div>

      {/* Center: Video in motion (Neon Scissors & Comb in continuous loop) */}
      <div className="relative my-auto w-full flex items-center justify-center py-1 overflow-hidden aspect-video sm:aspect-square max-h-[220px] rounded-2xl bg-black/60 border border-white/10">
        <video
          src="/barber-craft.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-2xl drop-shadow-2xl"
          aria-label="Artisan barber craft neon scissors and comb in motion"
        />
      </div>

      {/* Bottom White Rounded Card */}
      <div className="z-10 w-full pt-1">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white text-ink shadow-md flex flex-col gap-1.5 text-left border border-white/60">
          <h3 className="font-sans font-medium text-xs sm:text-sm text-ink leading-snug">
            {careers.title}
          </h3>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <a
              href={careers.href}
              className="text-xs sm:text-sm font-normal text-ink underline decoration-ink/40 hover:decoration-accent hover:text-accent transition-colors"
            >
              {careers.label}
            </a>

            <a
              href={careers.href}
              aria-label={`${careers.label} - ${careers.title}`}
              className="h-7 w-7 rounded-md bg-[#f9a55a] text-ink flex items-center justify-center hover:bg-[#e89243] transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-accent shrink-0"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinTeamCard;
