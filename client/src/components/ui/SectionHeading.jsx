import { cn } from '@/lib/utils';

const ALIGNMENTS = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

/**
 * Standardized section header with display typography and uppercase hierarchy
 *
 * @param {Object} props
 * @param {React.ReactNode} props.title - Primary heading text
 * @param {React.ReactNode} [props.subtitle] - Eyebrow / tagline text
 * @param {'left' | 'center' | 'right'} [props.align='center'] - Alignment
 * @param {'dark' | 'light'} [props.tone='light'] - Theme context ('light' for on-cream/white, 'dark' for on-ink/brown)
 * @param {string} [props.className] - Container class name
 * @param {keyof HTMLElementTagNameMap} [props.as='h2'] - Heading tag
 * @returns {JSX.Element}
 */
export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  tone = 'light',
  className = '',
  as: HeadingTag = 'h2',
  ...rest
}) {
  const alignClass = ALIGNMENTS[align] || ALIGNMENTS.center;

  return (
    <div className={cn('flex flex-col gap-2', alignClass, className)} {...rest}>
      {subtitle && (
        <span
          className={cn(
            'text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase',
            tone === 'dark' ? 'text-accent' : 'text-accent hover:text-accent-hover'
          )}
        >
          {subtitle}
        </span>
      )}
      <HeadingTag
        className={cn(
          'font-display text-4xl sm:text-5xl md:text-6xl tracking-wide uppercase leading-none',
          tone === 'dark' ? 'text-white' : 'text-ink'
        )}
      >
        {title}
      </HeadingTag>
    </div>
  );
}

export default SectionHeading;
