import { useEffect, useRef } from 'react';
import Seo from '@/components/common/Seo';
import PageBanner from '@/components/common/PageBanner';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Stepper from '@/features/booking/wizard/Stepper';
import StepService from '@/features/booking/wizard/StepService';
import StepBarber from '@/features/booking/wizard/StepBarber';
import StepDateTime from '@/features/booking/wizard/StepDateTime';
import StepDetails from '@/features/booking/wizard/StepDetails';
import StepConfirmation from '@/features/booking/wizard/StepConfirmation';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectBookingDraft,
  setBookingStep,
  saveBookingDraft,
  selectService,
  selectBarber,
  selectSlot,
  setConfirmedBooking,
  clearBookingDraft,
} from '@/features/booking/bookingDraftSlice';
import { addToast } from '@/features/ui/uiSlice';
import { trackEvent } from '@/lib/analytics';

export default function BookAppointmentPage() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectBookingDraft);

  const currentStep = draft.currentStep || 1;
  const stepStartRef = useRef(null);
  const previousStepRef = useRef(currentStep);

  useEffect(() => {
    trackEvent('booking_started');
  }, []);

  useEffect(() => {
    if (previousStepRef.current === currentStep) return;
    previousStepRef.current = currentStep;

    if (!window.matchMedia('(max-width: 767px)').matches) return;

    stepStartRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  }, [currentStep]);

  const handleStepSelect = (step) => {
    dispatch(setBookingStep(step));
  };

  const handleServiceSelect = (serviceId) => {
    dispatch(selectService(serviceId));
  };

  const handleBarberSelect = (barberId) => {
    dispatch(selectBarber(barberId));
  };

  const handleSlotSelect = (slotData) => {
    dispatch(selectSlot(slotData));
  };

  const handleSaveDetails = (detailsData) => {
    dispatch(saveBookingDraft(detailsData));
  };

  const handleBookingSuccess = (response) => {
    const booking = response.data || response;
    const isSpecificBarber = Boolean(
      draft.barberId && draft.barberId !== 'any' && draft.barberId !== 'unassigned'
    );
    const completeBooking = {
      ...booking,
      serviceId: booking.serviceId || draft.serviceId,
      barberId: isSpecificBarber ? booking.barberId || draft.barberId : '',
    };
    dispatch(setConfirmedBooking(completeBooking));
    trackEvent('booking_completed', {
      bookingId: completeBooking.id || completeBooking._id,
      serviceId: completeBooking.serviceId,
      barberId: completeBooking.barberId,
      price: completeBooking.priceAtBooking || completeBooking.price,
    });
    dispatch(
      addToast({
        type: 'success',
        message: 'Your appointment has been confirmed!',
      })
    );
  };

  const handleBookingConflict = (errorMessage) => {
    dispatch(
      addToast({
        type: 'error',
        message: errorMessage || 'That slot was just taken. Please pick another slot.',
      })
    );
    // Return to step 3 to choose a different slot
    dispatch(saveBookingDraft({ startTime: '', endTime: '' }));
    dispatch(setBookingStep(3));
  };

  const handleReset = () => {
    dispatch(clearBookingDraft());
  };

  return (
    <>
      <Seo
        title="Book an Appointment | Sovereign Barbershop"
        description="Book your bespoke haircut, hot lather straight razor shave, or beard grooming appointment online with our master barbers."
        canonical="/book"
      />

      <PageBanner
        eyebrow="Online Reservations"
        title="RESERVE YOUR CHAIR"
        description="Experience the classic barber ritual. Select your preferred treatment, master craftsman, and time."
      />

      <Section tone="cream" className="py-12 md:py-20">
        <Container>
          <div ref={stepStartRef} className="scroll-mt-24">
            {/* Stepper Navigation */}
            <Stepper currentStep={currentStep} onSelectStep={handleStepSelect} />

            {/* Wizard Step Views */}
            {currentStep === 1 && (
              <StepService
                selectedServiceId={draft.serviceId}
                onSelect={handleServiceSelect}
                onNext={() => dispatch(setBookingStep(2))}
              />
            )}

            {currentStep === 2 && (
              <StepBarber
                selectedBarberId={draft.barberId}
                onSelect={handleBarberSelect}
                onNext={() => dispatch(setBookingStep(3))}
                onBack={() => dispatch(setBookingStep(1))}
              />
            )}

            {currentStep === 3 && (
              <StepDateTime
                serviceId={draft.serviceId}
                barberId={draft.barberId}
                selectedDate={draft.date}
                selectedSlot={{
                  date: draft.date,
                  startTime: draft.startTime,
                  endTime: draft.endTime,
                }}
                onSelectSlot={handleSlotSelect}
                onNext={() => dispatch(setBookingStep(4))}
                onBack={() => dispatch(setBookingStep(2))}
              />
            )}

            {currentStep === 4 && (
              <StepDetails
                draft={draft}
                onSaveDraft={handleSaveDetails}
                onSuccess={handleBookingSuccess}
                onConflict={handleBookingConflict}
                onBack={() => dispatch(setBookingStep(3))}
              />
            )}

            {currentStep === 5 && draft.confirmedBooking && (
              <StepConfirmation
                booking={draft.confirmedBooking}
                onReset={handleReset}
              />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
