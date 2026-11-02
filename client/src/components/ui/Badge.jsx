import PropTypes from 'prop-types';

export default function Badge({ children, variant = 'default', className = '', ...props }) {
  const variantStyles = {
    default: 'bg-muted/15 text-ink border-border',
    destructive: 'bg-rose-100 text-rose-800 border-rose-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    accent: 'bg-accent/15 text-accent border-accent/20',
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'destructive', 'success', 'warning', 'accent']),
  className: PropTypes.string,
};

