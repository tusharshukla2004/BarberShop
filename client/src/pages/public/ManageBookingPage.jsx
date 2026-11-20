import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  CalendarDays,
  Shield,
} from 'lucide-react';
import Seo from '@/components/common/Seo';
import { Button, Card, Modal, Input } from '@/components/ui';
import {
  useGetManageBookingDetailsQuery,
  useManageCancelBookingMutation,
  useManageRescheduleBookingMutation,
  useGetSlotsQuery,
} from '@/features/booking/bookingApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function ManageBookingPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // Read ref and token strictly in memory
  const ref = (searchParams.get('ref') || '').trim();
  const token = (searchParams.get('token') || '').trim();

  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetManageBookingDetailsQuery(
    { ref, token },
    { skip: !ref || !token, refetchOnMountOrArgChange: true }
  );

  const [cancelBooking, { isLoading: isCancelling }] = useManageCancelBookingMutation();
  const [rescheduleBooking, { isLoading: isRescheduling }] = useManageRescheduleBookingMutation();

  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Slot discovery for reschedule
  const { data: slots = [], isLoading: isSlotsLoading } = useGetSlotsQuery(
    {
      barberId: booking?.barberId,
      serviceId: booking?.serviceId,
      date: newDate,
    },
    { skip: !rescheduleModalOpen || !newDate || !booking?.serviceId }
  );

  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const handleOpenReschedule = () => {
    setNewDate(booking?.date || minDate);
    setSelectedSlot(null);
    setRescheduleModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelBooking({
        ref,
        token,
        reason: cancelReason.trim(),
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: 'Your appointment has been cancelled successfully.',
        })
      );
      setCancelModalOpen(false);
      refetch();
    } catch (err) {
      const msg =
        err.message ||
        err.data?.message ||
        'Could not cancel appointment. Please contact the shop.';
      dispatch(addToast({ type: 'error', message: msg }));
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot) return;
    try {
      await rescheduleBooking({
        ref,
        token,
        newDate,
        newStartTime: selectedSlot.startTime,
        newEndTime: selectedSlot.endTime,
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: 'Your appointment has been rescheduled successfully.',
        })
      );
      setRescheduleModalOpen(false);
      refetch();
    } catch (err) {
      const msg =
        err.message ||
        err.data?.message ||
        'Could not reschedule appointment. Please select a different slot.';
      dispatch(addToast({ type: 'error', message: msg }));
    }
  };

  // Invalid or missing parameters
  if (!ref || !token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pt-24 pb-16 md:py-16">
        <Seo title="Manage Booking | Modern Mane Barbershop" noindex />
        <meta name="referrer" content="no-referrer" />
        <Card className="max-w-md w-full p-8 text-center space-y-4 border border-border">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-display uppercase tracking-wider text-ink">
            Invalid Appointment Link
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            The manage link is missing credentials. Please use the personalized link sent to you via
            WhatsApp or SMS after booking.
          </p>
          <div className="pt-2">
            <Link to="/">
              <Button size="sm">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Seo title="Manage Appointment | Modern Mane Barbershop" noindex />
      <meta name="referrer" content="no-referrer" />

      <div className="min-h-[75vh] pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto md:py-12">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-pill border-2 border-accent border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest text-muted font-semibold">
              Verifying security token...
            </p>
          </div>
        ) : isError || !booking ? (
          <Card className="p-8 text-center space-y-4 border border-border">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-display uppercase tracking-wider text-ink">
              Booking Not Found or Expired
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              {error?.message ||
                error?.data?.message ||
                'This booking link is invalid or has expired. If you need assistance, please call the barbershop directly.'}
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link to="/">
                <Button variant="outline" size="sm">
                  Visit Homepage
                </Button>
              </Link>
              <Link to="/book">
                <Button size="sm">Book New Appointment</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  Self-Service Portal
                </div>
                <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-ink">
                  Manage Appointment
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  Reference:{' '}
                  <span className="font-mono font-bold text-ink tracking-wider">
                    #{booking.bookingRef}
                  </span>
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {booking.status === 'confirmed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Confirmed
                  </span>
                )}
                {booking.status === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Pending Confirmation
                  </span>
                )}
                {booking.status === 'cancelled' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Cancelled
                  </span>
                )}
                {booking.status === 'completed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Appointment Details Card */}
            <Card className="p-6 border border-border divide-y divide-border">
              {/* Service & Time */}
              <div className="pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Service
                    </span>
                    <p className="font-bold text-ink text-base">{booking.serviceName}</p>
                    <p className="text-xs text-muted">₹{booking.price}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Barber
                    </span>
                    <p className="font-bold text-ink text-base">{booking.barberName}</p>
                    <p className="text-xs text-muted">Dedicated Specialist</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Date
                    </span>
                    <p className="font-bold text-ink text-base">{booking.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Time Slot
                    </span>
                    <p className="font-bold text-ink text-base">
                      {booking.startTime}
                      {booking.endTime ? ` - ${booking.endTime}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest & Shop Information */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                    Booked Under
                  </span>
                  <p className="font-semibold text-ink">{booking.customerName}</p>
                  <p className="text-muted font-mono">{booking.phone}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                    Barbershop Location
                  </span>
                  <p className="font-semibold text-ink">{booking.shopInfo?.name}</p>
                  <p className="text-muted">{booking.shopInfo?.address}</p>
                  <p className="text-muted mt-1">{booking.shopInfo?.phone}</p>
                </div>
              </div>

              {/* Self-Service Actions */}
              {['confirmed', 'pending'].includes(booking.status) && (
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-muted">
                    {booking.rescheduleCount >= booking.maxReschedules ? (
                      <span className="text-amber-600 font-medium">
                        Maximum of 2 reschedules reached. Please contact shop to change.
                      </span>
                    ) : (
                      <span>
                        Rescheduled {booking.rescheduleCount} / {booking.maxReschedules} times.
                        Cancellation notice window: {booking.cancellationPolicyHours} hours prior.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelModalOpen(true)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 flex-1 sm:flex-none"
                    >
                      Cancel Appointment
                    </Button>

                    <Button
                      size="sm"
                      disabled={booking.rescheduleCount >= booking.maxReschedules}
                      onClick={handleOpenReschedule}
                      className="bg-accent hover:bg-accent-hover text-white flex-1 sm:flex-none gap-1.5"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Reschedule
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Your Appointment"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <p className="font-semibold">Notice Policy</p>
            <p className="mt-0.5">
              Online cancellations must be made at least {booking?.cancellationPolicyHours || 2}{' '}
              hours in advance. If within this window, please contact the barbershop directly.
            </p>
          </div>

          <div>
            <label htmlFor="cancel-reason" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, feeling unwell..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Appointment
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="reschedule-date" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
              Select New Date
            </label>
            <Input
              id="reschedule-date"
              type="date"
              min={minDate}
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                setSelectedSlot(null);
              }}
              className="text-xs sm:text-sm"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
              Available Time Slots
            </span>
            {isSlotsLoading ? (
              <div className="py-6 text-center text-xs text-muted">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
                Loading open slots...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">
                No slots available on this date. Please choose another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {slots
                  .filter((s) => s.available !== false)
                  .map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded text-xs font-medium border text-center transition-colors ${
                          isSelected
                            ? 'bg-accent text-white border-accent'
                            : 'border-border hover:border-accent text-ink'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRescheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isRescheduling || !selectedSlot}
              onClick={handleConfirmReschedule}
              className="bg-accent hover:bg-accent-hover text-white"
            >
              {isRescheduling ? 'Rescheduling...' : 'Confirm New Time'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
