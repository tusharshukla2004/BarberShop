import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import { saveBookingDraft, selectBookingDraft } from './bookingDraftSlice';
import { useCreateBookingRequestMutation } from './bookingApi';
import { appointmentRequestSchema } from './schema';
import { Button, DateTimeField } from '@/components/ui';
import { Calendar, User, Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Quick appointment request form embedded inside Hero glass card
 *
 * @param {Object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function AppointmentForm({ className = '' }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const draft = useAppSelector(selectBookingDraft);

  const [createBookingRequest, { isLoading, isSuccess }] = useCreateBookingRequestMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(appointmentRequestSchema),
    defaultValues: {
      name: draft.name || '',
      email: draft.email || '',
      phone: draft.phone || '',
      dateTime: draft.dateTime || '',
      serviceId: draft.serviceId || '',
      barberId: draft.barberId || '',
    },
  });

  // Keep form in sync if draft loads after initial mount
  useEffect(() => {
    if (draft.name) setValue('name', draft.name);
    if (draft.email) setValue('email', draft.email);
    if (draft.phone) setValue('phone', draft.phone);
    if (draft.dateTime) setValue('dateTime', draft.dateTime);
  }, [draft, setValue]);

  const onSubmit = async (data) => {
    try {
      // 1. Save draft to Redux + SessionStorage
      dispatch(saveBookingDraft(data));

      // 2. Call backend / MSW mock mutation
      const res = await createBookingRequest(data).unwrap();

      // 3. Dispatch success toast
      dispatch(
        addToast({
          message: res?.message || 'Appointment requested! Click to complete your reservation.',
          type: 'success',
          duration: 6000,
        })
      );
    } catch (err) {
      const errorMsg =
        err?.data?.error ||
        err?.message ||
        'Unable to submit request. Please try again or call us.';
      dispatch(
        addToast({
          message: errorMsg,
          type: 'error',
        })
      );
    }
  };

  // Dedicated custom focus-switch input class matching reference style
  const glassInputClass = cn(
    'w-full px-4 py-3 rounded-sm text-sm transition-all duration-fast outline-none select-none',
    'bg-white/5 text-white placeholder:text-white/40 border border-white/20',
    // Reference focus behavior: switches to white fill with dark ink text
    'focus:bg-white focus:text-ink focus:border-white focus:placeholder:text-ink/40 focus:ring-2 focus:ring-accent'
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn('flex flex-col gap-4 text-left w-full', className)}
    >
      {/* Full Name */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="hero-name" className="sr-only">
          Full Name
        </label>
        <div className="relative">
          <input
            id="hero-name"
            type="text"
            placeholder="Full Name *"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'hero-name-error' : undefined}
            disabled={isLoading || isSubmitting}
            className={cn(glassInputClass, errors.name && 'border-red-500 focus:border-red-500')}
            {...register('name')}
          />
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
            <User className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {errors.name && (
          <span
            id="hero-name-error"
            role="alert"
            className="text-xs font-medium text-red-400 tracking-wide"
          >
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="hero-phone" className="sr-only">
          Phone Number
        </label>
        <div className="relative">
          <input
            id="hero-phone"
            type="tel"
            placeholder="Phone Number (e.g. 98765 43210) *"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'hero-phone-error' : undefined}
            disabled={isLoading || isSubmitting}
            className={cn(glassInputClass, errors.phone && 'border-red-500 focus:border-red-500')}
            {...register('phone')}
          />
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
            <Phone className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {errors.phone && (
          <span
            id="hero-phone-error"
            role="alert"
            className="text-xs font-medium text-red-400 tracking-wide"
          >
            {errors.phone.message}
          </span>
        )}
      </div>

      {/* Email (Optional) */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="hero-email" className="sr-only">
          Email Address (Optional)
        </label>
        <div className="relative">
          <input
            id="hero-email"
            type="email"
            placeholder="Email Address (Optional)"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'hero-email-error' : undefined}
            disabled={isLoading || isSubmitting}
            className={cn(glassInputClass, errors.email && 'border-red-500 focus:border-red-500')}
            {...register('email')}
          />
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {errors.email && (
          <span
            id="hero-email-error"
            role="alert"
            className="text-xs font-medium text-red-400 tracking-wide"
          >
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Preferred Date & Time */}
      <DateTimeField
        label="Preferred Date and Time"
        hideLabel
        required
        disabled={isLoading || isSubmitting}
        error={errors.dateTime?.message}
        {...register('dateTime')}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading || isSubmitting}
          isLoading={isLoading || isSubmitting}
          rightIcon={<Calendar className="h-4 w-4" />}
          className="w-full text-center"
        >
          Submit request
        </Button>
      </div>

      {/* Post-submit Callout */}
      {isSuccess && (
        <div className="p-3.5 rounded-sm bg-accent/15 border border-accent/40 text-xs text-white flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>Draft saved! Continue to slot booking?</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/book')}
            className="font-semibold text-accent hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Complete</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </form>
  );
}

export default AppointmentForm;
