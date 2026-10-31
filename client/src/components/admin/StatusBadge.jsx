import PropTypes from 'prop-types';

const STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  pending: {
    label: 'Pending',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  no_show: {
    label: 'No Show',
    classes: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  active: {
    label: 'Active',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  inactive: {
    label: 'Inactive',
    classes: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
  live: {
    label: 'Live',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  scheduled: {
    label: 'Scheduled',
    classes: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  expired: {
    label: 'Expired',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  captured: {
    label: 'Captured',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  paid: {
    label: 'Paid',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  refunded: {
    label: 'Refunded',
    classes: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  partially_refunded: {
    label: 'Part. Refunded',
    classes: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  failed: {
    label: 'Failed',
    classes: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  created: {
    label: 'Created',
    classes: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  pending_payment: {
    label: 'Pending Payment',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
};

export default function StatusBadge({ status }) {
  const norm = String(status || '').toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIG[norm] || {
    label: status || 'Unknown',
    classes: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.classes} uppercase tracking-wider`}
    >
      {config.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};
