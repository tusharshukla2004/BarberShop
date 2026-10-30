import PropTypes from 'prop-types';

export default function FormField({
  id,
  label,
  required,
  error,
  helpText,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-ink"
        >
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}

      {children}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helpText && !error && <p className="text-[11px] text-muted">{helpText}</p>}
    </div>
  );
}

FormField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
