import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QueryState from '@/components/common/QueryState';
import { useGetSlotsQuery } from '@/features/booking/bookingApi';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';

export default function StepDateTime({
  serviceId,
  barberId,
  selectedDate,
  selectedSlot,
  onSelectSlot,
  onNext,
  onBack,
}) {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [currentDate, setCurrentDate] = useState(selectedDate || todayStr);

  const { data: settings } = useGetSettingsQuery();

  // Check holiday
  const holidays = settings?.holidays || [];
  const isHoliday = holidays.includes(currentDate);

  // Fetch slots (refetches automatically when currentDate, barberId, or serviceId changes)
  const resolvedBarberId = barberId && barberId !== 'any' ? barberId : undefined;
  const {
    data: slots = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSlotsQuery(
    {
      date: currentDate,
      barberId: resolvedBarberId,
      serviceId,
    },
    { skip: isHoliday }
  );

  // Generate 7 upcoming date shortcuts
  const quickDates = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      list.push({ iso, dayName, dayNum, monthName });
    }
    return list;
  }, []);

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleSlotClick = (slot) => {
    if (!slot.isAvailable) return;
    onSelectSlot({
      date: currentDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const isSlotSelected = (slot) =>
    selectedSlot?.date === currentDate && selectedSlot?.startTime === slot.startTime;

  const availableSlotsCount = slots.filter((s) => s.isAvailable).length;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl text-ink tracking-wide uppercase">
          3. Select Date & Appointment Slot
        </h2>
        <p className="text-muted text-sm mt-1">
          Pick your preferred day and available time window for your ritual.
        </p>
      </div>

      {/* Date Selection Box */}
      <Card tone="light" className="p-6 border border-border-light max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <label htmlFor="appointment-date-input" className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-accent" />
            <span>Select Date</span>
          </label>

          <input
            id="appointment-date-input"
            type="date"
            min={todayStr}
            value={currentDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Quick Date Pills */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {quickDates.map((item) => {
            const isSelected = currentDate === item.iso;
            const isHolidayDate = holidays.includes(item.iso);
            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => handleDateChange(item.iso)}
                className={`p-2.5 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'bg-ink text-white border-ink shadow-md scale-[1.02]'
                    : isHolidayDate
                      ? 'bg-card text-muted/60 border-dashed border-border-light'
                      : 'bg-card text-ink border-border-light hover:border-accent/40'
                }`}
              >
                <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-accent' : 'text-muted'}`}>
                  {item.dayName}
                </span>
                <span className="font-display text-lg sm:text-xl leading-none mt-1">
                  {item.dayNum}
                </span>
                <span className="text-[10px] text-muted leading-tight mt-0.5">
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Holiday Alert */}
      {isHoliday && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-3 max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>The barbershop is closed on this date for an official holiday. Please choose another date.</span>
        </div>
      )}

      {/* Slots Grid */}
      {!isHoliday && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-muted border-b border-border-light/60 pb-2">
            <span className="font-semibold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" /> Available Slots
            </span>
            <span>
              {availableSlotsCount} slot{availableSlotsCount === 1 ? '' : 's'} available
            </span>
          </div>

          <QueryState
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
            isEmpty={!isLoading && slots.length === 0}
            emptyMessage="No slots available, try another date."
          >
            {slots.length > 0 && availableSlotsCount === 0 ? (
              <div className="p-8 text-center text-muted bg-card rounded-lg border border-border-light">
                <Clock className="w-8 h-8 text-muted/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-ink">All slots are booked for this date.</p>
                <p className="text-xs mt-1">Please select an alternate date or choose &quot;Any Available Barber&quot;.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((slot) => {
                  const selected = isSlotSelected(slot);
                  const isAvailable = slot.isAvailable;

                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleSlotClick(slot)}
                      className={`p-3 rounded-md text-center transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        selected
                          ? 'bg-ink text-white border-ink ring-2 ring-accent shadow-md scale-105'
                          : isAvailable
                            ? 'bg-card text-ink border-border-light hover:border-accent hover:shadow-sm'
                            : 'bg-card/40 text-muted/50 border-border-light/40 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-display text-base tracking-wide">
                        {slot.startTime}
                      </div>
                      <div className="text-[11px] text-muted font-normal mt-0.5">
                        {isAvailable ? `until ${slot.endTime}` : 'Booked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </QueryState>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 max-w-3xl mx-auto">
        <Button variant="outline" size="md" onClick={onBack} className="text-xs uppercase font-semibold">
          Back
        </Button>

        <Button
          variant="accent"
          size="lg"
          disabled={!selectedSlot?.startTime || selectedSlot?.date !== currentDate}
          onClick={onNext}
          className="px-8 tracking-wider uppercase font-semibold text-xs"
        >
          Continue to Summary
        </Button>
      </div>
    </div>
  );
}

StepDateTime.propTypes = {
  serviceId: PropTypes.string,
  barberId: PropTypes.string,
  selectedDate: PropTypes.string,
  selectedSlot: PropTypes.shape({
    date: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }),
  onSelectSlot: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
