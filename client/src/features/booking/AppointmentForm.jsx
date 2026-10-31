import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import { saveBookingDraft, selectBookingDraft } from './bookingDraftSlice';
import { useCreateBookingRequestMutation } from './bookingApi';
import { appointmentRequestSchema } from './schema';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Calculates current local date-time string for min attribute in input[type="datetime-local"]
 * @returns {string} e.g. "2026-10-30T15:30"
 */
function getMinDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Quick appointment request form embedded inside Hero glass card
 * Matching the exact reference layout with side-by-side date & submit button
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
      whatsappConsent: draft.whatsappConsent || false,
    },
  });

  useEffect(() => {
    if (draft.name) setValue('name', draft.name);
    if (draft.email) setValue('email', draft.email);
    if (draft.phone) setValue('phone', draft.phone);
    if (draft.dateTime) setValue('dateTime', draft.dateTime);
    if (typeof draft.whatsappConsent === 'boolean') {
      setValue('whatsappConsent', draft.whatsappConsent);
    }
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

  const glassInputClass = cn(
    'w-full px-3.5 py-2.5 sm:py-3 rounded-md text-sm transition-all duration-fast outline-none',
    'bg-black/35 text-white placeholder:text-white/45 border border-white/20',
    '[color-scheme:dark] focus:[color-scheme:light]',
    'focus:bg-white focus:text-ink focus:border-white focus:placeholder:text-muted focus:ring-2 focus:ring-accent'
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn('flex flex-col gap-3 text-left w-full', className)}
    >
      {/* Full Name */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="hero-name" className="sr-only">
          Full Name
        </label>
        <input
          id="hero-name"
          type="text"
          placeholder="Full Name (e.g. John Lennon) *"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'hero-name-error' : undefined}
          disabled={isLoading || isSubmitting}
          className={cn(glassInputClass, errors.name && 'border-red-500')}
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

      {/* Email (Optional) */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="hero-email" className="sr-only">
          Email Address (Optional)
        </label>
        <input
          id="hero-email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'hero-email-error' : undefined}
          disabled={isLoading || isSubmitting}
          className={cn(glassInputClass, errors.email && 'border-red-500')}
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
          Phone Number
        </label>
        <input
          id="hero-phone"
          type="tel"
          placeholder="Phone Number *"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'hero-phone-error' : undefined}
          disabled={isLoading || isSubmitting}
          className={cn(glassInputClass, errors.phone && 'border-red-500')}
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

      {/* Row 4: Date & Time + Submit Button side-by-side matching screenshot */}
      <div className="flex flex-col gap-1 w-full pt-1">
        <label htmlFor="hero-datetime" className="sr-only">
          Preferred Date and Time
        </label>
        <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-center">
          <div className="col-span-7">
            <input
              id="hero-datetime"
              type="datetime-local"
              min={getMinDateTimeString()}
              required
              disabled={isLoading || isSubmitting}
              aria-invalid={Boolean(errors.dateTime)}
              aria-describedby={errors.dateTime ? 'hero-datetime-error' : undefined}
              className={cn(
                'w-full px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-md text-xs sm:text-sm transition-all duration-fast outline-none',
                'bg-black/35 text-white placeholder:text-white/45 border border-white/20 [color-scheme:dark]',
                'focus:bg-white focus:text-ink focus:border-white focus:ring-2 focus:ring-accent focus:[color-scheme:light]',
                errors.dateTime && 'border-red-500'
              )}
              {...register('dateTime')}
            />
          </div>
          <div className="col-span-5">
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full py-2.5 sm:py-3 px-2 sm:px-3 rounded-md bg-[#f9a55a] hover:bg-[#e89243] text-ink font-semibold text-xs sm:text-sm tracking-wide transition-colors text-center whitespace-nowrap shadow-sm disabled:opacity-50"
            >
              {isLoading || isSubmitting ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </div>
        {errors.dateTime && (
          <span
            id="hero-datetime-error"
            role="alert"
            className="text-[11px] font-medium text-red-400 tracking-wide"
          >
            {errors.dateTime.message}
          </span>
        )}
      </div>

      {/* WhatsApp Consent Checkbox & Privacy Notice */}
      <div className="space-y-1 pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-white/90 hover:text-white">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-white/30 text-accent focus:ring-accent bg-black/40 accent-[#f9a55a]"
            {...register('whatsappConsent')}
          />
          <span>Send me booking updates on WhatsApp</span>
        </label>
        <span className="text-[10px] text-white/50 block pl-5.5">
          We use your phone number only for booking updates.
        </span>
      </div>

      {/* Post-submit Callout */}
      {isSuccess && (
        <div className="p-3 rounded-md bg-accent/15 border border-accent/40 text-xs text-white flex items-center justify-between gap-2 mt-2">
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
