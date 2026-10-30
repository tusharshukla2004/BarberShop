import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import { saveBookingDraft, selectBookingDraft } from './bookingDraftSlice';
import { useCreateBookingRequestMutation } from './bookingApi';
import { appointmentRequestSchema } from './schema';
import { DateTimeField } from '@/components/ui';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Quick appointment request form embedded inside Hero glass card
 * Matches reference screenshot exactly:
 * - John Lennon
 * - Email
 * - Phone
 * - [ Date & Time ] [ Submit request ]
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

  useEffect(() => {
    if (draft.name) setValue('name', draft.name);
    if (draft.email) setValue('email', draft.email);
    if (draft.phone) setValue('phone', draft.phone);
    if (draft.dateTime) setValue('dateTime', draft.dateTime);
  }, [draft, setValue]);

  const onSubmit = async (data) => {
    try {
      dispatch(saveBookingDraft(data));
      const res = await createBookingRequest(data).unwrap();
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

  // Sleek dark glass input matching reference screenshot
  const glassInputClass = cn(
    'w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-fast outline-none',
    'bg-black/35 text-white placeholder:text-white/45 border border-white/20',
    '[color-scheme:dark] focus:[color-scheme:light]',
    // High-contrast focus state matching reference (white fill, black text)
    'focus:bg-white focus:text-black focus:border-white focus:placeholder:text-gray-400 focus:ring-1 focus:ring-accent'
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn('flex flex-col gap-3 text-left w-full', className)}
    >
      {/* Full Name (John Lennon) */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="hero-name" className="sr-only">
          Full Name
        </label>
        <input
          id="hero-name"
          type="text"
          placeholder="John Lennon"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'hero-name-error' : undefined}
          disabled={isLoading || isSubmitting}
          className={cn(glassInputClass, errors.name && 'border-red-500 focus:border-red-500')}
          {...register('name')}
        />
        {errors.name && (
          <span
            id="hero-name-error"
            role="alert"
            className="text-[11px] font-medium text-red-400 tracking-wide"
          >
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="hero-email" className="sr-only">
          Email
        </label>
        <input
          id="hero-email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'hero-email-error' : undefined}
          disabled={isLoading || isSubmitting}
          className={cn(glassInputClass, errors.email && 'border-red-500 focus:border-red-500')}
          {...register('email')}
        />
        {errors.email && (
          <span
            id="hero-email-error"
            role="alert"
            className="text-[11px] font-medium text-red-400 tracking-wide"
          >
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="hero-phone" className="sr-only">
          Phone
        </label>
        <input
          id="hero-phone"
          type="tel"
          placeholder="Phone"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'hero-phone-error' : undefined}
          disabled={isLoading || isSubmitting}
          className={cn(glassInputClass, errors.phone && 'border-red-500 focus:border-red-500')}
          {...register('phone')}
        />
        {errors.phone && (
          <span
            id="hero-phone-error"
            role="alert"
            className="text-[11px] font-medium text-red-400 tracking-wide"
          >
            {errors.phone.message}
          </span>
        )}
      </div>

      {/* Date & Time + Submit Button Row (Matching reference screenshot exactly) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 pt-1">
        <div className="flex-1">
          <DateTimeField
            id="hero-datetime"
            label="Preferred Date and Time"
            hideLabel
            required
            disabled={isLoading || isSubmitting}
            error={errors.dateTime?.message}
            {...register('dateTime')}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="bg-accent hover:bg-accent-hover text-ink font-semibold text-xs sm:text-sm px-4 sm:px-5 rounded-lg whitespace-nowrap transition-colors shadow-md hover:shadow-lg disabled:opacity-50 shrink-0 h-[42px] flex items-center justify-center cursor-pointer select-none"
        >
          {isLoading || isSubmitting ? 'Requesting...' : 'Submit request'}
        </button>
      </div>

      {/* Post-submit Callout */}
      {isSuccess && (
        <div className="p-3 rounded-lg bg-accent/20 border border-accent/40 text-xs text-white flex items-center justify-between gap-2 mt-2">
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
