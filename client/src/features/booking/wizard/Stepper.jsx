import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

const STEPS = [
  { step: 1, label: 'Service' },
  { step: 2, label: 'Barber' },
  { step: 3, label: 'Date & Time' },
  { step: 4, label: 'Details' },
];

export default function Stepper({ currentStep, onSelectStep }) {
  // If in confirmation screen (step 5), hide clickable stepper
  if (currentStep >= 5) return null;

  return (
    <nav aria-label="Booking steps" className="mb-10 sm:mb-12">
      <ol className="flex items-center justify-between max-w-2xl mx-auto relative">
        {/* Connecting progress line */}
        <div
          className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-border-light -z-0"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-accent transition-all duration-300 -z-0"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          aria-hidden="true"
        />

        {STEPS.map(({ step, label }) => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const isClickable = isCompleted;

          return (
            <li key={step} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                aria-label={`Step ${step}: ${label}`}
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep(step)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-display text-sm sm:text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isCompleted
                    ? 'bg-accent text-white hover:opacity-90 cursor-pointer shadow-md'
                    : isCurrent
                      ? 'bg-ink text-white ring-4 ring-accent/30 shadow-lg'
                      : 'bg-card text-muted border border-border-light cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step}
              </button>

              <span
                className={`mt-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-colors ${
                  isCurrent ? 'text-ink font-bold' : isCompleted ? 'text-accent' : 'text-muted'
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Stepper.propTypes = {
  currentStep: PropTypes.number.isRequired,
  onSelectStep: PropTypes.func.isRequired,
};
