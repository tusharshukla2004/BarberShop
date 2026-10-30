import { cn } from '@/lib/utils';

/**
 * Tone variants mapped to theme design tokens
 */
const TONES = {
  dark: 'bg-ink text-white',
  brown: 'bg-brown text-white',
  cream: 'bg-cream text-ink',
  white: 'bg-white text-ink',
};

const PADDINGS = {
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16 md:py-20',
  lg: 'py-16 sm:py-20 md:py-24',
  xl: 'py-20 sm:py-24 md:py-32',
};

/**
 * Structural page section with semantic tone background and standard vertical rhythm
 *
 * @param {Object} props
 * @param {'dark' | 'brown' | 'cream' | 'white'} [props.tone='white'] - Background & text tone
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.py='lg'] - Vertical padding scale
 * @param {React.ReactNode} props.children - Section content
 * @param {string} [props.className] - Additional classes
 * @param {keyof HTMLElementTagNameMap} [props.as='section'] - HTML element to render
 * @returns {JSX.Element}
 */
export function Section({
  tone = 'white',
  py = 'lg',
  children,
  className = '',
  as: Component = 'section',
  ...rest
}) {
  const toneClasses = TONES[tone] || TONES.white;
  const paddingClasses = PADDINGS[py] || PADDINGS.lg;

  return (
    <Component
      className={cn(
        'relative w-full transition-colors duration-base',
        toneClasses,
        paddingClasses,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Section;
