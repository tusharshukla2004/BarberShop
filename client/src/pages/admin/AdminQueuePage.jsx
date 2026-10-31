import { useState, useId } from 'react';
import {
  Clock,
  UserPlus,
  Play,
  CheckCircle,
  Phone,
  MessageCircle,
  XCircle,
  UserCheck,
  RefreshCw,
  Scissors,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  useGetAdminQueueQuery,
  useAddWalkInMutation,
  useUpdateQueueStatusMutation,
} from '@/features/queue/queueApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';
import { Button, Input } from '@/components/ui';
import { buildWhatsAppLink, renderTemplate } from '@/lib/whatsapp';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminQueuePage() {
  const dispatch = useAppDispatch();
  const nameId = useId();
  const phoneId = useId();
  const serviceId = useId();
  const barberId = useId();
  const notesId = useId();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Form state for add walk-in
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formServiceId, setFormServiceId] = useState('');
  const [formBarberId, setFormBarberId] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Fetch admin queue with 15s polling and refetch on focus
  const {
    data: queueData,
    isFetching,
    refetch,
  } = useGetAdminQueueQuery(
    { date: selectedDate },
    { pollingInterval: 15000, refetchOnFocus: true }
  );

  const { data: services = [] } = useGetServicesQuery();
  const { data: barbers = [] } = useGetBarbersQuery();
  const { data: settings } = useGetSettingsQuery();

  const [addWalkIn, { isLoading: isAdding }] = useAddWalkInMutation();
  const [updateQueueStatus] = useUpdateQueueStatusMutation();

  const activeBarbers = barbers.filter((b) => b.isActive);
  const queueEntries = queueData?.entries || [];
  const waitingEntries = queueEntries.filter((e) => e.status === 'waiting');
  const inServiceEntries = queueEntries.filter((e) => e.status === 'in_service');
  const prospectEst = queueData?.prospectEstimation;

  // Handle status update
  const handleStatusChange = async (id, status, barberIdOverride) => {
    try {
      setActionInProgressId(id);
      const payload = { id, status };
      if (barberIdOverride) payload.barberId = barberIdOverride;

      await updateQueueStatus(payload).unwrap();
      const actionName =
        status === 'done'
          ? 'completed and booking saved'
          : status === 'in_service'
          ? 'moved to chair'
          : status;
      dispatch(addToast({ type: 'success', message: `Customer ${actionName}` }));
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.error?.message || err?.data?.message || 'Failed to update queue',
        })
      );
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Add Walk-in submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      dispatch(addToast({ type: 'error', message: 'Customer name is required' }));
      return;
    }
    const chosenServiceId = formServiceId || services[0]?.id || services[0]?._id;
    if (!chosenServiceId) {
      dispatch(addToast({ type: 'error', message: 'Please select a service' }));
      return;
    }

    try {
      await addWalkIn({
        customerName: formName.trim(),
        phone: formPhone.trim(),
        serviceId: chosenServiceId,
        barberId: formBarberId || '',
        notes: formNotes.trim(),
        source: 'admin',
      }).unwrap();

      dispatch(addToast({ type: 'success', message: 'Walk-in customer added to queue!' }));
      setFormName('');
      setFormPhone('');
      setFormNotes('');
      setIsAddModalOpen(false);
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.error?.message || err?.data?.message || 'Could not add walk-in',
        })
      );
    }
  };

  // WhatsApp click-to-chat for "Your turn is near"
  const handleWhatsAppTurnNear = (entry) => {
    if (!entry.phone) {
      dispatch(addToast({ type: 'error', message: 'No phone number recorded for this customer' }));
      return;
    }

    const tpl =
      settings?.messageTemplates?.queue_turn_near ||
      'Namaste {name}! Aapka turn {shopName} me aane wala hai (Token #{tokenNumber}). Kripya reception/waiting area me rahein. Service: {service}. Barber: {barber}.';

    const srv = services.find((s) => (s.id || s._id) === entry.serviceId);
    const barb = barbers.find((b) => (b.id || b._id) === entry.barberId);

    const message = renderTemplate(tpl, {
      name: entry.customerName,
      shopName: settings?.shopName || 'Sovereign Barbershop',
      tokenNumber: entry.tokenNumber,
      service: srv?.name || 'Grooming Service',
      barber: barb?.name || 'Available Barber',
      address: settings?.address || '',
    });

    const link = buildWhatsAppLink(entry.phone, message);
    if (!link) {
      dispatch(addToast({ type: 'error', message: 'Invalid phone number format' }));
      return;
    }

    window.open(link, '_blank', 'noopener,noreferrer');
    dispatch(addToast({ type: 'success', message: 'Opened WhatsApp message link' }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-card border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide uppercase text-ink">
              Walk-in Queue Board
            </h1>
            {isFetching && (
              <RefreshCw className="w-4 h-4 text-accent animate-spin" title="Syncing queue..." />
            )}
          </div>
          <p className="text-muted text-sm mt-0.5">
            Real-time walk-in scheduling & wait-time engine
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-base text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-accent text-white"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Walk-in</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-card border border-border shadow-xs">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted">
            Waiting in Lounge
          </div>
          <div className="text-2xl sm:text-3xl font-display text-ink mt-1">
            {waitingEntries.length}
          </div>
          <div className="text-xs text-muted mt-0.5">
            Est. wait: ~{prospectEst?.estimatedWaitMinutes || 0} mins
          </div>
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-xs">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted">
            In Service Chairs
          </div>
          <div className="text-2xl sm:text-3xl font-display text-accent mt-1">
            {inServiceEntries.length}
          </div>
          <div className="text-xs text-muted mt-0.5">
            Active cuts in progress
          </div>
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-xs">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted">
            Working Barbers
          </div>
          <div className="text-2xl sm:text-3xl font-display text-ink mt-1">
            {queueData?.workingBarbersCount || activeBarbers.length}
          </div>
          <div className="text-xs text-muted mt-0.5">
            On shift today
          </div>
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-xs">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted">
            Next Available Slot
          </div>
          <div className="text-2xl sm:text-3xl font-display text-success mt-1">
            {prospectEst?.estimatedStartTime || 'Now Free'}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {prospectEst?.canBeServedBeforeClosing ? 'Open for walk-ins' : 'Near closing'}
          </div>
        </div>
      </div>

      {/* Barber Chairs Board (1 Column Per Barber) */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
          <Scissors className="w-4 h-4 text-accent" />
          <span>Barber Stations</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBarbers.map((barber) => {
            const barberIdStr = barber.id || barber._id?.toString();
            const currentServing = inServiceEntries.find(
              (e) => (e.barberId || '').toString() === barberIdStr
            );
            const nextInLine = waitingEntries.find(
              (e) => (e.barberId || '').toString() === barberIdStr || !e.barberId
            );
            const isFree = !currentServing;

            const serviceName = currentServing
              ? services.find((s) => (s.id || s._id) === currentServing.serviceId)?.name
              : null;

            return (
              <div
                key={barberIdStr}
                className={`bg-white rounded-card border transition-all ${
                  isFree
                    ? 'border-emerald-300 ring-2 ring-emerald-50 bg-emerald-50/10'
                    : 'border-border'
                }`}
              >
                {/* Barber Header */}
                <div className="p-4 border-b border-border/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-ink">{barber.name}</h3>
                    <p className="text-xs text-muted">
                      {barber.specialties?.slice(0, 2).join(', ') || 'Master Stylist'}
                    </p>
                  </div>
                  {isFree ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-emerald-100 text-emerald-800 text-xs font-semibold animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      Chair Free
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-accent/15 text-accent text-xs font-semibold">
                      In Service
                    </span>
                  )}
                </div>

                {/* Chair Content */}
                <div className="p-4 space-y-4">
                  {/* Current Active Service */}
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-muted mb-1.5">
                      Current Chair Client
                    </div>
                    {currentServing ? (
                      <div className="bg-sand/30 p-3 rounded-base border border-border/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">
                            #{currentServing.tokenNumber} {currentServing.customerName}
                          </span>
                          <span className="text-xs bg-ink/10 px-2 py-0.5 rounded text-ink font-mono">
                            {serviceName || 'Grooming'}
                          </span>
                        </div>
                        {currentServing.phone && (
                          <div className="text-xs text-muted flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3" />
                            {currentServing.phone}
                          </div>
                        )}
                        <div className="pt-2 flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusChange(currentServing.id || currentServing._id, 'done')}
                            disabled={actionInProgressId === (currentServing.id || currentServing._id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Done & Checkout
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(currentServing.id || currentServing._id, 'left')}
                            disabled={actionInProgressId === (currentServing.id || currentServing._id)}
                            className="text-xs py-2 text-danger hover:bg-danger/10 border-danger/30"
                            title="Cancel / Left"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-base border border-dashed border-emerald-300 text-center bg-white">
                        <p className="text-xs text-emerald-800 font-medium">Ready for next customer</p>
                        {nextInLine && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleStatusChange(
                                nextInLine.id || nextInLine._id,
                                'in_service',
                                barberIdStr
                              )
                            }
                            className="mt-2 text-xs w-full bg-accent text-white hover:bg-accent-hover"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start #{nextInLine.tokenNumber} {nextInLine.customerName}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Next Up Preview */}
                  {nextInLine && currentServing && (
                    <div className="border-t border-border pt-3">
                      <div className="text-xs uppercase tracking-wider font-semibold text-muted mb-1">
                        Next Up In Line
                      </div>
                      <div className="flex items-center justify-between text-xs bg-card/60 p-2 rounded">
                        <span className="font-medium text-ink truncate">
                          #{nextInLine.tokenNumber} {nextInLine.customerName}
                        </span>
                        <span className="text-muted font-mono">
                          ~{nextInLine.estimatedWaitMinutes || 0}m wait
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting List Section */}
      <div className="bg-white rounded-card border border-border shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>Waiting Lounge List ({waitingEntries.length})</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Live ordered queue with touch-friendly controls
            </p>
          </div>
          <span className="text-xs bg-card px-2.5 py-1 rounded font-mono text-muted">
            Auto-refreshes every 15s
          </span>
        </div>

        {waitingEntries.length === 0 ? (
          <div className="p-10 text-center text-muted space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
            <p className="font-medium text-ink">No customers currently waiting</p>
            <p className="text-xs">Add a walk-in or customers can join online.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {waitingEntries.map((entry) => {
              const srv = services.find((s) => (s.id || s._id) === entry.serviceId);
              const barb = barbers.find((b) => (b.id || b._id) === entry.barberId);
              const isProcessing = actionInProgressId === (entry.id || entry._id);

              return (
                <div
                  key={entry.id || entry._id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-card/30 transition-colors"
                >
                  {/* Left: Token & Details */}
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-ink text-white font-display text-lg sm:text-xl flex items-center justify-center shrink-0 shadow-xs">
                      #{entry.tokenNumber}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-ink">
                          {entry.customerName}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-sand/60 text-ink">
                          {srv?.name || 'Standard Cut'} ({srv?.durationMinutes || 30}m)
                        </span>
                        {entry.source === 'public' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            Online
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        {entry.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3" />
                            {entry.phone}
                          </span>
                        )}
                        <span>
                          Barber: <strong className="text-ink">{barb?.name || 'Any Barber'}</strong>
                        </span>
                        <span>
                          Est. Wait: <strong className="text-accent font-mono">~{entry.estimatedWaitMinutes || 0}m</strong> ({entry.estimatedStart || 'Soon'})
                        </span>
                      </div>

                      {entry.notes && (
                        <p className="text-xs text-muted/90 italic">
                          Note: &ldquo;{entry.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Touch-friendly Quick Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                    {/* WhatsApp Turn Near Nudge */}
                    {entry.phone && (
                      <button
                        type="button"
                        onClick={() => handleWhatsAppTurnNear(entry)}
                        className="px-3 py-2 rounded-base bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Send WhatsApp: Your turn is near"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>Nudge WhatsApp</span>
                      </button>
                    )}

                    {/* Call Customer */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(entry.id || entry._id, 'called')}
                      className="px-3 py-2 rounded-base bg-sand text-ink hover:bg-sand/80 border border-border text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-ink" />
                      <span>Call</span>
                    </button>

                    {/* Start Service */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(entry.id || entry._id, 'in_service')}
                      className="px-3.5 py-2 rounded-base bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Cut</span>
                    </button>

                    {/* Mark Done directly if fast-tracked */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(entry.id || entry._id, 'done')}
                      className="p-2 rounded-base bg-white hover:bg-card border border-border text-muted hover:text-emerald-700 text-xs transition-colors"
                      title="Mark Done"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    {/* Customer Left */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(entry.id || entry._id, 'left')}
                      className="p-2 rounded-base bg-white hover:bg-card border border-border text-muted hover:text-danger text-xs transition-colors"
                      title="Customer Left"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Walk-In Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-card shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-fast">
            <div className="p-5 border-b border-border flex items-center justify-between bg-card/40">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" />
                <h3 className="font-display text-xl uppercase tracking-wide text-ink">
                  Add Walk-in Customer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted hover:text-ink p-1 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label htmlFor={nameId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Customer Name *
                </label>
                <Input
                  id={nameId}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div>
                <label htmlFor={phoneId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Phone (Optional for WhatsApp updates)
                </label>
                <Input
                  id={phoneId}
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={serviceId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                    Service *
                  </label>
                  <select
                    id={serviceId}
                    value={formServiceId}
                    onChange={(e) => setFormServiceId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-base text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {services.map((s) => (
                      <option key={s.id || s._id} value={s.id || s._id}>
                        {s.name} ({s.durationMinutes}m - ₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={barberId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                    Preferred Barber
                  </label>
                  <select
                    id={barberId}
                    value={formBarberId}
                    onChange={(e) => setFormBarberId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-base text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Any Available Barber</option>
                    {activeBarbers.map((b) => (
                      <option key={b.id || b._id} value={b.id || b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={notesId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Notes
                </label>
                <textarea
                  id={notesId}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Special requests, trim style, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-base text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>

              {/* Wait Estimation Preview Box */}
              <div className="bg-sand/30 border border-border p-3.5 rounded-base flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-ink">Estimated Live Wait:</div>
                  <div className="text-muted">
                    Start time: ~{prospectEst?.estimatedStartTime || 'Available now'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl text-accent">
                    ~{prospectEst?.estimatedWaitMinutes || 0} mins
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isAdding}
                  className="bg-accent text-white"
                >
                  {isAdding ? 'Adding...' : 'Confirm & Add Walk-in'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
