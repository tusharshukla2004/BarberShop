import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  MessageSquare,
  MapPin,
  Clock,
  Scissors,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { downloadCalendarEvent } from '@/lib/calendar';
import { formatPrice } from '@/lib/formatters';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';
import { buildWhatsAppLink, renderTemplate } from '@/lib/whatsapp';

export default function StepConfirmation({ booking, onReset }) {
  const { data: services = [] } = useGetServicesQuery();
  const { data: barbers = [] } = useGetBarbersQuery();
  const { data: settings = {} } = useGetSettingsQuery();

  const refCode = booking?.id
    ? `BK-${booking.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`
    : 'BK-RES892';

  // Resolve service & barber details ONLY if explicitly chosen by user
  const isSpecificBarber = Boolean(
    booking.barberId &&
      booking.barberId !== 'any' &&
      booking.barberId !== 'unassigned' &&
      booking.barberId !== ''
  );

  const isSpecificService = Boolean(
    booking.serviceId &&
      booking.serviceId !== 'general-request' &&
      booking.serviceId !== ''
  );

  const service = isSpecificService
    ? services.find((s) => s.id === booking.serviceId || s.id === booking.service)
    : null;

  const barber = isSpecificBarber
    ? barbers.find((b) => b.id === booking.barberId || b.id === booking.barber)
    : null;

  const serviceName = service
    ? service.name
    : booking.serviceName && isSpecificService
    ? booking.serviceName
    : '';

  const barberName = barber
    ? barber.name
    : booking.barberName && isSpecificBarber
    ? booking.barberName
    : '';

  const serviceSnippet = serviceName ? ` for ${serviceName}` : '';
  const barberSnippet = barberName ? ` with ${barberName}` : '';

  const handleDownloadCalendar = () => {
    downloadCalendarEvent({
      title: `${siteConfig.name}${serviceSnippet}${barberSnippet}`,
      description: `Grooming reservation for ${booking.customerName || 'Client'}${serviceSnippet}${barberSnippet}. Reference: ${refCode}`,
      location: siteConfig.address,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime || booking.startTime,
      referenceNumber: refCode,
    });
  };

  const whatsappShareText = encodeURIComponent(
    `Hey, I just booked my grooming appointment at ${siteConfig.name}${serviceSnippet}${barberSnippet} on ${booking.date} at ${booking.startTime}! Ref: ${refCode}`
  );
  const whatsappShareUrl = `https://wa.me/?text=${whatsappShareText}`;

  // Shop WhatsApp click-to-chat URL
  const shopNumber = settings.whatsappNumber || siteConfig.whatsapp;
  const defaultConfirmationTpl =
    settings.messageTemplates?.confirmation ||
    'Namaste {name}! Aapka appointment {shopName} me confirm ho gaya hai.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\n📍 Address: {address}\n\nSee you soon!';

  const confirmationMessage = renderTemplate(defaultConfirmationTpl, {
    name: booking.customerName,
    date: booking.date,
    time: booking.startTime,
    service: serviceName,
    barber: barberName,
    shopName: siteConfig.name,
    address: siteConfig.address,
    mapsLink: siteConfig.mapsLink || '',
    bookingRef: refCode,
  });

  const shopWhatsAppUrl = shopNumber ? buildWhatsAppLink(shopNumber, confirmationMessage) : null;

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
          {serviceName && (
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-muted uppercase font-semibold">Service</p>
                <p className="font-semibold text-ink">
                  {serviceName}
                  {service?.price ? ` • ${formatPrice(service.price)}` : ''}
                </p>
              </div>
            </div>
          )}

          {barberName && (
            <div className="flex items-start gap-3">
              <Scissors className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-muted uppercase font-semibold">Barber</p>
                <p className="font-semibold text-ink">{barberName}</p>
              </div>
            </div>
          )}

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
              <p className="font-semibold">
                {booking.startTime} {booking.endTime ? `– ${booking.endTime}` : ''}
              </p>
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
            <Phone className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-muted uppercase font-semibold">Contact Phone</p>
              <p className="font-semibold">{booking.phone}</p>
            </div>
          </div>
        </div>

        {/* Pricing & Discount summary if applied */}
        {booking.priceAtBooking !== undefined && (
          <div className="p-3.5 rounded-lg bg-neutral-50 border border-border-light text-xs space-y-1.5">
            {booking.originalPrice && booking.discountAmount > 0 && (
              <div className="flex justify-between text-muted">
                <span>Original Price:</span>
                <span>{formatPrice(booking.originalPrice)}</span>
              </div>
            )}
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>
                  Promo Discount {booking.promoCode ? `(${booking.promoCode})` : ''}:
                </span>
                <span>-{formatPrice(booking.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-ink text-sm pt-1 border-t border-border-light/60">
              <span>Total Due at Studio:</span>
              <span className="text-accent">{formatPrice(booking.priceAtBooking)}</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border-light flex items-start gap-2.5 text-xs text-muted">
          <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>
            {siteConfig.address}. Complimentary valet parking is available.
          </span>
        </div>
      </Card>

      {/* Action Buttons: Confirm on WhatsApp, Add to Calendar & WhatsApp Share */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {shopWhatsAppUrl && (
          <a
            href={shopWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            Confirm on WhatsApp
          </a>
        )}

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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md border border-border-light bg-card text-ink hover:bg-neutral-100 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
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

        <Link to="/" className="text-muted hover:text-ink transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

StepConfirmation.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.string,
    serviceId: PropTypes.string,
    serviceName: PropTypes.string,
    service: PropTypes.any,
    barberId: PropTypes.string,
    barberName: PropTypes.string,
    barber: PropTypes.any,
    date: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string,
    customerName: PropTypes.string,
    phone: PropTypes.string,
  }).isRequired,
  onReset: PropTypes.func.isRequired,
};
