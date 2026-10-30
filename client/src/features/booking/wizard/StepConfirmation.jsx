import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CheckCircle2, Calendar, MessageSquare, ArrowRight, MapPin, Clock, Scissors, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { downloadCalendarEvent } from '@/lib/calendar';

export default function StepConfirmation({ booking, onReset }) {
  const refCode = (
    booking?.id ? `BK-${booking.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}` : 'BK-RES892'
  );

  const handleDownloadCalendar = () => {
    downloadCalendarEvent({
      title: 'Sovereign Barbershop Appointment',
      description: `Grooming reservation for ${booking.customerName || 'Client'}. Reference: ${refCode}`,
      location: `${siteConfig.location.address}, ${siteConfig.location.city}`,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime || booking.startTime,
      referenceNumber: refCode,
    });
  };

  const whatsappShareText = encodeURIComponent(
    `Hey, I just booked my grooming appointment at Sovereign Barbershop on ${booking.date} at ${booking.startTime}! Ref: ${refCode}`
  );
  const whatsappShareUrl = `https://wa.me/?text=${whatsappShareText}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      {/* Success Badge & Reference */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-2 shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
          Reservation Confirmed
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-ink tracking-wide uppercase">
          WE LOOK FORWARD TO WELCOMING YOU
        </h2>
        <p className="text-muted text-sm mt-2">
          Your chair has been reserved. A confirmation message has been recorded with our concierge.
        </p>
      </div>

      {/* Confirmation Details Card */}
      <Card tone="light" className="p-6 sm:p-8 border border-border-light text-left space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-border-light pb-4">
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">
              Booking Reference
            </span>
            <p className="font-mono text-lg font-bold text-ink">#{refCode}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Confirmed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-ink">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-muted uppercase font-semibold">Date</p>
              <p className="font-semibold">{booking.date}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-muted uppercase font-semibold">Time Slot</p>
              <p className="font-semibold">{booking.startTime} {booking.endTime ? `– ${booking.endTime}` : ''}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-muted uppercase font-semibold">Guest Name</p>
              <p className="font-semibold">{booking.customerName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Scissors className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-muted uppercase font-semibold">Contact Phone</p>
              <p className="font-semibold">{booking.phone}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border-light flex items-start gap-2.5 text-xs text-muted">
          <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>
            {siteConfig.location.address}, {siteConfig.location.city}. Complimentary valet parking is available.
          </span>
        </div>
      </Card>

      {/* Action Buttons: Add to Calendar & WhatsApp Share */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleDownloadCalendar}
          className="w-full sm:w-auto tracking-wider uppercase font-semibold text-xs py-3"
        >
          <Calendar className="w-4 h-4 mr-2 text-accent" />
          Add to Calendar (.ics)
        </Button>

        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Share on WhatsApp
        </a>
      </div>

      {/* Next Actions */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={onReset}
          className="text-ink hover:text-accent transition-colors underline"
        >
          Book Another Appointment
        </button>

        <span className="hidden sm:inline text-muted" aria-hidden="true">•</span>

        <Link to="/" className="text-muted hover:text-ink transition-colors flex items-center gap-1">
          Return to Home <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

StepConfirmation.propTypes = {
  booking: PropTypes.object.isRequired,
  onReset: PropTypes.func.isRequired,
};
