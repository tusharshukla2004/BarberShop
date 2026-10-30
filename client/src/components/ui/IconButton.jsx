import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-accent text-ink hover:bg-accent-hover shadow-sm',
  secondary: 'bg-brown text-white hover:bg-brown/90 border border-border-dark',
  ghost: 'bg-transparent text-inherit hover:bg-ink/10 dark:hover:bg-white/10',
  outline:
    'bg-transparent border border-border-light hover:bg-ink/5 dark:border-border-dark dark:hover:bg-white/5',
};

const SIZES = {
  sm: 'h-8 w-8 text-sm p-1.5',
  md: 'h-10 w-10 text-base p-2',
  lg: 'h-12 w-12 text-lg p-2.5',
};

/**
 * Accessible round icon button with mandatory aria-label
 *
 * @param {Object} props
 * @param {string} props['aria-label'] - Mandatory screen-reader label
 * @param {React.ReactNode} props.children - Icon element
 * @param {'primary' | 'secondary' | 'ghost' | 'outline'} [props.variant='ghost'] - Button style variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {string} [props.className] - Additional classes
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - Button type
 * @param {boolean} [props.disabled=false] - Disabled status
 * @returns {JSX.Element}
 */
export function IconButton({
  'aria-label': ariaLabel,
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  ...rest
}) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-pill transition-all duration-fast select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-95';
  const variantClass = VARIANTS[variant] || VARIANTS.ghost;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(baseClasses, variantClass, sizeClass, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export default IconButton;
