import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, Scissors, ShieldAlert } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/formatters';
import { useCreateBookingMutation } from '@/features/booking/bookingApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';

const bookingDetailsSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:(?:\+|0{0,2})91(\s*[- ]\s*)?|[0]?)?[6789]\d{9}$/,
      'Please enter a valid 10-digit Indian mobile number'
    ),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
  whatsappConsent: z.boolean().optional().default(false),
  agreedToPolicy: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the appointment policy to proceed' }),
  }),
});

export default function StepDetails({
  draft,
  onSaveDraft,
  onSuccess,
  onConflict,
  onBack,
}) {
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const { data: services = [] } = useGetServicesQuery();
  const { data: barbers = [] } = useGetBarbersQuery();

  const selectedService = useMemo(
    () => services.find((s) => s.id === draft.serviceId),
    [services, draft.serviceId]
  );

  const selectedBarber = useMemo(() => {
    if (!draft.barberId || draft.barberId === 'any') {
      return { id: 'any', name: 'First Available Master Barber', role: 'Concierge Assigned' };
    }
    return (
      barbers.find((b) => b.id === draft.barberId) || {
        id: draft.barberId,
        name: 'Master Barber',
        role: 'Stylist',
      }
    );
  }, [barbers, draft.barberId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues: {
      customerName: draft.customerName || draft.name || '',
      phone: draft.phone || '',
      email: draft.email || '',
      notes: draft.notes || '',
      whatsappConsent: draft.whatsappConsent || false,
      agreedToPolicy: draft.agreedToPolicy || false,
    },
  });

  const onSubmit = async (formData) => {
    onSaveDraft(formData);

    const payload = {
      customerName: formData.customerName,
      phone: formData.phone,
      email: formData.email,
      serviceId: draft.serviceId || 'srv-1',
      barberId: draft.barberId && draft.barberId !== 'any' ? draft.barberId : '',
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime || draft.startTime,
      notes: formData.notes,
      whatsappConsent: Boolean(formData.whatsappConsent),
    };

    try {
      const res = await createBooking(payload).unwrap();
      onSuccess(res);
    } catch (err) {
      if (err.status === 409 || err.code === 'CONFLICT' || err.data?.error?.code === 'CONFLICT') {
        onConflict('That slot was just taken. Please pick another slot.');
      } else {
        onConflict(err.message || 'An error occurred while confirming your reservation.');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl text-ink tracking-wide uppercase">
          4. Your Details & Reservation Summary
        </h2>
        <p className="text-muted text-sm mt-1">
          Review your selection and enter your contact details to reserve your chair.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Details (Left) */}
        <div className="lg:col-span-7">
          <Card tone="light" className="p-6 sm:p-8 border border-border-light shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="booking-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
                >
                  Full Name <span className="text-accent">*</span>
                </label>
                <input
                  id="booking-name"
                  type="text"
                  placeholder="e.g. Vikram Malhotra"
                  {...register('customerName')}
                  className={`w-full px-4 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.customerName ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-600">{errors.customerName.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="booking-phone"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
                >
                  Phone Number <span className="text-accent">*</span>
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  {...register('phone')}
                  className={`w-full px-4 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.phone ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="booking-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
                >
                  Email Address <span className="text-muted text-[10px] lowercase">(optional)</span>
                </label>
                <input
                  id="booking-email"
                  type="email"
                  placeholder="e.g. vikram@example.com"
                  {...register('email')}
                  className={`w-full px-4 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.email ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="booking-notes"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
                >
                  Special Notes or Style Requests
                </label>
                <textarea
                  id="booking-notes"
                  rows={3}
                  placeholder="e.g. Low skin taper fade, beard sculpting, or complimentary espresso preference..."
                  {...register('notes')}
                  className="w-full px-4 py-2.5 rounded-md bg-card border border-border-light text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {/* WhatsApp Opt-in Checkbox & Privacy Note */}
              <div className="pt-2 space-y-1">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('whatsappConsent')}
                    className="h-4 w-4 rounded border-border-light text-accent focus:ring-accent accent-accent"
                  />
                  <span className="text-xs text-ink/85 font-medium">
                    Send me booking updates on WhatsApp
                  </span>
                </label>
                <span className="text-[11px] text-muted block pl-7">
                  We use your phone number only for booking updates.
                </span>
              </div>

              {/* Policy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreedToPolicy')}
                    className="mt-1 h-4 w-4 rounded border-border-light text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-muted leading-relaxed">
                    I acknowledge that Sovereign Barbershop provides complimentary cancellation up to 2 hours prior to the appointment. Payment is settled at the studio after your service.
                  </span>
                </label>
                {errors.agreedToPolicy && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.agreedToPolicy.message}
                  </p>
                )}
              </div>

              {/* Nav Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-border-light/50">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onBack}
                  className="text-xs uppercase font-semibold"
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  disabled={isLoading}
                  className="px-8 tracking-wider uppercase font-semibold text-xs"
                >
                  {isLoading ? 'Confirming...' : 'Confirm Appointment'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Booking Summary Card (Right) */}
        <div className="lg:col-span-5">
          <Card tone="brown" className="p-6 text-white border border-border-dark space-y-5">
            <h3 className="font-display text-xl tracking-wider uppercase text-accent border-b border-border-dark pb-3">
              Appointment Summary
            </h3>

            {/* Service info */}
            <div className="flex items-start gap-3">
              <Scissors className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-on-dark-muted uppercase font-semibold">Service</p>
                <p className="font-display text-lg text-white">
                  {selectedService?.name || 'Selected Treatment'}
                </p>
                <p className="text-xs text-on-dark-muted">{selectedService?.durationMinutes || 45} mins</p>
              </div>
            </div>

            {/* Barber info */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-on-dark-muted uppercase font-semibold">Master Craftsman</p>
                <p className="font-semibold text-sm text-white">{selectedBarber.name}</p>
                <p className="text-xs text-on-dark-muted">{selectedBarber.role}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-on-dark-muted uppercase font-semibold">Date</p>
                <p className="font-semibold text-sm text-white">{draft.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-on-dark-muted uppercase font-semibold">Time Slot</p>
                <p className="font-semibold text-sm text-white">
                  {draft.startTime} {draft.endTime ? `– ${draft.endTime}` : ''}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-border-dark flex items-center justify-between">
              <div>
                <p className="text-xs text-on-dark-muted">Total Due at Studio</p>
                <p className="text-[11px] text-accent">Zero upfront deposit required</p>
              </div>
              <span className="font-display text-2xl text-white">
                {selectedService ? formatPrice(selectedService.price) : '₹850'}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

StepDetails.propTypes = {
  draft: PropTypes.object.isRequired,
  onSaveDraft: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onConflict: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
