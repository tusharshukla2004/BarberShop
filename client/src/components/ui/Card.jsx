import { cn } from '@/lib/utils';

const TONES = {
  card: 'bg-card text-ink border border-card-border',
  cream: 'bg-cream text-ink border border-border-light',
  white: 'bg-white text-ink border border-border-light shadow-sm',
  dark: 'bg-ink text-white border border-border-dark',
  brown: 'bg-brown text-white border border-border-dark',
};

const PADDINGS = {
  none: 'p-0',
  sm: 'p-4 sm:p-5',
  md: 'p-6 sm:p-8',
  lg: 'p-8 sm:p-10 md:p-12',
};

/**
 * Surface card container with design token tones and border radiuses
 *
 * @param {Object} props
 * @param {'card' | 'cream' | 'white' | 'dark' | 'brown'} [props.tone='card'] - Surface tone
 * @param {'none' | 'sm' | 'md' | 'lg'} [props.padding='md'] - Inner padding
 * @param {React.ReactNode} props.children - Card contents
 * @param {string} [props.className] - Additional class names
 * @param {keyof HTMLElementTagNameMap} [props.as='div'] - HTML element to render
 * @returns {JSX.Element}
 */
export function Card({
  tone = 'card',
  padding = 'md',
  children,
  className = '',
  as: Component = 'div',
  ...rest
}) {
  const toneClass = TONES[tone] || TONES.card;
  const paddingClass = PADDINGS[padding] || PADDINGS.md;

  return (
    <Component
      className={cn(
        'rounded-lg transition-all duration-base overflow-hidden',
        toneClass,
        paddingClass,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Card;
