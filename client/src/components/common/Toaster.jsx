import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectToasts, removeToast } from '@/features/ui/uiSlice';
import { IconButton } from '@/components/ui';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Single Toast Notification item with auto-dismissal
 *
 * @param {Object} props
 * @param {import('@/features/ui/uiSlice').ToastItem} props.toast
 * @param {() => void} props.onDismiss
 */
function ToastItemComponent({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const ICONS = {
    success: <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-accent shrink-0" />,
  };

  const BORDERS = {
    success: 'border-accent/40',
    error: 'border-red-500/50',
    info: 'border-border-dark',
  };

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-md shadow-xl bg-ink text-white border text-sm animate-in fade-in slide-in-from-top-2 duration-base',
        BORDERS[toast.type] || BORDERS.info
      )}
    >
      {ICONS[toast.type] || ICONS.info}
      <p className="flex-1 text-xs sm:text-sm font-medium tracking-wide">{toast.message}</p>
      <IconButton
        aria-label="Dismiss notification"
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="text-white/60 hover:text-white"
      >
        <X className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

/**
 * Toast Container mounted globally in layout
 * @returns {JSX.Element | null}
 */
export function Toaster() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(selectToasts);

  if (!toasts.length) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItemComponent
          key={toast.id}
          toast={toast}
          onDismiss={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
}

export default Toaster;
