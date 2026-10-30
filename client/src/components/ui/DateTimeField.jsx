import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

/**
 * Calculates current local date-time string for min attribute in input[type="datetime-local"]
 * @returns {string} e.g. "2026-10-30T15:30"
 */
function getMinDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * DateTimeField component with theme tokens, minimum time constraint, and focus-shift styling
 *
 * @typedef {Object} DateTimeFieldProps
 * @property {string} label - Accessible input label
 * @property {string} [error] - Error message
 * @property {boolean} [hideLabel=false] - Visually hide the label
 * @property {string} [helperText] - Supporting helper text
 * @property {string} [className] - Input element extra classes
 * @property {string} [containerClassName] - Container wrapper extra classes
 */

export const DateTimeField = forwardRef(function DateTimeField(
  {
    label,
    error,
    hideLabel = false,
    helperText,
    id,
    disabled = false,
    required = false,
    className = '',
    containerClassName = '',
    min,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const minDateTime = min || getMinDateTimeString();

  return (
    <div className={cn('flex flex-col gap-1.5 w-full text-left', containerClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          'text-xs font-semibold tracking-wider uppercase',
          hideLabel ? 'sr-only' : 'text-white/80'
        )}
      >
        {label}
        {required && (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="relative w-full">
        <input
          ref={ref}
          id={inputId}
          type="datetime-local"
          min={minDateTime}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full px-4 py-3 rounded-sm text-sm transition-all duration-fast outline-none',
            'bg-ink/75 text-white placeholder:text-white/50 border border-white/20',
            // On focus switch to white fill with ink text (reference style)
            'focus:bg-white focus:text-ink focus:border-white focus:placeholder:text-muted focus:ring-2 focus:ring-accent',
            '[color-scheme:dark] focus:[color-scheme:light]',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-400',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...rest}
        />
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-ink">
          <Calendar className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      {error ? (
        <span id={errorId} role="alert" className="text-xs font-medium text-red-400 tracking-wide">
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className="text-xs text-on-dark-muted tracking-wide">
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

DateTimeField.displayName = 'DateTimeField';

export default DateTimeField;
