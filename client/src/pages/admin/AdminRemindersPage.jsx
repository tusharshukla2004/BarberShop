import { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Send,
  User,
  Scissors,
  Phone,
  MessageSquare,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QueryState from '@/components/common/QueryState';
import {
  useGetRemindersQuery,
  useRecordNotificationMutation,
} from '@/features/booking/bookingApi';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { buildWhatsAppLink, renderTemplate } from '@/lib/whatsapp';
import { CompactCustomerCard } from '@/features/customers/CompactCustomerCard';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminRemindersPage() {
  const dispatch = useAppDispatch();
  const [day, setDay] = useState('today');
  const [hours, setHours] = useState(3);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Polling every 60 seconds
  const {
    data: remindersData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetRemindersQuery(
    { hours, day },
    {
      pollingInterval: 60000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const { data: settings = {} } = useGetSettingsQuery();
  const { data: barbers = [] } = useGetBarbersQuery();
  const { data: services = [] } = useGetServicesQuery();
  const [recordNotification, { isLoading: isRecording }] = useRecordNotificationMutation();

  // Dialog states for One-Tap Remind
  const [targetBooking, setTargetBooking] = useState(null);
  const [showConsentWarning, setShowConsentWarning] = useState(false);
  const [showMarkSentPrompt, setShowMarkSentPrompt] = useState(false);

  useEffect(() => {
    if (!isFetching) {
      setLastUpdated(new Date());
    }
  }, [isFetching, remindersData]);

  const rawBookings = useMemo(() => remindersData?.bookings || [], [remindersData]);

  // Barber and service maps
  const barberMap = useMemo(() => {
    return (barbers || []).reduce((acc, b) => {
      acc[b._id || b.id] = b.name;
      return acc;
    }, {});
  }, [barbers]);

  const serviceMap = useMemo(() => {
    return (services || []).reduce((acc, s) => {
      acc[s._id || s.id] = s.name;
      return acc;
    }, {});
  }, [services]);

  // Sort bookings: Unsent first, Sent at bottom. Within each group, sort by time ascending
  const sortedBookings = useMemo(() => {
    const list = [...rawBookings];

    const isSent = (b) => {
      if (b.reminderSentAt) return true;
      if (Array.isArray(b.notifications)) {
        return b.notifications.some((n) => n.type === 'reminder');
      }
      return false;
    };

    return list.sort((a, b) => {
      const aSent = isSent(a);
      const bSent = isSent(b);

      if (!aSent && bSent) return -1;
      if (aSent && !bSent) return 1;

      // Both sent or both unsent: order by date then time
      const aTime = `${a.date || ''} ${a.time || ''}`;
      const bTime = `${b.date || ''} ${b.time || ''}`;
      return aTime.localeCompare(bTime);
    });
  }, [rawBookings]);

  // Stats
  const stats = useMemo(() => {
    let sentCount = 0;
    let pendingCount = 0;

    rawBookings.forEach((b) => {
      const sent =
        b.reminderSentAt ||
        (Array.isArray(b.notifications) && b.notifications.some((n) => n.type === 'reminder'));
      if (sent) sentCount += 1;
      else pendingCount += 1;
    });

    return {
      total: rawBookings.length,
      sentCount,
      pendingCount,
    };
  }, [rawBookings]);

  // Helper to resolve barber / service names
  const getBarberName = (b) => {
    if (b.barberName) return b.barberName;
    if (b.barberId && typeof b.barberId === 'object') return b.barberId.name || 'Barber';
    if (b.barberId && barberMap[b.barberId]) return barberMap[b.barberId];
    return 'Any Available Barber';
  };

  const getServiceName = (b) => {
    if (b.serviceName) return b.serviceName;
    if (b.serviceId && typeof b.serviceId === 'object') return b.serviceId.name || 'Service';
    if (b.serviceId && serviceMap[b.serviceId]) return serviceMap[b.serviceId];
    return 'Haircut / Service';
  };

  // Helper to format sent status
  const getReminderStatusInfo = (booking) => {
    const reminderLog = Array.isArray(booking.notifications)
      ? [...booking.notifications].reverse().find((n) => n.type === 'reminder')
      : null;

    const sentTimestamp = booking.reminderSentAt || reminderLog?.sentAt;

    if (sentTimestamp) {
      const d = new Date(sentTimestamp);
      const timeStr = !isNaN(d.getTime())
        ? d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata',
          })
        : 'Recently';

      const sentBy = reminderLog?.by?.name || reminderLog?.by || 'Staff';

      return {
        isSent: true,
        text: `Sent at ${timeStr} by ${sentBy}`,
        timeStr,
      };
    }

    return {
      isSent: false,
      text: 'Not sent',
    };
  };

  // Execute reminder deep link opening
  const triggerReminder = (booking) => {
    setTargetBooking(booking);

    if (booking.whatsappConsent === false) {
      setShowConsentWarning(true);
      return;
    }

    executeOpenWhatsApp(booking);
  };

  const executeOpenWhatsApp = (booking) => {
    const rawTemplate =
      settings?.messageTemplates?.reminder ||
      'Hello {name}! This is a friendly reminder that your grooming session at {shopName} is scheduled.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n\nPlease arrive 5 minutes early. Let us know if you need any adjustments!';

    const templateData = {
      name: booking.customerName || 'Customer',
      date: booking.date,
      time: booking.time,
      service: getServiceName(booking),
      barber: getBarberName(booking),
      shopName: settings?.shopName || 'Modern Mane',
      address: settings?.address || 'Shop #12, Bandra West, Mumbai',
      mapsLink: settings?.mapsLink || 'https://maps.google.com',
      bookingRef: booking.bookingRef || `BK-${(booking._id || '').slice(-6).toUpperCase()}`,
      reviewLink: settings?.googleReviewLink || 'https://g.page/r/modern-mane/review',
      cancelPolicy: settings?.policies?.termsNotice || '2 hours notice required for cancellation',
    };

    const rendered = renderTemplate(rawTemplate, templateData);
    const link = buildWhatsAppLink(booking.customerPhone, rendered);

    if (!link) {
      dispatch(
        addToast({
          type: 'error',
          message: `Invalid customer phone number: ${booking.customerPhone}`,
        })
      );
      return;
    }

    // Open WhatsApp in new tab
    window.open(link, '_blank', 'noopener,noreferrer');

    // Prompt staff to mark as sent
    setShowMarkSentPrompt(true);
  };

  const handleConfirmSent = async () => {
    if (!targetBooking) return;

    try {
      await recordNotification({
        id: targetBooking._id || targetBooking.id,
        type: 'reminder',
        channel: 'whatsapp_link',
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: `Reminder recorded for ${targetBooking.customerName}`,
        })
      );
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.message || 'Failed to record reminder log',
        })
      );
    } finally {
      setShowMarkSentPrompt(false);
      setTargetBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-medium font-heading text-ink/85 tracking-tight">
              Appointment Reminders
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Send 1-tap WhatsApp reminders to upcoming confirmed clients. Auto-refreshes every 60s.
          </p>
        </div>

        {/* Live status & Manual Refresh */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="block text-[11px] text-ink/50 font-mono">
              Last updated: {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Polling (60s)
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs h-9 px-3"
            title="Refresh now"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Hours Selector Card */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Day Tabs */}
          <div className="inline-flex items-center bg-card/60 p-1 rounded-xl border border-border-light gap-1">
            <button
              type="button"
              onClick={() => setDay('today')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
                day === 'today'
                  ? 'bg-white text-ink shadow-xs border border-border-light/80'
                  : 'text-muted hover:text-ink hover:bg-white/40'
              }`}
            >
              Today&apos;s Reminders
            </button>
            <button
              type="button"
              onClick={() => setDay('tomorrow')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
                day === 'tomorrow'
                  ? 'bg-white text-ink shadow-xs border border-border-light/80'
                  : 'text-muted hover:text-ink hover:bg-white/40'
              }`}
            >
              Tomorrow
            </button>
          </div>

          {/* Time Window Dropdown & Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            {day === 'today' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium">Next:</span>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded bg-white border border-border-light text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours (Default)</option>
                  <option value={6}>6 Hours</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>All Day (24 hrs)</option>
                </select>
              </div>
            )}

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="px-2.5 py-1 rounded bg-card/60 border border-border-light text-muted">
                Total: <span className="font-medium text-ink/85">{stats.total}</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600">
                Pending: <span>{stats.pendingCount}</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                Sent: <span>{stats.sentCount}</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main List */}
      <QueryState isLoading={isLoading} isError={isError} error={error}>
        {sortedBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-ink/80">
              All caught up! No reminders due
            </h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              There are no confirmed bookings in this window ({day === 'today' ? `next ${hours} hours` : 'tomorrow'}).
            </p>
            {day === 'today' && hours < 24 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHours(24)}
                className="mt-4 text-xs"
              >
                View all of today ({`expand to 24 hrs`})
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-medium text-muted uppercase tracking-wider">
              <div className="col-span-2">Time & Slot</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-3">Service & Barber</div>
              <div className="col-span-2">Reminder Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {sortedBookings.map((booking) => {
              const statusInfo = getReminderStatusInfo(booking);
              const barberName = getBarberName(booking);
              const serviceName = getServiceName(booking);

              return (
                <div
                  key={booking._id || booking.id}
                  className={`p-4 rounded-xl border transition-all ${
                    statusInfo.isSent
                      ? 'bg-card/60 border-border-light opacity-80 hover:opacity-100'
                      : 'bg-card border-border-light shadow-sm hover:border-emerald-500/40'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
                    {/* Time & Slot */}
                    <div className="lg:col-span-2 flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          statusInfo.isSent
                            ? 'bg-neutral-100 text-neutral-500'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-ink/85 font-mono">{booking.time}</div>
                        <div className="text-[11px] text-muted">{booking.date}</div>
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-xs sm:text-sm text-ink/85">
                          {booking.customerName}
                        </span>
                        {booking.whatsappConsent ? (
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            title="Opted-in for WhatsApp booking updates"
                          >
                            Opted In
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            title="Did not check WhatsApp consent box"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" /> No Consent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-muted/60" />
                        <span>{booking.customerPhone}</span>
                      </div>

                      <div className="mt-2.5">
                        <CompactCustomerCard
                          phone={booking.customerPhone}
                          customerId={booking.customerId}
                        />
                      </div>
                    </div>

                    {/* Service & Barber */}
                    <div className="lg:col-span-3 text-xs space-y-0.5">
                      <div className="font-medium text-ink/80 flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-muted" />
                        <span className="truncate">{serviceName}</span>
                      </div>
                      <div className="text-muted flex items-center gap-1">
                        <User className="w-3 h-3 text-muted/60" />
                        <span className="truncate">{barberName}</span>
                      </div>
                    </div>

                    {/* Reminder Status */}
                    <div className="lg:col-span-2">
                      {statusInfo.isSent ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{statusInfo.text}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Not sent yet</span>
                        </div>
                      )}
                    </div>

                    {/* One-Tap Action */}
                    <div className="lg:col-span-2 flex items-center justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border-light">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => triggerReminder(booking)}
                        className={`text-xs font-semibold h-8 px-3.5 shadow-sm inline-flex items-center gap-1.5 ${
                          statusInfo.isSent
                            ? 'bg-neutral-100 hover:bg-neutral-200 text-ink/80 border border-border-light'
                            : 'bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-emerald-500/20'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{statusInfo.isSent ? 'Resend' : 'Remind'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </QueryState>

      {/* Consent Warning Dialog */}
      {showConsentWarning && targetBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-card rounded-xl shadow-2xl max-w-sm w-full p-5 text-left border border-amber-400">
            <div className="flex items-center gap-2.5 text-amber-600 mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-ink">Customer Did Not Opt-In</h3>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed mb-4">
              <strong>{targetBooking.customerName}</strong> has not opted in for WhatsApp updates.
              Sending unsolicited messages may violate customer communication preferences.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowConsentWarning(false);
                  setTargetBooking(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  setShowConsentWarning(false);
                  executeOpenWhatsApp(targetBooking);
                }}
              >
                Proceed to WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mark As Sent Prompt Dialog */}
      {showMarkSentPrompt && targetBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-card rounded-xl shadow-2xl max-w-sm w-full p-5 text-left border border-emerald-400">
            <div className="flex items-center gap-2.5 text-emerald-600 mb-2">
              <Send className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-ink">Mark Reminder as Sent?</h3>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed mb-4">
              WhatsApp chat link was opened for <strong>{targetBooking.customerName}</strong>. Would
              you like to record this reminder in the booking log?
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowMarkSentPrompt(false);
                  setTargetBooking(null);
                }}
              >
                Skip
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isRecording}
                onClick={handleConfirmSent}
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold shadow-sm"
              >
                {isRecording ? 'Recording...' : 'Yes, Mark as Sent'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
