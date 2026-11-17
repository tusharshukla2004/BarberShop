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
      // Parse chosen date and time from datetime-local input
      let extractedDate = '';
      let extractedTime = '';
      if (data.dateTime) {
        const dt = new Date(data.dateTime);
        if (!isNaN(dt.getTime())) {
          extractedDate = dt.toISOString().split('T')[0];
          const hours = dt.getHours();
          const mins = dt.getMinutes();
          const period = hours >= 12 ? 'PM' : 'AM';
          const formattedH = (hours % 12 || 12).toString().padStart(2, '0');
          const formattedM = mins.toString().padStart(2, '0');
          extractedTime = `${formattedH}:${formattedM} ${period}`;
        }
      }

      dispatch(
        saveBookingDraft({
          ...data,
          customerName: data.name,
          date: extractedDate || draft.date,
          startTime: extractedTime || draft.startTime,
          currentStep: 1, // Start wizard at service/barber selection
        })
      );

      const res = await createBookingRequest(data).unwrap();
      dispatch(
        addToast({
          message: res?.message || 'Appointment details saved! Redirecting to select your barber & service...',
          type: 'success',
          duration: 3500,
        })
      );

      // Seamlessly redirect to the full booking wizard to select service & barber
      navigate('/book');
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

      {/* Submit Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-[#f9a55a] hover:bg-[#e89243] text-ink font-semibold text-sm tracking-wider uppercase transition-all duration-200 text-center whitespace-nowrap shadow-md disabled:opacity-50 hover:shadow-lg active:scale-[0.99]"
        >
          {isLoading || isSubmitting ? 'Continuing to booking...' : 'Continue to Book Appointment'}
        </button>
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
