import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Users,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Scissors,
  User,
  Phone,
} from 'lucide-react';
import {
  useGetPublicQueueStatusQuery,
  useJoinPublicQueueMutation,
} from '@/features/queue/queueApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { Button, Input, Container } from '@/components/ui';
import PageShell from '@/components/layout/PageShell';
import Seo from '@/components/common/Seo';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function PublicQueuePage() {
  const dispatch = useAppDispatch();
  const nameInputId = useId();
  const phoneInputId = useId();
  const serviceInputId = useId();
  const barberInputId = useId();
  const notesInputId = useId();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [joinedToken, setJoinedToken] = useState(null);

  const { data: queueStatus } = useGetPublicQueueStatusQuery(
    undefined,
    { pollingInterval: 15000 }
  );

  const { data: services = [] } = useGetServicesQuery();
  const { data: barbers = [] } = useGetBarbersQuery();

  const [joinQueue, { isLoading: isJoining }] = useJoinPublicQueueMutation();

  const activeBarbers = barbers.filter((b) => b.isActive);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter your name' }));
      return;
    }
    const chosenServiceId = serviceId || services[0]?.id || services[0]?._id;
    if (!chosenServiceId) {
      dispatch(addToast({ type: 'error', message: 'Please select a service' }));
      return;
    }

    try {
      const res = await joinQueue({
        customerName: name.trim(),
        phone: phone.trim(),
        serviceId: chosenServiceId,
        barberId: barberId || '',
        notes: notes.trim(),
        hp_field: honeypot,
      }).unwrap();

      const chosenService = services.find((s) => (s.id || s._id) === chosenServiceId);
      const chosenBarber = barbers.find((b) => (b.id || b._id) === barberId);

      const tokenData = {
        ...res,
        serviceName: chosenService?.name || 'Standard Cut',
        serviceDuration: chosenService?.durationMinutes || 30,
        barberName: chosenBarber?.name || 'Any Available Barber',
      };

      setJoinedToken(tokenData);
      dispatch(addToast({ type: 'success', message: `Token #${res.tokenNumber} issued successfully!` }));
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.error?.message || err?.data?.message || 'Could not join queue',
        })
      );
    }
  };

  const handleReset = () => {
    setJoinedToken(null);
    setName('');
    setPhone('');
    setNotes('');
  };

  return (
    <PageShell>
      <Seo
        title="Live Walk-in Queue | Sovereign Barbershop"
        description="Join our live salon walk-in queue online and avoid waiting in the lounge."
      />

      <div className="pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-20 md:pb-16 bg-cream/30 min-h-[70vh]">
        <Container size="sm">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-muted hover:text-ink transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {joinedToken ? (
            /* Successful Queue Joined Card */
            <div className="bg-white rounded-card border border-border p-6 sm:p-8 text-center space-y-5 shadow-sm animate-in fade-in zoom-in-95 duration-fast">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-muted">
                  Your Queue Token Number
                </span>
                <div className="font-display text-5xl sm:text-6xl text-accent font-semibold mt-1">
                  #{joinedToken.tokenNumber}
                </div>
              </div>

              <div className="bg-sand/30 p-4 rounded-base border border-border/80 space-y-2 max-w-sm mx-auto text-left">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/50">
                  <span className="text-muted flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" />
                    Customer
                  </span>
                  <span className="font-bold text-ink">{joinedToken.customerName}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/50">
                  <span className="text-muted flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-accent" />
                    Service
                  </span>
                  <span className="font-semibold text-ink">
                    {joinedToken.serviceName || 'Haircut'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/50">
                  <span className="text-muted flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    Estimated Wait
                  </span>
                  <span className="text-accent font-bold font-mono text-sm">
                    ~{joinedToken.estimatedWaitMinutes || queueStatus?.estimatedWaitMinutes || 15} mins
                  </span>
                </div>

                {joinedToken.phone && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Phone / WhatsApp
                    </span>
                    <span className="font-mono text-ink font-medium">{joinedToken.phone}</span>
                  </div>
                )}
              </div>

              <div className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-lg p-3 text-xs text-left max-w-sm mx-auto">
                <p className="font-semibold mb-0.5">✓ Reserved in Live Salon Queue</p>
                <p className="text-[11px] text-emerald-800">
                  Please arrive at the shop at least 5 minutes before your estimated time. Show token #{joinedToken.tokenNumber} at the reception.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <Link
                  to="/"
                  className="w-full sm:flex-1 py-2.5 rounded-pill bg-ink text-white hover:bg-ink/90 text-xs uppercase font-bold tracking-wider text-center"
                >
                  Return to Home
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:flex-1 py-2.5 rounded-pill border border-border text-ink hover:bg-sand/40 text-xs uppercase font-bold tracking-wider"
                >
                  Join Another
                </button>
              </div>
            </div>
          ) : (
            /* Join Queue Form Card */
            <div className="bg-white rounded-card border border-border shadow-sm overflow-hidden">
              {/* Header Banner */}
              <div className="bg-ink text-white p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      queueStatus?.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-danger'
                    }`}
                  />
                  <span className="text-xs uppercase font-bold tracking-widest text-white/80">
                    {queueStatus?.isOpen ? 'Live Walk-in Queue' : 'Queue Closed'}
                  </span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide">
                  Join The Live Queue
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-white/80">
                  <span className="flex items-center gap-1 font-semibold text-accent">
                    <Clock className="w-4 h-4" />
                    Est. Wait: ~{queueStatus?.estimatedWaitMinutes || 15} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {queueStatus?.peopleWaiting || 0} in queue
                  </span>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                {/* Honeypot field (hidden from genuine users) */}
                <input
                  type="text"
                  name="hp_field"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label htmlFor={nameInputId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Your Name *
                  </label>
                  <Input
                    id={nameInputId}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={phoneInputId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Mobile Phone (For WhatsApp updates)
                  </label>
                  <Input
                    id={phoneInputId}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    We will send a notification on WhatsApp when 1 person is ahead of you.
                  </p>
                </div>

                <div>
                  <label htmlFor={serviceInputId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Choose Service *
                  </label>
                  <select
                    id={serviceInputId}
                    value={serviceId || (services[0]?.id || services[0]?._id || '')}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-base text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {services.map((s) => (
                      <option key={s.id || s._id} value={s.id || s._id}>
                        {s.name} ({s.durationMinutes}m • ₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={barberInputId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Preferred Barber (Optional)
                  </label>
                  <select
                    id={barberInputId}
                    value={barberId}
                    onChange={(e) => setBarberId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-base text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Any Available Barber (Fastest)</option>
                    {activeBarbers.map((b) => (
                      <option key={b.id || b._id} value={b.id || b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={notesInputId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Notes or Requests
                  </label>
                  <textarea
                    id={notesInputId}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Fade style, trim only, etc."
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-base text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isJoining || queueStatus?.isOpen === false}
                    className="w-full py-3 bg-accent text-white hover:bg-accent-hover uppercase font-bold tracking-wider"
                  >
                    {isJoining ? 'Securing your token...' : 'Join Queue & Get Token'}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[11px] text-muted flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    We respect your privacy. No spam, updates only.
                  </p>
                </div>
              </form>
            </div>
          )}
        </Container>
      </div>
    </PageShell>
  );
}
