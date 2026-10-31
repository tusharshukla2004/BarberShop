import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, Scissors, ShieldAlert, Tag, Check, AlertCircle, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/formatters';
import { useCreateBookingMutation } from '@/features/booking/bookingApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetPublicOffersQuery, useValidateOfferCodeMutation } from '@/features/offers/offersApi';

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
  const [validateOfferCode, { isLoading: isValidatingPromo }] = useValidateOfferCodeMutation();

  const { data: services = [] } = useGetServicesQuery();
  const { data: barbers = [] } = useGetBarbersQuery();
  const { data: publicOffers = [] } = useGetPublicOffersQuery();

  const [promoInput, setPromoInput] = useState(draft.promoCode || '');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(
    draft.appliedOffer
      ? {
          code: draft.promoCode || draft.appliedOffer.promoCode,
          discountAmount: draft.discountAmount || 0,
          offer: draft.appliedOffer,
        }
      : null
  );
  const [limitExceededRetry, setLimitExceededRetry] = useState(false);

  const selectedService = useMemo(
    () => services.find((s) => s.id === draft.serviceId),
    [services, draft.serviceId]
  );

  const originalPrice = selectedService?.price || 0;

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

  // Filter applicable offers for suggestions
  const suggestedOffers = useMemo(() => {
    return publicOffers.filter((o) => {
      if (!o.isActive) return false;
      if (Array.isArray(o.appliesToServiceIds) && o.appliesToServiceIds.length > 0) {
        return o.appliesToServiceIds.includes(draft.serviceId);
      }
      return true;
    });
  }, [publicOffers, draft.serviceId]);

  // Auto-validate if initial offer came from draft navigation
  useEffect(() => {
    if (draft.promoCode && !appliedPromo && draft.serviceId) {
      applyPromoCode(draft.promoCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.serviceId]);

  const applyPromoCode = async (codeToApply) => {
    const cleanCode = (codeToApply || promoInput).trim().toUpperCase();
    if (!cleanCode) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoError('');
    setPromoSuccess('');

    try {
      const res = await validateOfferCode({
        code: cleanCode,
        serviceIds: draft.serviceId ? [draft.serviceId] : [],
        date: draft.date,
      }).unwrap();

      if (res.valid || res.isValid) {
        const discount = res.discountAmount || 0;
        const promoData = {
          code: cleanCode,
          discountAmount: discount,
          offer: res.offer,
        };
        setAppliedPromo(promoData);
        setPromoSuccess(
          `Offer applied! You save ${formatPrice(discount)} on this appointment.`
        );
        setPromoInput(cleanCode);
        onSaveDraft({
          appliedOffer: res.offer,
          promoCode: cleanCode,
          discountAmount: discount,
        });
      } else {
        setAppliedPromo(null);
        setPromoError(res.reason || 'Invalid promo code for this booking.');
        onSaveDraft({
          appliedOffer: null,
          promoCode: '',
          discountAmount: 0,
        });
      }
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err.message || 'Failed to validate promo code. Please try again.');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
    setPromoSuccess('');
    setLimitExceededRetry(false);
    onSaveDraft({
      appliedOffer: null,
      promoCode: '',
      discountAmount: 0,
    });
  };

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

  const onSubmit = async (formData, bypassPromo = false) => {
    onSaveDraft(formData);

    const activePromoCode = bypassPromo
      ? undefined
      : appliedPromo?.code || draft.promoCode || undefined;

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
      promoCode: activePromoCode,
    };

    try {
      const res = await createBooking(payload).unwrap();
      onSuccess(res);
    } catch (err) {
      if (err.data?.code === 'USAGE_LIMIT_REACHED' || err.data?.error?.code === 'USAGE_LIMIT_REACHED') {
        setLimitExceededRetry(true);
        setPromoError(
          'This offer just reached its usage limit concurrently. You can still confirm your appointment at the standard price.'
        );
      } else if (err.status === 409 || err.code === 'CONFLICT' || err.data?.error?.code === 'CONFLICT') {
        onConflict('That slot was just taken. Please pick another slot.');
      } else {
        onConflict(err.message || 'An error occurred while confirming your reservation.');
      }
    }
  };

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

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
            <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-5" noValidate>
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
                  Email Address <span className="text-muted font-normal">(Optional)</span>
                </label>
                <input
                  id="booking-email"
                  type="email"
                  placeholder="vikram@example.com"
                  {...register('email')}
                  className="w-full px-4 py-2.5 rounded-md bg-card border border-border-light text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Special Notes */}
              <div>
                <label
                  htmlFor="booking-notes"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
                >
                  Grooming Notes & Preferences <span className="text-muted font-normal">(Optional)</span>
                </label>
                <textarea
                  id="booking-notes"
                  rows={2}
                  placeholder="Preferred fade level, beard balm allergy, or specific styling requests..."
                  {...register('notes')}
                  className="w-full px-4 py-2.5 rounded-md bg-card border border-border-light text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {/* Promo Code Section */}
              <div className="pt-2 border-t border-border-light/60">
                <label htmlFor="promo-code-input" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-accent" />
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo-code-input"
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError('');
                    }}
                    placeholder="Enter promo code (e.g. FESTIVE20)"
                    disabled={Boolean(appliedPromo)}
                    className="flex-1 px-4 py-2 rounded-md bg-card border border-border-light text-sm text-ink placeholder-muted uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
                  />
                  {appliedPromo ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removePromoCode}
                      className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-3"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => applyPromoCode(promoInput)}
                      disabled={isValidatingPromo || !promoInput.trim()}
                      className="text-xs uppercase font-semibold px-4"
                    >
                      {isValidatingPromo ? 'Checking...' : 'Apply'}
                    </Button>
                  )}
                </div>

                {promoSuccess && (
                  <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {promoSuccess}
                  </p>
                )}

                {promoError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {promoError}
                  </p>
                )}

                {/* Offer suggestions */}
                {!appliedPromo && suggestedOffers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-muted mb-1.5">Applicable Offers:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedOffers.map((off) => (
                        <button
                          key={off.id || off._id}
                          type="button"
                          onClick={() => {
                            if (off.promoCode) {
                              setPromoInput(off.promoCode);
                              applyPromoCode(off.promoCode);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-accent/10 hover:bg-accent/20 border border-accent/25 text-[11px] font-mono font-medium text-ink transition-colors cursor-pointer"
                        >
                          <Tag className="w-3 h-3 text-accent" />
                          <span>{off.promoCode}</span>
                          <span className="text-muted font-sans">
                            ({off.type === 'percent' ? `${off.value}% Off` : `₹${off.value} Off`})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Concurrent usage limit fallback retry banner */}
              {limitExceededRetry && (
                <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-2">
                  <p className="font-medium">
                    Would you like to book without the promo discount at standard pricing?
                  </p>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    disabled={isLoading}
                    onClick={handleSubmit((data) => onSubmit(data, true))}
                    className="self-start text-xs font-semibold uppercase"
                  >
                    Proceed without Discount
                  </Button>
                </div>
              )}

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

            {/* Pricing Breakdown */}
            <div className="pt-4 border-t border-border-dark space-y-2">
              <div className="flex items-center justify-between text-xs text-on-dark-muted">
                <span>Original Service Price</span>
                <span className="font-semibold text-white">{formatPrice(originalPrice)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Promo Discount ({appliedPromo?.code})
                  </span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-border-dark/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-dark-muted font-semibold uppercase">Total Due at Studio</p>
                  <p className="text-[11px] text-accent">Zero upfront deposit required</p>
                </div>
                <span className="font-display text-2xl text-white">
                  {formatPrice(finalPrice)}
                </span>
              </div>
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
