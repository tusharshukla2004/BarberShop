import { useState, useEffect } from 'react';
import { Clock, Calendar, Save, PlusCircle, MessageSquare, RotateCcw, AlertCircle, Check } from 'lucide-react';
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
    'Namaste {name}! Aapka appointment {shopName} me confirm ho gaya hai.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\n📍 Address: {address}\n🗺️ Maps: {mapsLink}\n\nKisi bhi change ke liye hume yahan WhatsApp par reply karein. See you soon!',
  reminder:
    'Namaste {name}! Yeh ek friendly reminder hai ki aapka grooming session {shopName} par scheduled hai.\n\n📅 Date: {date}\n⏰ Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n\nKripya 5 minute pehle pahuchein. Agar koi change chahiye toh please bataiye!',
  reschedule:
    'Namaste {name}! Aapka {shopName} ka appointment naye samay par reschedule kar diya gaya hai.\n\n📅 Nayi Date: {date}\n⏰ Naya Time: {time}\n💈 Service: {service}\n✂️ Barber: {barber}\n🔖 Ref: {bookingRef}\n\nShukriya! Hum aapka intezar karenge.',
  cancellation:
    'Namaste {name}! Aapka booking (Ref: {bookingRef}) {shopName} par cancel kar diya gaya hai.\n\nNaye appointment ke liye aap kabhi bhi humari website par visit kar sakte hain ya hume yahan message karein. Shukriya!',
  review_request:
    'Namaste {name}! {shopName} visit karne ke liye bohot shukriya! Ummeed hai aapko hamara service aur cut pasand aaya.\n\nAapka feedback hamare liye bohot keemti hai. Kripya 1 minute nikaal kar apna review zaroor dein:\n⭐ {reviewLink}\n\nHave a great day ahead!',
  running_late:
    'Namaste {name}! {shopName} se update: aaj chair thodi busy hone ke karan aapka slot lagbhag 10-15 minute late ho sakta hai. Asuvidha ke liye khed hai. Hum jaldi hi aapko attend karenge!',
};

const TEMPLATE_TABS = [
  { key: 'confirmation', label: 'Confirmation' },
  { key: 'reminder', label: 'Reminder' },
  { key: 'reschedule', label: 'Reschedule' },
  { key: 'cancellation', label: 'Cancellation' },
  { key: 'review_request', label: 'Review Request' },
  { key: 'running_late', label: 'Running Late' },
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
  const [newHoliday, setNewHoliday] = useState('');

  // WhatsApp & Templates state
  const [whatsappNumber, setWhatsappNumber] = useState('919876543210');
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/modern-mane-reviews');
  const [messageTemplates, setMessageTemplates] = useState({ ...DEFAULT_TEMPLATES });
  const [activeTemplateKey, setActiveTemplateKey] = useState('confirmation');

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
      setTermsNotice(
        settings.policies?.termsNotice ||
          'Free cancellation up to 2 hours prior to scheduled appointment.'
      );
      setWhatsappNumber(settings.whatsappNumber || '919876543210');
      setGoogleReviewLink(settings.googleReviewLink || 'https://g.page/r/modern-mane-reviews');
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
        policies: {
          cancellationGraceMinutes: Number(graceMinutes),
          termsNotice,
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
