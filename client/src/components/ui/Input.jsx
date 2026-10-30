import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Accessible form text input with light/dark variants and error validation display
 *
 * @typedef {Object} InputProps
 * @property {string} label - Input field label
 * @property {string} [error] - Validation error message
 * @property {'light' | 'dark'} [tone='light'] - Theme tone variant
 * @property {string} [helperText] - Supporting helper text
 * @property {string} [className] - Input element extra class names
 * @property {string} [containerClassName] - Wrapper container extra class names
 */

export const Input = forwardRef(function Input(
  {
    label,
    error,
    tone = 'light',
    helperText,
    id,
    type = 'text',
    required = false,
    disabled = false,
    className = '',
    containerClassName = '',
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const isDark = tone === 'dark';

  return (
    <div className={cn('flex flex-col gap-1.5 w-full text-left', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-xs sm:text-sm font-medium tracking-wide uppercase',
            isDark ? 'text-white/90' : 'text-ink/80',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          {label}
          {required && (
            <span className="ml-1 text-accent" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        type={type}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-sm text-sm transition-colors duration-fast outline-none',
          'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
          isDark
            ? 'bg-ink/60 text-white placeholder:text-white/40 border border-border-dark focus-visible:border-accent'
            : 'bg-white text-ink placeholder:text-muted border border-border-light focus-visible:border-accent',
          error && 'border-red-500 focus-visible:ring-red-400',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...rest}
      />

      {error ? (
        <span id={errorId} role="alert" className="text-xs font-medium text-red-500 tracking-wide">
          {error}
        </span>
      ) : helperText ? (
        <span
          id={helperId}
          className={cn('text-xs tracking-wide', isDark ? 'text-on-dark-muted' : 'text-muted')}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
