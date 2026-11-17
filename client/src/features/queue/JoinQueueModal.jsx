import { useState, useId } from 'react';
import PropTypes from 'prop-types';
import {
  Clock,
  Users,
  CheckCircle,
  ShieldCheck,
  Scissors,
  User,
  Phone,
} from 'lucide-react';
import { useJoinPublicQueueMutation } from './queueApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import Modal from '@/components/ui/Modal';
import { Button, Input } from '@/components/ui';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export function JoinQueueModal({ isOpen, onClose, queueStatus }) {
  const dispatch = useAppDispatch();
  const nameInputId = useId();
  const phoneInputId = useId();
  const serviceInputId = useId();
  const barberInputId = useId();
  const notesInputId = useId();

  const [tokenTicket, setTokenTicket] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const { data: services = [] } = useGetServicesQuery();
  const { data: barbers = [] } = useGetBarbersQuery();
  const [joinQueue, { isLoading: isJoining }] = useJoinPublicQueueMutation();

  const activeBarbers = barbers.filter((b) => b.isActive);

  const handleClose = () => {
    setTokenTicket(null);
    setName('');
    setPhone('');
    setNotes('');
    onClose();
  };

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

      const ticket = {
        ...res,
        serviceName: chosenService?.name || 'Standard Cut',
        serviceDuration: chosenService?.durationMinutes || 30,
        barberName: chosenBarber?.name || 'Any Available Barber',
      };

      setTokenTicket(ticket);
      dispatch(
        addToast({
          type: 'success',
          message: `Walk-in confirmed! Your Token is #${res.tokenNumber}`,
        })
      );
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.error?.message || err?.data?.message || 'Could not join queue. Please try again.',
        })
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={tokenTicket ? 'Walk-in Token Confirmed' : 'Join Live Walk-in Queue'}
    >
      {tokenTicket ? (
        /* Confirmed Live Queue Token Ticket */
        <div className="space-y-5 text-center py-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-muted">
              Your Queue Token Number
            </span>
            <div className="font-display text-5xl text-accent font-semibold tracking-tight mt-1">
              #{tokenTicket.tokenNumber}
            </div>
          </div>

          {/* Details Box */}
          <div className="bg-sand/40 border border-border/80 rounded-xl p-4 text-left space-y-2.5 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
              <span className="text-muted flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" />
                Customer
              </span>
              <span className="font-semibold text-ink">{tokenTicket.customerName}</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
              <span className="text-muted flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-accent" />
                Service
              </span>
              <span className="font-semibold text-ink">
                {tokenTicket.serviceName} ({tokenTicket.serviceDuration || 30}m)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
              <span className="text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                Estimated Wait
              </span>
              <span className="font-bold text-accent font-mono text-sm">
                ~{tokenTicket.estimatedWaitMinutes || queueStatus?.estimatedWaitMinutes || 15} mins
              </span>
            </div>

            {tokenTicket.phone && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  SMS / WhatsApp
                </span>
                <span className="font-mono text-ink font-medium">{tokenTicket.phone}</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-lg p-3 text-xs text-left max-w-sm mx-auto space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <span>✓ Added to shop queue</span>
            </p>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Please arrive at the salon 5 minutes before your estimated time. Show token{' '}
              <strong>#{tokenTicket.tokenNumber}</strong> at the reception desk.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2 max-w-sm mx-auto">
            <Button
              type="button"
              variant="primary"
              onClick={handleClose}
              className="w-full bg-ink text-white hover:bg-ink/90 text-xs uppercase font-bold tracking-wider py-2.5"
            >
              Done & Return to Site
            </Button>
          </div>
        </div>
      ) : (
        /* Join Walk-in Queue Form */
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Honeypot */}
          <input
            type="text"
            name="hp_field"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Live wait status strip */}
          <div className="p-3 rounded-lg bg-sand/50 border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-ink">
                Current Wait: ~{queueStatus?.estimatedWaitMinutes || 15} mins
              </span>
            </div>
            <span className="text-muted flex items-center gap-1 font-mono">
              <Users className="w-3.5 h-3.5 text-accent" />
              {queueStatus?.peopleWaiting || 0} waiting
            </span>
          </div>

          {/* Customer Name */}
          <div>
            <label
              htmlFor={nameInputId}
              className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1"
            >
              Your Name *
            </label>
            <Input
              id={nameInputId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor={phoneInputId}
              className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1"
            >
              Phone Number (For WhatsApp / Turn Alert)
            </label>
            <Input
              id={phoneInputId}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
            />
            <p className="text-[11px] text-muted mt-1">
              We send a WhatsApp alert when 1 person is ahead of you.
            </p>
          </div>

          {/* Service Selector */}
          <div>
            <label
              htmlFor={serviceInputId}
              className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1"
            >
              Service *
            </label>
            <select
              id={serviceInputId}
              value={serviceId}
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

          {/* Preferred Barber */}
          <div>
            <label
              htmlFor={barberInputId}
              className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1"
            >
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

          {/* Notes */}
          <div>
            <label
              htmlFor={notesInputId}
              className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1"
            >
              Special Instructions (Optional)
            </label>
            <textarea
              id={notesInputId}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Skin fade, beard styling, trim only, etc."
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-base text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isJoining}
              className="w-full py-3 bg-accent text-white hover:bg-accent-hover uppercase font-bold tracking-wider text-xs shadow-sm"
            >
              {isJoining ? 'Securing your token...' : 'Confirm & Get Walk-in Token'}
            </Button>
          </div>

          <div className="text-center pt-1">
            <p className="text-[11px] text-muted flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              Walk-in reservations are free. Pay in chair after your cut.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
}

JoinQueueModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  queueStatus: PropTypes.object,
};

export default JoinQueueModal;
