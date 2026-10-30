import { useState, useEffect } from 'react';
import { Clock, Calendar, Save, PlusCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormField from '@/components/admin/FormField';
import QueryState from '@/components/common/QueryState';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/settings/settingsApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        shopHours,
        holidays,
        slotLengthMinutes: Number(slotLengthMinutes),
        policies: {
          cancellationGraceMinutes: Number(graceMinutes),
          termsNotice,
        },
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: 'Shop configuration saved and updated across public site.',
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
