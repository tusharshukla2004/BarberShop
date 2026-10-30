import { Button } from '@/components/ui';
import { AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable Query State Handler
 * Renders loading skeleton, error view with retry, empty state, or loaded children
 *
 * @param {Object} props
 * @param {boolean} props.isLoading - Whether query is actively fetching
 * @param {boolean} props.isError - Whether query encountered a failure
 * @param {import('@/types').ApiError | any} [props.error] - Normalized error object
 * @param {boolean} [props.isEmpty=false] - Whether data payload is empty
 * @param {string} [props.emptyMessage='No items currently available.'] - Message for empty state
 * @param {React.ReactNode} [props.skeleton] - Custom loading skeleton
 * @param {() => void} [props.onRetry] - Retry callback
 * @param {React.ReactNode} props.children - Content to display on success
 * @param {string} [props.className] - Container classes
 * @returns {JSX.Element}
 */
export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyMessage = 'No items currently available.',
  skeleton,
  onRetry,
  children,
  className = '',
}) {
  if (isLoading) {
    if (skeleton) return <>{skeleton}</>;
    return (
      <div className={cn('w-full py-12 flex items-center justify-center animate-pulse', className)}>
        <span className="text-xs uppercase tracking-widest text-muted font-semibold">
          Loading Data...
        </span>
      </div>
    );
  }

  if (isError) {
    const errorText = error?.message || 'Unable to retrieve information from the server.';
    return (
      <div
        className={cn(
          'w-full p-8 rounded-lg bg-card border border-border-light text-center flex flex-col items-center justify-center max-w-md mx-auto',
          className
        )}
      >
        <div className="h-10 w-10 rounded-pill bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h4 className="font-display text-2xl text-ink uppercase tracking-wide">Data Fetch Error</h4>
        <p className="text-xs sm:text-sm text-muted mt-1 mb-5 leading-relaxed">{errorText}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        className={cn(
          'w-full p-8 rounded-lg bg-card border border-border-light text-center flex flex-col items-center justify-center max-w-md mx-auto',
          className
        )}
      >
        <div className="h-10 w-10 rounded-pill bg-ink/5 text-muted flex items-center justify-center mb-3">
          <Inbox className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default QueryState;
