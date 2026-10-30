import PropTypes from 'prop-types';
import { Inbox } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  message = 'There are no items matching your criteria.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-lg border border-border-light">
      <div className="w-12 h-12 rounded-full bg-border-light flex items-center justify-center text-muted mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg text-ink tracking-wide">{title}</h3>
      <p className="text-muted text-xs sm:text-sm max-w-sm mt-1 mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button variant="accent" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
};
