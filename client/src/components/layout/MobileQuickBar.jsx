import { Phone, Calendar, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/site';

/**
 * Mobile-Only Floating Bottom Action Dock
 * Provides instant 1-tap booking, WhatsApp concierge, and direct dial
 */
export function MobileQuickBar() {
  const shopPhone = siteConfig.phone || '+91 98765 43210';
  const cleanPhone = shopPhone.replace(/\D/g, '');

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden p-3 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-full bg-ink/90 border border-white/20 backdrop-blur-xl shadow-2xl pointer-events-auto max-w-md mx-auto">
        {/* Direct Call */}
        <a
          href={`tel:${cleanPhone}`}
          aria-label="Call salon"
          className="flex-1 flex flex-col items-center justify-center py-2 px-2 text-white/80 hover:text-white transition-colors"
        >
          <Phone className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-mono uppercase tracking-wider mt-0.5">Call</span>
        </a>

        {/* WhatsApp Consultation */}
        <a
          href={`https://wa.me/${cleanPhone}?text=Hello%20Modern%20Mane%2C%20I%20would%20like%20to%20inquire%20about%20services.`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp consultation"
          className="flex-1 flex flex-col items-center justify-center py-2 px-2 text-white/80 hover:text-white transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider mt-0.5">WhatsApp</span>
        </a>

        {/* Live Queue */}
        <Link
          to="/queue"
          aria-label="Check live walk-in queue"
          className="flex-1 flex flex-col items-center justify-center py-2 px-2 text-white/80 hover:text-white transition-colors"
        >
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-mono uppercase tracking-wider mt-0.5">Queue</span>
        </Link>

        {/* Primary Booking Button */}
        <Link
          to="/book"
          className="flex-1.5 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-accent text-ink font-semibold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-transform luxury-shimmer-btn"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Now</span>
        </Link>
      </div>
    </div>
  );
}

export default MobileQuickBar;

