import { useState, useEffect } from 'react';
import { Clock, Calendar, Save, PlusCircle, MessageSquare, RotateCcw, AlertCircle, Check, CreditCard, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormField from '@/components/admin/FormField';
import QueryState from '@/components/common/QueryState';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/settings/settingsApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import {
  renderTemplate,
  validateTemplatePlaceholders,
  KNOWN_PLACEHOLDERS,
} from '@/lib/whatsapp';

const DEFAULT_TEMPLATES = {
  confirmation:
    'Hello {name}! Your appointment at {shopName} is confirmed.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\n📍 Address: {address}\n🗺️ Maps: {mapsLink}\n\nFor any changes, reply to this WhatsApp message. See you soon!',
  reminder:
    'Hello {name}! Friendly reminder that your grooming session at {shopName} is coming up.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n\nPlease arrive 5 minutes early. Let us know if you need any adjustments!',
  reschedule:
    'Hello {name}! Your appointment at {shopName} has been rescheduled.\n\n📅 New Date: {date}\n⏰ New Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\nThank you! We look forward to seeing you.',
  cancellation:
    'Hello {name}! Your booking (Ref: {bookingRef}) at {shopName} has been cancelled.\n\nTo schedule a new appointment, visit our website or message us here. Thank you!',
  review_request:
    'Hello {name}! Thank you for visiting {shopName}! We hope you enjoyed your service.\n\nYour feedback means a lot to us. Please take a minute to leave a review:\n⭐ {reviewLink}\n\nHave a great day ahead!',
  rebooking_nudge:
    'Hello {name}! Checking in from {shopName}—your last visit was about {lastVisitAgo}. Keep your look sharp and book your next appointment today: {bookingLink}',
  birthday_greeting:
    'Happy Birthday {name}! 🎂 Warm wishes from the team at {shopName}. Treat yourself to a premium grooming session today: {bookingLink}',
  running_late:
    'Hello {name}! Update from {shopName}: our chairs are running slightly behind and your appointment may start 10-15 minutes late. We apologize for the wait and will attend to you shortly!',
};

const TEMPLATE_TABS = [
  { key: 'confirmation', label: 'Confirmation' },
  { key: 'reminder', label: 'Reminder' },
  { key: 'reschedule', label: 'Reschedule' },
  { key: 'cancellation', label: 'Cancellation' },
  { key: 'review_request', label: 'Review Request' },
  { key: 'running_late', label: 'Running Late' },
  { key: 'rebooking_nudge', label: 'Rebooking Nudge' },
  { key: 'birthday_greeting', label: 'Birthday Greeting' },
];

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const { data: settings, isLoading, isError, error, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const [shopHours, setShopHours] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [slotLengthMinutes, setSlotLengthMinutes] = useState(30);
  const [graceMinutes, setGraceMinutes] = useState(120);
  const [termsNotice, setTermsNotice] = useState('');
  const [noShowThreshold, setNoShowThreshold] = useState(3);
  const [privacyNotice, setPrivacyNotice] = useState(
    'We use your phone number only for booking updates.'
  );
  const [newHoliday, setNewHoliday] = useState('');

  // WhatsApp & Templates state
  const [whatsappNumber, setWhatsappNumber] = useState('919876543210');
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/modern-mane-reviews');
  const [messageTemplates, setMessageTemplates] = useState({ ...DEFAULT_TEMPLATES });
  const [activeTemplateKey, setActiveTemplateKey] = useState('confirmation');

  // Payment Settings state
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [paymentMode, setPaymentMode] = useState('deposit');
  const [depositType, setDepositType] = useState('percent');
  const [depositValue, setDepositValue] = useState(20);
  const [minimumServicePrice, setMinimumServicePrice] = useState(0);
  const [refundPolicyHours, setRefundPolicyHours] = useState(2);
  const [refundPolicyTextEn, setRefundPolicyTextEn] = useState(
    'Free cancellation up to 2 hours prior to scheduled appointment for full deposit refund.'
  );
  const [refundPolicyTextHi, setRefundPolicyTextHi] = useState(
    'Free cancellation up to 2 hours prior to scheduled appointment for full deposit refund.'
  );
  const [holdTimeoutMinutes, setHoldTimeoutMinutes] = useState(10);

  // Loyalty & Rebooking Settings
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [loyaltyMode, setLoyaltyMode] = useState('stamps');
  const [stampsForReward, setStampsForReward] = useState(10);
  const [stampsPerBooking, setStampsPerBooking] = useState(1);
  const [rebookingNudgeDays, setRebookingNudgeDays] = useState(28);

  useEffect(() => {
    if (settings) {
      setShopHours(
        settings.shopHours || [
          { days: 'Monday – Friday', time: '9:00 AM – 8:30 PM' },
          { days: 'Saturday', time: '9:00 AM – 8:30 PM' },
          { days: 'Sunday', time: '10:00 AM – 7:00 PM' },
        ]
      );
      setHolidays(settings.holidays || []);
      setSlotLengthMinutes(settings.slotLengthMinutes || 30);
      setGraceMinutes(settings.policies?.cancellationGraceMinutes || 120);
      setNoShowThreshold(settings.policies?.noShowThreshold ?? 3);
      setPrivacyNotice(
        settings.policies?.privacyNotice || 'We use your phone number only for booking updates.'
      );
      setTermsNotice(
        settings.policies?.termsNotice ||
          'Free cancellation up to 2 hours prior to scheduled appointment.'
      );
      setWhatsappNumber(settings.whatsappNumber || '919876543210');
      setGoogleReviewLink(settings.googleReviewLink || 'https://g.page/r/modern-mane-reviews');

      const pSet = settings.paymentSettings || {};
      setPaymentsEnabled(Boolean(pSet.paymentsEnabled));
      setPaymentMode(pSet.paymentMode || 'deposit');
      setDepositType(pSet.depositType || 'percent');
      setDepositValue(pSet.depositValue ?? 20);
      setMinimumServicePrice(pSet.minimumServicePrice ?? 0);
      setRefundPolicyHours(pSet.refundPolicyHours ?? 2);
      setRefundPolicyTextEn(
        pSet.refundPolicyText?.en ||
          'Free cancellation up to 2 hours prior to scheduled appointment for full deposit refund.'
      );
      setRefundPolicyTextHi(
        pSet.refundPolicyText?.hi ||
          'Free cancellation up to 2 hours prior to scheduled appointment for full deposit refund.'
      );
      setHoldTimeoutMinutes(pSet.holdTimeoutMinutes ?? 10);

      const lSet = settings.loyaltySettings || {};
      setLoyaltyEnabled(Boolean(lSet.loyaltyEnabled));
      setLoyaltyMode(lSet.mode || 'stamps');
      setStampsForReward(lSet.stampsForReward ?? 10);
      setStampsPerBooking(lSet.stampsPerBooking ?? 1);
      setRebookingNudgeDays(settings.rebookingSettings?.rebookingNudgeDays ?? 28);
      if (settings.messageTemplates) {
        setMessageTemplates({ ...DEFAULT_TEMPLATES, ...settings.messageTemplates });
      }
    }
  }, [settings]);

  const handleHourChange = (index, field, value) => {
    const updated = [...shopHours];
    updated[index] = { ...updated[index], [field]: value };
    setShopHours(updated);
  };

  const handleAddHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays([...holidays, newHoliday]);
      setNewHoliday('');
    }
  };

  const handleRemoveHoliday = (dateToRemove) => {
    setHolidays(holidays.filter((d) => d !== dateToRemove));
  };

  const handleTemplateChange = (val) => {
    setMessageTemplates((prev) => ({
      ...prev,
      [activeTemplateKey]: val,
    }));
  };

  const handleResetTemplate = () => {
    setMessageTemplates((prev) => ({
      ...prev,
      [activeTemplateKey]: DEFAULT_TEMPLATES[activeTemplateKey],
    }));
    dispatch(
      addToast({
        type: 'info',
        message: `Reset ${activeTemplateKey} template to default Hinglish version.`,
      })
    );
  };

  const handleInsertPlaceholder = (placeholder) => {
    const current = messageTemplates[activeTemplateKey] || '';
    handleTemplateChange(`${current} {${placeholder}}`);
  };

  const currentTemplate = messageTemplates[activeTemplateKey] || '';
  const currentValidation = validateTemplatePlaceholders(currentTemplate);

  // Live preview rendered with sample customer data
  const sampleData = {
    name: 'Aakash Verma',
    date: '2026-11-05',
    time: '10:00 AM',
    service: 'Classic Haircut & Styling',
    barber: 'John Smith',
    shopName: 'Modern Mane',
    address: '42 Heritage Lane, Bandra West, Mumbai',
    mapsLink: 'https://maps.google.com/?q=Modern+Mane',
    bookingRef: 'BK-082341',
    reviewLink: googleReviewLink || 'https://g.page/r/modern-mane-reviews',
    cancelPolicy: termsNotice || 'Free cancellation up to 2 hours prior.',
  };

  const livePreviewText = renderTemplate(currentTemplate, sampleData);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        shopHours,
        holidays,
        slotLengthMinutes: Number(slotLengthMinutes),
        whatsappNumber,
        googleReviewLink,
        messageTemplates,
        paymentSettings: {
          paymentsEnabled,
          paymentMode,
          depositType,
          depositValue: Number(depositValue),
          minimumServicePrice: Number(minimumServicePrice),
          refundPolicyHours: Number(refundPolicyHours),
          refundPolicyText: {
            en: refundPolicyTextEn,
            hi: refundPolicyTextHi,
          },
          holdTimeoutMinutes: Number(holdTimeoutMinutes),
        },
        loyaltySettings: {
          loyaltyEnabled,
          mode: loyaltyMode,
          stampsForReward: Number(stampsForReward),
          stampsPerBooking: Number(stampsPerBooking),
        },
        rebookingSettings: {
          rebookingNudgeDays: Number(rebookingNudgeDays),
        },
        policies: {
          cancellationGraceMinutes: Number(graceMinutes),
          termsNotice,
          noShowThreshold: Number(noShowThreshold),
          privacyNotice,
        },
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: 'Shop configuration & WhatsApp templates saved successfully.',
        })
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to save settings' }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink tracking-wide uppercase">
          SHOP CONFIGURATION & POLICIES
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-0.5">
          Configure operating hours, scheduled closures, slot intervals, and customer booking rules.
        </p>
      </div>

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <form onSubmit={handleSave} className="space-y-8">
          {/* Shop Hours Section */}
          <Card tone="light" className="p-6 border border-border-light shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light pb-3">
              <Clock className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl text-ink uppercase tracking-wide">
                Operating Schedule
              </h2>
            </div>

            <div className="space-y-3">
              {shopHours.map((schedule, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label={`Days (${idx + 1})`}>
                    <input
                      type="text"
                      value={schedule.days}
                      onChange={(e) => handleHourChange(idx, 'days', e.target.value)}
                      className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink font-medium"
                    />
                  </FormField>
                  <FormField label="Hours">
                    <input
                      type="text"
                      value={schedule.time}
                      onChange={(e) => handleHourChange(idx, 'time', e.target.value)}
                      className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink font-medium"
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </Card>

          {/* Holidays Section */}
          <Card tone="light" className="p-6 border border-border-light shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light pb-3">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl text-ink uppercase tracking-wide">
                Official Holidays & Closures
              </h2>
            </div>
            <p className="text-xs text-muted">
              Dates listed here will be blocked on the public booking calendar with a closure notice.
            </p>

            <div className="flex gap-2 max-w-sm">
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                className="px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddHoliday}>
                <PlusCircle className="w-4 h-4 mr-1" /> Add Holiday
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {holidays.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded bg-card border border-border-light text-xs text-ink font-mono font-medium"
                >
                  {date}
                  <button
                    type="button"
                    onClick={() => handleRemoveHoliday(date)}
                    className="text-muted hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Slot Length & Booking Interval */}
          <Card tone="light" className="p-6 border border-border-light shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light pb-3">
              <Clock className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl text-ink uppercase tracking-wide">
                Slot Duration & Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Standard Slot Interval" id="set-slot-len">
                <select
                  id="set-slot-len"
                  value={slotLengthMinutes}
                  onChange={(e) => setSlotLengthMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </FormField>

              <FormField label="Cancellation Grace Period (Minutes)" id="set-grace">
                <input
                  id="set-grace"
                  type="number"
                  min={0}
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Repeat No-Show Flagging Threshold"
                id="set-noshow-thresh"
                hint="Auto-flags customer profile with 'Repeated no-shows' when reached"
              >
                <input
                  id="set-noshow-thresh"
                  type="number"
                  min={1}
                  max={10}
                  value={noShowThreshold}
                  onChange={(e) => setNoShowThreshold(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
                />
              </FormField>

              <FormField
                label="Public Customer Privacy Notice"
                id="set-privacy-notice"
                hint="Displayed on checkout forms regarding phone usage"
              >
                <input
                  id="set-privacy-notice"
                  type="text"
                  value={privacyNotice}
                  onChange={(e) => setPrivacyNotice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
                />
              </FormField>
            </div>

            <FormField label="Public Booking Terms & Policy Text" id="set-notice">
              <textarea
                id="set-notice"
                rows={3}
                value={termsNotice}
                onChange={(e) => setTermsNotice(e.target.value)}
                className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink resize-none"
              />
            </FormField>
          </Card>

          {/* WhatsApp & Customer Communication */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-ink uppercase tracking-wider font-heading">
                  WhatsApp & Click-to-Chat Notifications
                </h2>
              </div>
              <span className="text-xs text-ink/60 bg-surface px-2.5 py-1 rounded-full border border-border-light font-mono">
                Free wa.me Links
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Shop WhatsApp Number"
                id="shop-whatsapp"
                hint="Used for customer one-click confirmations & public chat (e.g. 9876543210 or +91 98765 43210)"
              >
                <input
                  id="shop-whatsapp"
                  type="text"
                  placeholder="919876543210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
                />
              </FormField>

              <FormField
                label="Google Review URL"
                id="shop-review-url"
                hint="Substituted into {reviewLink} when sending review requests"
              >
                <input
                  id="shop-review-url"
                  type="url"
                  placeholder="https://g.page/r/your-shop-id/review"
                  value={googleReviewLink}
                  onChange={(e) => setGoogleReviewLink(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
                />
              </FormField>
            </div>

            {/* Template Selector Tabs */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs uppercase tracking-wider font-medium text-ink/70">
                  Message Templates (Hinglish Roman Script)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetTemplate}
                  className="text-xs h-7 px-2.5 text-ink/70 hover:text-ink"
                >
                  <RotateCcw className="w-3 h-3 mr-1.5" />
                  Reset to Default
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 border-b border-border-light pb-2">
                {TEMPLATE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTemplateKey(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeTemplateKey === tab.key
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-surface hover:bg-surface-elevated text-ink/70 hover:text-ink border border-border-light'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Template Editor & Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink/60">
                    <span>Click placeholder to append:</span>
                    <span className="font-mono">{currentTemplate.length} chars</span>
                  </div>

                  {/* Placeholder Chips */}
                  <div className="flex flex-wrap gap-1.5 p-2 rounded bg-surface/50 border border-border-light">
                    {KNOWN_PLACEHOLDERS.map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => handleInsertPlaceholder(token)}
                        className="text-[11px] px-2 py-0.5 rounded bg-card hover:bg-emerald-500/10 hover:text-emerald-500 border border-border-light text-ink/70 transition-colors font-mono"
                      >
                        +{'{' + token + '}'}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={8}
                    value={currentTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className={`w-full p-3 rounded bg-card border text-xs sm:text-sm text-ink resize-y font-mono ${
                      currentValidation.isValid
                        ? 'border-border-light focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                        : 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    }`}
                    placeholder="Enter template text with placeholders..."
                  />

                  {!currentValidation.isValid && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 p-2.5 rounded border border-red-500/20">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Unrecognized placeholder(s):{' '}
                        <strong>{currentValidation.invalid.map((p) => `{${p}}`).join(', ')}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Live Preview simulating WhatsApp */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-ink/60">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Live Customer WhatsApp Preview
                    </span>
                    <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                      Sample Data Rendered
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-border-light shadow-inner min-h-[220px] flex flex-col justify-end">
                    <div className="max-w-[85%] self-end bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none px-3.5 py-2.5 text-xs sm:text-sm shadow whitespace-pre-wrap leading-relaxed">
                      {livePreviewText || (
                        <span className="italic text-slate-400">Template is empty</span>
                      )}
                      <div className="text-[10px] text-right text-emerald-200/60 mt-1.5 flex items-center justify-end gap-1">
                        <span>10:30 AM</span>
                        <span>✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Loyalty Program & Rebooking Automation */}
          <Card tone="white" className="p-6 border border-border-light space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink uppercase tracking-wide">
                    Loyalty Stamp Program & Rebooking Intervals
                  </h3>
                  <p className="text-xs text-ink/60">
                    Award digital stamps upon completed cuts and automate client return reminders.
                  </p>
                </div>
              </div>

              {/* Enable / Disable Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={loyaltyEnabled}
                  onChange={(e) => setLoyaltyEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border-light text-accent focus:ring-accent accent-accent"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  {loyaltyEnabled ? 'Loyalty Enabled' : 'Loyalty Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="loyalty-mode-select" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Loyalty Mode
                </label>
                <select
                  id="loyalty-mode-select"
                  value={loyaltyMode}
                  onChange={(e) => setLoyaltyMode(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink"
                >
                  <option value="stamps">Visit Stamps (1 per visit)</option>
                  <option value="points">Points System</option>
                </select>
              </div>

              <div>
                <label htmlFor="stamps-for-reward-input" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Stamps Required for Reward
                </label>
                <input
                  id="stamps-for-reward-input"
                  type="number"
                  min="1"
                  max="50"
                  value={stampsForReward}
                  onChange={(e) => setStampsForReward(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink"
                />
              </div>

              <div>
                <label htmlFor="stamps-per-booking-input" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Stamps Earned Per Booking
                </label>
                <input
                  id="stamps-per-booking-input"
                  type="number"
                  min="1"
                  max="5"
                  value={stampsPerBooking}
                  onChange={(e) => setStampsPerBooking(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink"
                />
              </div>

              <div>
                <label htmlFor="rebooking-nudge-days-input" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Rebooking Interval (Days)
                </label>
                <input
                  id="rebooking-nudge-days-input"
                  type="number"
                  min="7"
                  max="180"
                  value={rebookingNudgeDays}
                  onChange={(e) => setRebookingNudgeDays(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink"
                />
              </div>
            </div>
          </Card>

          {/* Online Payments & Deposits (Razorpay) */}
          <Card tone="white" className="p-6 border border-border-light space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink uppercase tracking-wide">
                    Online Payments & Deposits (Razorpay)
                  </h3>
                  <p className="text-xs text-muted">
                    Collect upfront deposits or full payments to drastically reduce no-shows.
                  </p>
                </div>
              </div>

              {/* Enable / Disable Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={paymentsEnabled}
                  onChange={(e) => setPaymentsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border-light text-accent focus:ring-accent accent-accent"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  {paymentsEnabled ? 'Payments Enabled' : 'Payments Disabled'}
                </span>
              </label>
            </div>

            {paymentsEnabled && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Payment Mode */}
                  <div>
                    <label
                      htmlFor="payment-mode-select"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Payment Mode
                    </label>
                    <select
                      id="payment-mode-select"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink focus:outline-none"
                    >
                      <option value="deposit">Deposit Only (Partial)</option>
                      <option value="full">Full Payment Required</option>
                      <option value="none">Disabled</option>
                    </select>
                  </div>

                  {/* Deposit Type */}
                  {paymentMode === 'deposit' && (
                    <>
                      <div>
                        <label
                          htmlFor="deposit-type-select"
                          className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                        >
                          Deposit Type
                        </label>
                        <select
                          id="deposit-type-select"
                          value={depositType}
                          onChange={(e) => setDepositType(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink focus:outline-none"
                        >
                          <option value="percent">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="deposit-value-input"
                          className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                        >
                          Deposit Value ({depositType === 'percent' ? '%' : '₹'})
                        </label>
                        <input
                          id="deposit-value-input"
                          type="number"
                          min="1"
                          max={depositType === 'percent' ? 100 : 10000}
                          value={depositValue}
                          onChange={(e) => setDepositValue(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink focus:outline-none font-semibold"
                        />
                      </div>
                    </>
                  )}

                  {/* Minimum Service Price */}
                  <div>
                    <label
                      htmlFor="min-service-price-input"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Min Price for Deposit (₹)
                    </label>
                    <input
                      id="min-service-price-input"
                      type="number"
                      min="0"
                      value={minimumServicePrice}
                      onChange={(e) => setMinimumServicePrice(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink focus:outline-none"
                    />
                  </div>

                  {/* Slot Hold Timeout */}
                  <div>
                    <label
                      htmlFor="hold-timeout-input"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Slot Hold Timeout (Mins)
                    </label>
                    <input
                      id="hold-timeout-input"
                      type="number"
                      min="5"
                      max="60"
                      value={holdTimeoutMinutes}
                      onChange={(e) => setHoldTimeoutMinutes(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink focus:outline-none"
                    />
                  </div>

                  {/* Refund Policy Hours */}
                  <div>
                    <label
                      htmlFor="refund-policy-hours-input"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Free Cancel Window (Hours)
                    </label>
                    <input
                      id="refund-policy-hours-input"
                      type="number"
                      min="0"
                      max="72"
                      value={refundPolicyHours}
                      onChange={(e) => setRefundPolicyHours(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink focus:outline-none"
                    />
                  </div>
                </div>

                {/* Refund Policy Text (Bilingual) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border-light">
                  <div>
                    <label
                      htmlFor="refund-policy-en-input"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1"
                    >
                      Refund Policy Notice (English)
                    </label>
                    <input
                      id="refund-policy-en-input"
                      type="text"
                      value={refundPolicyTextEn}
                      onChange={(e) => setRefundPolicyTextEn(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="refund-policy-hi-input"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1"
                    >
                      Refund Policy Notice (Local)
                    </label>
                    <input
                      id="refund-policy-hi-input"
                      type="text"
                      value={refundPolicyTextHi}
                      onChange={(e) => setRefundPolicyTextHi(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-border-light bg-neutral-50 focus:bg-white text-ink"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={isSaving}
              className="tracking-wider uppercase font-semibold text-xs px-8 shadow-md"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving Changes...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </QueryState>
    </div>
  );
}
