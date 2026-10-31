import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { useGetPublicQueueStatusQuery } from './queueApi';

export function LiveQueueCard({ className = '' }) {
  const { data: statusData, isLoading, isError } = useGetPublicQueueStatusQuery(undefined, {
    pollingInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className={`p-4 rounded-card bg-card/60 border border-border animate-pulse ${className}`}>
        <div className="h-4 bg-muted/20 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-muted/20 rounded w-2/3"></div>
      </div>
    );
  }

  // Graceful fallback if offline or API error
  if (isError || !statusData) {
    return (
      <div className={`p-4 rounded-card bg-card/80 border border-border text-xs text-muted flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted" />
          <span>Walk-ins welcome • Standard wait times apply</span>
        </div>
        <Link to="/book" className="text-accent font-semibold hover:underline">
          Book online &rarr;
        </Link>
      </div>
    );
  }

  const {
    isOpen,
    peopleWaiting = 0,
    estimatedWaitMinutes = 0,
    publicQueueEnabled = false,
  } = statusData;

  return (
    <div
      className={`p-4 sm:p-5 rounded-card border shadow-xs transition-all ${
        isOpen
          ? 'bg-ink text-white border-white/10'
          : 'bg-card text-ink border-border'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Status Indicator & Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-muted'
              }`}
            />
            <span className="text-xs uppercase font-bold tracking-wider">
              {isOpen ? 'Live Walk-in Queue' : 'Queue Closed Today'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold">
              {isOpen ? (
                <>
                  Open now, about{' '}
                  <span className="text-accent font-bold">
                    {estimatedWaitMinutes === 0 ? '0' : estimatedWaitMinutes} minutes
                  </span>{' '}
                  wait
                </>
              ) : (
                'Currently closed for direct walk-ins'
              )}
            </p>

            {isOpen && (
              <span className="text-xs text-white/70 font-mono flex items-center gap-1">
                <Users className="w-3 h-3" />
                {peopleWaiting} waiting
              </span>
            )}
          </div>
        </div>

        {/* Right: Action link */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          {isOpen && publicQueueEnabled ? (
            <Link
              to="/queue"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Join Live Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/book"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-white text-ink hover:bg-white/90 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveQueueCard;
