import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  Clock,
  Calendar,
  XCircle,
  Star,
  ChevronDown,
} from 'lucide-react';
import { buildWhatsAppLink, renderTemplate } from '@/lib/whatsapp';
import { useRecordNotificationMutation } from '@/features/booking/bookingApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

/**
 * Returns available notification template keys based on booking status
 * @param {string} status
 * @returns {Array<{key: string, label: string, icon: any}>}
 */
function getAvailableNotificationActions(status) {
  switch (status) {
    case 'pending':
      return [
        { key: 'confirmation', label: 'Send Confirmation', icon: CheckCircle2 },
        { key: 'cancellation', label: 'Send Cancellation Notice', icon: XCircle },
      ];
    case 'confirmed':
      return [
        { key: 'reminder', label: 'Send Reminder', icon: Clock },
        { key: 'confirmation', label: 'Send Confirmation', icon: CheckCircle2 },
        { key: 'reschedule', label: 'Send Reschedule Notice', icon: Calendar },
        { key: 'running_late', label: 'Send Running Late Notice', icon: AlertTriangle },
        { key: 'cancellation', label: 'Send Cancellation Notice', icon: XCircle },
      ];
    case 'completed':
      return [
        { key: 'review_request', label: 'Send Review Request', icon: Star },
        { key: 'confirmation', label: 'Send Receipt / Details', icon: CheckCircle2 },
      ];
    case 'cancelled':
      return [
        { key: 'cancellation', label: 'Send Cancellation Notice', icon: XCircle },
        { key: 'reschedule', label: 'Send Re-book Notice', icon: Calendar },
      ];
    default:
      return [
        { key: 'confirmation', label: 'Send Confirmation', icon: CheckCircle2 },
        { key: 'reminder', label: 'Send Reminder', icon: Clock },
      ];
  }
}

/**
 * Interactive WhatsApp trigger button with action menu, consent check, and mark-as-sent prompt
 */
