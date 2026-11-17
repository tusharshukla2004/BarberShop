import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary:
    'bg-accent text-ink font-semibold hover:bg-accent-hover shadow-sm active:translate-y-px focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  accent:
    'bg-accent text-ink font-semibold hover:bg-accent-hover shadow-sm active:translate-y-px focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  secondary:
    'bg-brown text-white font-medium hover:bg-brown/90 border border-border-dark shadow-sm active:translate-y-px focus-visible:ring-2 focus-visible:ring-accent',
  outline:
    'bg-transparent text-ink border border-border-light font-semibold hover:bg-ink/5 active:translate-y-px focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-inherit hover:bg-ink/5 dark:hover:bg-white/10 active:translate-y-px focus-visible:ring-2 focus-visible:ring-accent',
};

const SIZES = {
  sm: 'h-9 text-xs px-3.5 rounded-sm gap-1.5',
  md: 'h-11 text-sm px-5 rounded-sm gap-2',
  lg: 'h-12 text-base px-7 rounded-sm gap-2.5',
};

/**
 * Versatile button component rendering as interactive button or router link
 *
 * @param {Object} props
 * @param {'primary' | 'accent' | 'secondary' | 'outline' | 'ghost'} [props.variant='primary'] - Style variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Sizing
 * @param {React.ReactNode} [props.leftIcon] - Icon placed before text
 * @param {React.ReactNode} [props.rightIcon] - Icon placed after text
 * @param {string} [props.to] - Router Link destination path
 * @param {string} [props.href] - External link URL
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.isLoading] - Loading spinner state
 * @param {React.ReactNode} props.children - Button label / content
 * @param {string} [props.className] - Additional class names
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - HTML button type
 * @returns {JSX.Element}
 */
export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  to,
  href,
  disabled = false,
  isLoading = false,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-body uppercase tracking-wider transition-all duration-fast select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;
  const classes = cn(baseClasses, variantClass, sizeClass, className);

  const content = (
    <>
      {isLoading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap [&>svg]:mr-0 [&>svg]:shrink-0">
        {children}
      </span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled || isLoading} className={classes} {...rest}>
      {content}
    </button>
  );
}

export default Button;
