import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { User, AlertTriangle, ChevronRight } from 'lucide-react';
import { useGetCustomersQuery } from './customersApi';

/**
 * Compact customer card for slide-over drawer and reminders list
 */
export function CompactCustomerCard({ phone, customerId }) {
  const { data: customersData, isLoading } = useGetCustomersQuery(
    phone ? { search: phone } : {},
    { skip: !phone && !customerId }
  );

  const customer = useMemo(() => {
    const list = customersData?.customers || [];
    if (customerId) {
      const found = list.find((c) => (c.id || c._id) === customerId);
      if (found) return found;
    }
    if (phone) {
      const clean = phone.replace(/\D/g, '');
      return list.find((c) => c.phone.includes(clean) || clean.includes(c.phone));
    }
    return null;
  }, [customersData, phone, customerId]);

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg bg-surface border border-border-light text-xs text-muted animate-pulse">
        Loading customer history...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-3 rounded-lg bg-surface/60 border border-border-light text-xs text-ink/60">
        <div className="flex items-center gap-1.5 font-medium">
          <User className="w-3.5 h-3.5 text-ink/40" />
          <span>New Customer (No prior history)</span>
        </div>
      </div>
    );
  }

  const stats = customer.stats || {};
  const noShowCount = stats.noShowCount || 0;
  const isHighNoShow = noShowCount >= 2;
  const isFlagged = Boolean(customer.isFlagged);

  const formatDate = (isoString) => {
    if (!isoString) return 'First visit';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'First visit';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className={`p-3.5 rounded-lg border text-xs space-y-2 transition-all ${
        isFlagged || isHighNoShow
          ? 'bg-red-500/5 border-red-500/30'
          : 'bg-surface border-border-light'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-accent" />
          <span className="font-medium text-ink/80 uppercase tracking-wider text-[11px]">
            Customer Profile
          </span>
        </div>
        <Link
          to={`/admin/customers/${customer.id || customer._id}`}
          className="text-[11px] font-medium text-accent hover:underline inline-flex items-center"
        >
          View Profile <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

      {/* Flag / Repeat No-Show Alert Badge */}
      {(isFlagged || isHighNoShow) && (
        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-600 font-medium text-[11px] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {customer.flagReason || `Alert: ${noShowCount} recorded no-shows`}
          </span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <div>
          <span className="text-muted block">Completed Visits:</span>
          <span className="font-medium font-mono text-ink/80">
            {stats.completedVisits || 0} / {stats.totalVisits || 0}
          </span>
        </div>
        <div>
          <span className="text-muted block">Last Visit:</span>
          <span className="font-normal text-ink/80 truncate block">
            {formatDate(stats.lastVisitAt)}
          </span>
        </div>
      </div>

      {/* Notes Preview */}
      {customer.notes && (
        <div className="pt-1 border-t border-border-light text-[11px]">
          <span className="text-ink/50 block">Barber Notes:</span>
          <p className="text-ink/80 italic font-mono truncate">&quot;{customer.notes}&quot;</p>
        </div>
      )}
    </div>
  );
}

CompactCustomerCard.propTypes = {
  phone: PropTypes.string,
  customerId: PropTypes.string,
};

export default CompactCustomerCard;
