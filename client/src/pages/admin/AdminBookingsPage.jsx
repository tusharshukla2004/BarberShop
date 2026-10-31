import { useState, useMemo } from 'react';
import {
  Calendar,
  Eye,
  RefreshCw,
  X,
  Phone,
  Mail,
  User,
  Scissors,
  FileText,
  Crown,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import QueryState from '@/components/common/QueryState';
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useUpdateBookingMutation,
  useGetSlotsQuery,
} from '@/features/booking/bookingApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';
import { WhatsAppActionMenu } from '@/features/booking/admin/WhatsAppActions';
import { CompactCustomerCard } from '@/features/customers/CompactCustomerCard';
import {
  useGetCustomerWalletQuery,
  useConsumePackageSessionMutation,
  useReversePackageSessionMutation,
  useRedeemLoyaltyRewardMutation,
} from '@/features/wallet/walletApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsOwner } from '@/features/auth/authSlice';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminBookingsPage() {
  const dispatch = useAppDispatch();
  const { data: bookings = [], isLoading, isError, error, refetch } = useGetBookingsQuery();
  const { data: barbers = [] } = useGetBarbersQuery();
  const { data: services = [] } = useGetServicesQuery();
  const { data: settings = {} } = useGetSettingsQuery();

  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [updateBooking, { isLoading: isRescheduling }] = useUpdateBookingMutation();

  // Filters
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Drawer & Reschedule modal state
  const [detailBooking, setDetailBooking] = useState(null);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);

  // Filtered rows
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedBarber && b.barberId !== selectedBarber) return false;
      if (selectedStatus && b.status !== selectedStatus) return false;
      if (selectedDate && b.date !== selectedDate) return false;
      return true;
    });
  }, [bookings, selectedBarber, selectedStatus, selectedDate]);

  const serviceMap = useMemo(() => {
    const map = {};
    services.forEach((s) => (map[s.id] = s.name));
    return map;
  }, [services]);

  const barberMap = useMemo(() => {
    const map = {};
    barbers.forEach((b) => (map[b.id] = b.name));
    return map;
  }, [barbers]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus({ id: bookingId, status: newStatus }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `Booking status updated to ${newStatus}.`,
        })
      );
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err.message || 'Failed to update booking status.',
        })
      );
    }
  };

  const columns = [
    {
      key: 'date',
      label: 'Date & Time',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-ink block">{row.date}</span>
          <span className="text-muted text-[11px]">{row.startTime}</span>
        </div>
      ),
    },
    {
      key: 'customerName',
      label: 'Client',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-ink block">{row.customerName}</span>
          <span className="text-muted text-[11px]">{row.phone}</span>
        </div>
      ),
    },
    {
      key: 'serviceId',
      label: 'Treatment',
      render: (val) => serviceMap[val] || val || 'Haircut',
    },
    {
      key: 'barberId',
      label: 'Master',
      render: (val) => barberMap[val] || val || 'Devraj',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          aria-label={`Update status for ${row.customerName}`}
          className="text-xs px-2 py-1 rounded bg-card border border-border-light text-ink focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      ),
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      render: (val, row) => (
        <WhatsAppActionMenu
          booking={row}
          settings={settings}
          serviceName={serviceMap[row.serviceId]}
          barberName={barberMap[row.barberId]}
          variant="dropdown"
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="View Details"
            onClick={() => setDetailBooking(row)}
            aria-label={`View details for ${row.customerName}`}
            className="p-1.5 rounded hover:bg-card text-muted hover:text-ink transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Reschedule Slot"
            onClick={() => setRescheduleBooking(row)}
            aria-label={`Reschedule booking for ${row.customerName}`}
            className="p-1.5 rounded hover:bg-card text-muted hover:text-accent transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink tracking-wide uppercase">
          APPOINTMENT RESERVATIONS
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-0.5">
          Manage, reschedule, and monitor client bookings across all master craftsmen.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-lg bg-white border border-border-light flex flex-wrap items-center gap-3 shadow-sm">
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="filter-barber-select" className="text-[10px] uppercase font-bold text-muted block mb-1">
            Barber
          </label>
          <select
            id="filter-barber-select"
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded bg-card border border-border-light text-ink focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All Barbers</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label htmlFor="filter-status-select" className="text-[10px] uppercase font-bold text-muted block mb-1">
            Status
          </label>
          <select
            id="filter-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded bg-card border border-border-light text-ink focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label htmlFor="filter-date-input" className="text-[10px] uppercase font-bold text-muted block mb-1">
            Date
          </label>
          <input
            id="filter-date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded bg-card border border-border-light text-ink focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {(selectedBarber || selectedStatus || selectedDate) && (
          <div className="self-end">
            <button
              type="button"
              onClick={() => {
                setSelectedBarber('');
                setSelectedStatus('');
                setSelectedDate('');
              }}
              className="text-xs text-accent hover:underline font-semibold pb-1.5"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DataTable
          columns={columns}
          data={filteredBookings}
          searchPlaceholder="Search client name or phone..."
          searchKeys={['customerName', 'phone', 'email']}
          pageSize={10}
          emptyTitle="No Bookings Found"
          emptyMessage="No reservations match your current filter parameters."
        />
      </QueryState>

      {/* Detail Drawer */}
      {detailBooking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-drawer-title"
          className="fixed inset-0 z-50 flex justify-end"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
            aria-hidden="true"
          />
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-border-light pb-4 mb-6">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">
                    Booking #{detailBooking.id?.slice(-6) || 'Details'}
                  </span>
                  <h2 id="detail-drawer-title" className="font-display text-2xl text-ink">
                    RESERVATION DETAILS
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailBooking(null)}
                  aria-label="Close detail drawer"
                  className="p-1.5 rounded-full hover:bg-card text-muted hover:text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-3 rounded bg-card">
                  <span className="font-semibold text-muted">Status:</span>
                  <StatusBadge status={detailBooking.status} />
                </div>

                {/* Compact Customer Profile & History Card */}
                <CompactCustomerCard
                  phone={detailBooking.phone}
                  customerId={detailBooking.customerId}
                />

                <div className="flex items-start gap-3 p-3 rounded bg-card">
                  <User className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-muted font-bold block">Client</span>
                    <span className="font-semibold text-ink">{detailBooking.customerName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded bg-card">
                  <Phone className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-muted font-bold block">Phone</span>
                    <a href={`tel:${detailBooking.phone}`} className="text-ink hover:underline">
                      {detailBooking.phone}
                    </a>
                  </div>
                </div>

                {detailBooking.email && (
                  <div className="flex items-start gap-3 p-3 rounded bg-card">
                    <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-muted font-bold block">Email</span>
                      <span className="text-ink">{detailBooking.email}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 rounded bg-card">
                  <Calendar className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-muted font-bold block">Appointment</span>
                    <span className="font-semibold text-ink">{detailBooking.date} at {detailBooking.startTime}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded bg-card">
                  <Scissors className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-muted font-bold block">Treatment & Master</span>
                    <span className="text-ink font-semibold">
                      {serviceMap[detailBooking.serviceId] || 'Haircut'} with {barberMap[detailBooking.barberId] || 'Devraj'}
                    </span>
                  </div>
                </div>

                {detailBooking.notes && (
                  <div className="flex items-start gap-3 p-3 rounded bg-card">
                    <FileText className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-muted font-bold block">Special Notes</span>
                      <p className="text-ink mt-0.5 leading-relaxed">{detailBooking.notes}</p>
                    </div>
                  </div>
                )}

                {/* WhatsApp Communication & History Card */}
                <div className="p-3.5 rounded-lg bg-[#25D366]/5 border border-[#25D366]/30 space-y-3">
                  <span className="text-[11px] font-bold text-[#128C7E] uppercase tracking-wider block border-b border-[#25D366]/20 pb-1.5">
                    WhatsApp Communication & Updates
                  </span>

                  <WhatsAppActionMenu
                    booking={detailBooking}
                    settings={settings}
                    serviceName={serviceMap[detailBooking.serviceId]}
                    barberName={barberMap[detailBooking.barberId]}
                    variant="buttons"
                  />

                  {/* Delivery Timestamps */}
                  <div className="pt-2 border-t border-[#25D366]/20 text-[11px] space-y-1 text-ink/70">
                    <div className="flex justify-between">
                      <span>Confirmation:</span>
                      <span className="font-medium text-ink">
                        {detailBooking.confirmationSentAt
                          ? new Date(detailBooking.confirmationSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Not sent'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reminder:</span>
                      <span className="font-medium text-ink">
                        {detailBooking.reminderSentAt
                          ? new Date(detailBooking.reminderSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Not sent'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Review Request:</span>
                      <span className="font-medium text-ink">
                        {detailBooking.reviewRequestSentAt
                          ? new Date(detailBooking.reviewRequestSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Not sent'}
                      </span>
                    </div>
                  </div>

                  {/* Notification History Log */}
                  {Array.isArray(detailBooking.notifications) && detailBooking.notifications.length > 0 && (
                    <div className="pt-2 border-t border-[#25D366]/20">
                      <span className="text-[10px] uppercase font-bold text-muted block mb-1">
                        Notification Log ({detailBooking.notifications.length})
                      </span>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {detailBooking.notifications.map((notif, idx) => (
                          <div
                            key={notif._id || idx}
                            className="text-[10px] p-1.5 rounded bg-white border border-border-light flex items-center justify-between"
                          >
                            <span className="font-semibold text-ink capitalize">
                              {notif.type?.replace('_', ' ')}
                            </span>
                            <span className="text-muted">
                              {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                              by {notif.by || 'staff'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Package, Membership & Loyalty Perks in Drawer */}
                <BookingWalletBenefits
                  booking={detailBooking}
                  onBenefitUpdated={() => {
                    refetch();
                    setDetailBooking(null);
                  }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border-light flex gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  const bk = detailBooking;
                  setDetailBooking(null);
                  setRescheduleBooking(bk);
                }}
                className="w-full justify-center text-xs tracking-wider uppercase font-semibold"
              >
                Reschedule Slot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {rescheduleBooking && (
        <RescheduleDialog
          booking={rescheduleBooking}
          isRescheduling={isRescheduling}
          onClose={() => setRescheduleBooking(null)}
          onConfirm={async (newDate, newSlot) => {
            try {
              await updateBooking({
                id: rescheduleBooking.id,
                date: newDate,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
              }).unwrap();
              dispatch(
                addToast({
                  type: 'success',
                  message: `Appointment rescheduled to ${newDate} at ${newSlot.startTime}.`,
                })
              );
              setRescheduleBooking(null);
            } catch (err) {
              dispatch(
                addToast({
                  type: 'error',
                  message: err.message || 'Cannot reschedule to this slot. It may be booked.',
                })
              );
            }
          }}
        />
      )}
    </div>
  );
}

function RescheduleDialog({ booking, isRescheduling, onClose, onConfirm }) {
  const [targetDate, setTargetDate] = useState(booking.date || new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { data: slots = [], isLoading } = useGetSlotsQuery({
    barberId: booking.barberId,
    serviceId: booking.serviceId,
    date: targetDate,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" aria-hidden="true" />

      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl border border-border-light relative animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border-light pb-3 mb-4">
          <h3 id="reschedule-modal-title" className="font-display text-xl text-ink">
            RESCHEDULE APPOINTMENT
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reschedule dialog"
            className="p-1 rounded text-muted hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted mb-4">
          Rescheduling for <span className="font-semibold text-ink">{booking.customerName}</span>. Choose a new date and available slot.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="reschedule-date-input" className="text-xs font-semibold uppercase text-ink block mb-1">
              Select Date
            </label>
            <input
              id="reschedule-date-input"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full px-3 py-2 rounded-md bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-ink block mb-2">
              Available Slots
            </span>

            {isLoading ? (
              <p className="text-xs text-muted py-4 text-center">Loading open slots...</p>
            ) : slots.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center bg-card rounded">
                No available slots for this date.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded text-xs border transition-colors ${
                        isSelected
                          ? 'bg-ink text-white border-ink font-semibold'
                          : slot.isAvailable
                            ? 'bg-card text-ink border-border-light hover:border-accent'
                            : 'bg-card/40 text-muted/50 border-border-light/40 cursor-not-allowed'
                      }`}
                    >
                      <span>{slot.startTime}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border-light pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            disabled={!selectedSlot || isRescheduling}
            onClick={() => onConfirm(targetDate, selectedSlot)}
          >
            {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </div>
      </div>
    </div>
  );
}


function BookingWalletBenefits({ booking, onBenefitUpdated }) {
  const dispatch = useAppDispatch();
  const isOwner = useAppSelector(selectIsOwner);
  const { data: wallet = {} } = useGetCustomerWalletQuery(booking.customerId, {
    skip: !booking.customerId,
  });

  const [consumeSession, { isLoading: isConsuming }] = useConsumePackageSessionMutation();
  const [reverseSession, { isLoading: isReversing }] = useReversePackageSessionMutation();
  const [redeemReward, { isLoading: isRedeeming }] = useRedeemLoyaltyRewardMutation();

  if (!booking.customerId) return null;

  const activePackages = (wallet.packages || []).filter(
    (p) => p.status === 'active' && p.sessionsRemaining > 0
  );
  const eligiblePackage = activePackages.find(
    (p) => !p.serviceIds || p.serviceIds.length === 0 || p.serviceIds.includes(booking.serviceId)
  );

  const activeMembership = wallet.membership;
  const loyalty = wallet.loyalty || { balance: 0, stampsForReward: 10 };
  const isLoyaltyReady = (loyalty.balance || 0) >= (loyalty.stampsForReward || 10);

  const appliedType = booking.appliedBenefitType || 'none';

  const handleApplyPackageSession = async () => {
    if (!eligiblePackage) return;
    try {
      await consumeSession({
        customerId: booking.customerId,
        customerPackageId: eligiblePackage.id || eligiblePackage._id,
        bookingId: booking.id || booking._id,
        serviceId: booking.serviceId,
      }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: 'Package session applied! Booking price set to ₹0.',
        })
      );
      onBenefitUpdated?.();
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.message || 'Failed to apply package session.',
        })
      );
    }
  };

  const handleReversePackageSession = async () => {
    const custPkgId = booking.appliedBenefitDetails?.customerPackageId;
    if (!custPkgId) return;
    try {
      await reverseSession({
        customerId: booking.customerId,
        customerPackageId: custPkgId,
        bookingId: booking.id || booking._id,
        reason: 'Staff reversed applied package session from booking drawer',
      }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Package session reversed.' }));
      onBenefitUpdated?.();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to reverse session.' }));
    }
  };

  const handleRedeemLoyalty = async () => {
    try {
      await redeemReward({
        customerId: booking.customerId,
        bookingId: booking.id || booking._id,
        stampsToRedeem: loyalty.stampsForReward || 10,
        notes: `Free haircut redeemed on booking #${booking.id || booking._id}`,
      }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: 'Loyalty reward redeemed! Booking price set to ₹0.',
        })
      );
      onBenefitUpdated?.();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to redeem reward.' }));
    }
  };

  return (
    <div className="p-3.5 rounded-lg border border-accent/30 bg-accent/5 space-y-2.5 text-xs">
      <div className="flex justify-between items-center border-b border-accent/20 pb-1.5">
        <span className="font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Package, Membership & Loyalty Perks
        </span>
        <span className="text-[11px] font-mono text-muted">
          Current Price: <strong className="text-ink">₹{booking.priceAtBooking ?? 0}</strong>
        </span>
      </div>

      {appliedType === 'package' ? (
        <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex justify-between items-center">
          <div>
            <span className="font-bold block">✓ Package Session Applied (100% Free)</span>
            <span className="text-[10px] text-emerald-700">Service price adjusted to ₹0</span>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReversePackageSession}
              disabled={isReversing}
              className="text-[10px] h-6 px-2 text-red-600 hover:bg-red-50 border-red-200"
            >
              Reverse Session
            </Button>
          )}
        </div>
      ) : appliedType === 'loyalty_reward' ? (
        <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex justify-between items-center">
          <div>
            <span className="font-bold block">✓ Free Loyalty Reward Redeemed</span>
            <span className="text-[10px] text-emerald-700">10 visit stamps consumed</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {eligiblePackage && (
            <div className="flex justify-between items-center p-2 rounded bg-white border border-border-light">
              <div>
                <span className="font-bold text-ink block">{eligiblePackage.packageName?.en || 'Package'}</span>
                <span className="text-[10px] text-muted">
                  {eligiblePackage.sessionsRemaining} sessions left · Price becomes ₹0
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleApplyPackageSession}
                disabled={isConsuming}
                className="text-[10px] h-7 px-2.5 bg-primary text-white"
              >
                Apply 1 Session
              </Button>
            </div>
          )}

          {activeMembership && (
            <div className="p-2 rounded bg-amber-50/70 border border-amber-200 flex justify-between items-center text-amber-950">
              <div>
                <span className="font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  VIP Member ({activeMembership.planName?.en})
                </span>
                <span className="text-[10px] text-amber-800">
                  Perk automatically applies based on precedence
                </span>
              </div>
            </div>
          )}

          {isLoyaltyReady && (
            <div className="flex justify-between items-center p-2 rounded bg-emerald-50 border border-emerald-200">
              <div>
                <span className="font-bold text-emerald-900 block">10 Loyalty Stamps Ready</span>
                <span className="text-[10px] text-emerald-700">Eligible for 1 free haircut reward</span>
              </div>
              <Button
                size="sm"
                onClick={handleRedeemLoyalty}
                disabled={isRedeeming}
                className="text-[10px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Redeem Reward
              </Button>
            </div>
          )}

          {!eligiblePackage && !activeMembership && !isLoyaltyReady && (
            <div className="text-[11px] text-muted text-center py-1">
              No active package sessions or loyalty rewards available for this customer.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