export function WhatsAppActionMenu({
  booking,
  settings,
  serviceName,
  barberName,
  variant = 'dropdown', // 'dropdown' | 'buttons'
}) {
  const dispatch = useAppDispatch();
  const [recordNotification] = useRecordNotificationMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConsentWarning, setShowConsentWarning] = useState(false);
  const [showMarkSentPrompt, setShowMarkSentPrompt] = useState(false);

  const availableActions = getAvailableNotificationActions(booking.status);

  const handleActionClick = (actionKey) => {
    setIsOpen(false);
    setPendingAction(actionKey);

    if (!booking.whatsappConsent) {
      setShowConsentWarning(true);
    } else {
      executeWhatsAppLink(actionKey);
    }
  };

  const executeWhatsAppLink = (actionKey) => {
    const templates = settings?.messageTemplates || {};
    const template = templates[actionKey] || templates.confirmation || '';

    const message = renderTemplate(template, {
      name: booking.customerName,
      date: booking.date,
      time: booking.startTime,
      service: serviceName || booking.serviceName || 'Custom Grooming',
      barber: barberName || booking.barberName || 'Master Barber',
      shopName: settings?.shopName || 'Modern Mane',
      address: settings?.address || '42 Heritage Lane, Bandra West, Mumbai',
      mapsLink: settings?.mapsLink || 'https://maps.google.com/?q=Modern+Mane',
      bookingRef: booking.id ? `BK-${booking.id.slice(-6).toUpperCase()}` : '',
      reviewLink: settings?.googleReviewLink || 'https://g.page/r/modern-mane-reviews',
      cancelPolicy: settings?.policies?.termsNotice || 'Free cancellation up to 2 hours prior.',
    });

    const link = buildWhatsAppLink(booking.phone, message);
    if (!link) {
      dispatch(
        addToast({
          type: 'error',
          message: `Invalid customer phone number: ${booking.phone}`,
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
    if (!pendingAction) return;
    try {
      await recordNotification({
        id: booking.id,
        type: pendingAction,
        channel: 'whatsapp_link',
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: `Recorded ${pendingAction.replace('_', ' ')} notification sent via WhatsApp.`,
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          message: 'Failed to record notification log.',
        })
      );
    } finally {
      setShowMarkSentPrompt(false);
      setPendingAction(null);
    }
  };

  if (variant === 'buttons') {
    return (
      <div className="space-y-3">
        {/* Consent Badge */}
        <div className="flex items-center gap-2">
          {booking.whatsappConsent ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              WhatsApp Updates Opted In
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              No WhatsApp Opt-in
            </span>
          )}
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                type="button"
                onClick={() => handleActionClick(action.key)}
                className="flex items-center gap-2 px-3 py-2 rounded border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-medium text-xs transition-colors text-left"
              >
                <Icon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modals */}
        {renderModals()}
      </div>
    );
  }

  // Variant: Dropdown menu for table cell
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="WhatsApp Actions"
        aria-label={`WhatsApp actions for ${booking.customerName}`}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/30 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5 fill-[#25D366]" />
        <span className="hidden sm:inline">WhatsApp</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-52 rounded-md bg-white shadow-xl ring-1 ring-black/10 z-50 py-1 text-left border border-border-light animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-border-light text-[10px] uppercase font-bold text-muted flex items-center justify-between">
              <span>Send WhatsApp</span>
              {booking.whatsappConsent ? (
                <span className="text-emerald-600 font-semibold">Opted In</span>
              ) : (
                <span className="text-amber-600 font-semibold">No Consent</span>
              )}
            </div>
            {availableActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => handleActionClick(action.key)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ink hover:bg-neutral-50 transition-colors text-left"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Modals */}
      {renderModals()}
    </div>
  );

  function renderModals() {
    return (
      <>
        {/* Consent Warning Dialog */}
        {showConsentWarning && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-warning-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-5 text-left border border-amber-300">
              <div className="flex items-center gap-2.5 text-amber-700 mb-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 id="consent-warning-title" className="font-bold text-sm">
                  Customer Did Not Opt-In
                </h3>
              </div>
              <p className="text-xs text-ink/80 leading-relaxed mb-4">
                <strong>{booking.customerName}</strong> has not checked{' '}
                <em>&quot;Send me booking updates on WhatsApp&quot;</em>. Sending unprompted messages may violate customer communication preferences.
              </p>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowConsentWarning(false);
                    setPendingAction(null);
                  }}
                  className="px-3 py-1.5 rounded border border-border-light hover:bg-neutral-100 font-medium text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConsentWarning(false);
                    if (pendingAction) executeWhatsAppLink(pendingAction);
                  }}
                  className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Proceed to WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark As Sent Prompt Dialog */}
        {showMarkSentPrompt && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mark-sent-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-5 text-left border border-emerald-300">
              <div className="flex items-center gap-2.5 text-emerald-700 mb-2">
                <Send className="w-5 h-5 shrink-0" />
                <h3 id="mark-sent-title" className="font-bold text-sm">
                  Mark Notification as Sent?
                </h3>
              </div>
              <p className="text-xs text-ink/80 leading-relaxed mb-4">
                WhatsApp chat link has been opened for <strong>{booking.customerName}</strong>. Would you like to record this{' '}
                <span className="font-semibold text-emerald-700">{pendingAction?.replace('_', ' ')}</span> in the system log?
              </p>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMarkSentPrompt(false);
                    setPendingAction(null);
                  }}
                  className="px-3 py-1.5 rounded border border-border-light hover:bg-neutral-100 font-medium text-ink"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSent}
                  className="px-3.5 py-1.5 rounded bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold shadow-sm"
                >
                  Yes, Mark as Sent
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

WhatsAppActionMenu.propTypes = {
  booking: PropTypes.object.isRequired,
  settings: PropTypes.object,
  serviceName: PropTypes.string,
  barberName: PropTypes.string,
  variant: PropTypes.oneOf(['dropdown', 'buttons']),
};

export default WhatsAppActionMenu;
