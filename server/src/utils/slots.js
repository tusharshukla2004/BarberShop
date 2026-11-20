/**
 * Converts formatted time ("09:00 AM", "2:30 PM", "09:00", "20:30") to minutes from midnight
 * @param {string} timeStr
 * @returns {number}
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const cleaned = timeStr.trim().toUpperCase();

  // Match 12-hour format: "09:30 AM" or "9:30 PM"
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3];

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Match 24-hour format: "09:30" or "20:30"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return 0;
}

/**
 * Converts minutes from midnight into 12-hour formatted time ("09:00 AM", "02:30 PM")
 * @param {number} totalMinutes
 * @returns {string}
 */
export function minutesToTimeStr(totalMinutes) {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  let hours = Math.floor(norm / 60);
  const minutes = norm % 60;
  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}:${mm} ${period}`;
}

/**
 * Gets current date and minutes from midnight in Asia/Kolkata timezone
 * @param {Date} [customNow]
 * @returns {{ todayDate: string, currentMinutes: number }}
 */
export function getKolkataCurrentDateAndMinutes(customNow = new Date()) {
  const d = new Date(customNow);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayDate = formatter.format(d); // YYYY-MM-DD

  const timeParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const hour = parseInt(timeParts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(timeParts.find((p) => p.type === 'minute')?.value || '0', 10);

  const currentMinutes = hour * 60 + minute;

  return {
    todayDate,
    dateStr: todayDate,
    currentMinutes,
    currentTimeMinutes: currentMinutes,
  };
}

/**
 * Calculates available slots for a barber, service, date combination
 *
 * @param {Object} options
 * @param {string} options.date - Target date (YYYY-MM-DD)
 * @param {Object} options.barber - Barber document/object
 * @param {Object} options.service - Service document/object
 * @param {Array<Object>} [options.existingBookings=[]] - Active bookings for this barber & date
 * @param {Object} [options.settings] - Settings document
 * @param {Date} [options.now] - Current timestamp reference
 * @returns {Array<{ startTime: string, endTime: string, isAvailable: boolean }>}
 */
export function calculateSlots({
  date,
  barber,
  service,
  existingBookings = [],
  settings = {},
  now = new Date(),
}) {
  if (!date || !barber) return [];

  // 1. Holiday check
  const holidays = settings?.holidays || [];
  if (holidays.includes(date)) {
    return [];
  }

  // 2. Barber active & leave day check
  if (barber.isActive === false) {
    return [];
  }

  if (Array.isArray(barber.leaveDays)) {
    const isLeave = barber.leaveDays.some((leave) => {
      const leaveDate =
        leave instanceof Date
          ? leave.toISOString().split('T')[0]
          : typeof leave === 'string'
            ? leave.split('T')[0]
            : null;
      return leaveDate === date;
    });
    if (isLeave) return [];
  }

  // 3. Barber working hours for this weekday
  // Get Day name from date (e.g. 'Monday', 'Tuesday')
  const [year, month, day] = date.split('-').map((n) => parseInt(n, 10));
  const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayName = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(dateObj);

  const defaultHours = { start: '09:00', end: '20:30', isWorking: true };
  const daySchedule = barber.workingHours?.find((wh) => wh.day === dayName) || defaultHours;

  if (!daySchedule.isWorking) {
    return [];
  }

  const shiftStartMin = timeToMinutes(daySchedule.start || '09:00');
  const shiftEndMin = timeToMinutes(daySchedule.end || '20:30');
  const serviceDuration = service?.durationMinutes || 30;
  const slotLength = settings?.slotLengthMinutes || 30;

  // 4. Past time filter for today (Asia/Kolkata)
  const { todayDate, currentMinutes } = getKolkataCurrentDateAndMinutes(now);
  const isToday = date === todayDate;

  // 5. Convert existing active bookings to minute intervals
  // Active bookings include 'confirmed', 'pending', and unexpired 'pending_payment' holds
  const nowMs = new Date(now).getTime();
  const activeBookings = (existingBookings || [])
    .filter((b) => {
      if (b.status === 'confirmed' || b.status === 'pending') return true;
      if (b.status === 'pending_payment') {
        if (!b.expiresAt) return true;
        return new Date(b.expiresAt).getTime() > nowMs;
      }
      return false;
    })
    .map((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = b.endTime ? timeToMinutes(b.endTime) : bStart + serviceDuration;
      return { start: bStart, end: bEnd };
    });

  const slots = [];

  for (let current = shiftStartMin; current < shiftEndMin; current += slotLength) {
    const slotEnd = current + serviceDuration;

    // Service duration cannot exceed barber shift end
    if (slotEnd > shiftEndMin) {
      break;
    }

    // Filter out past slots if date is today
    if (isToday && current <= currentMinutes) {
      continue;
    }

    // Overlap check with existing bookings: Math.max(s1, s2) < Math.min(e1, e2)
    const isConflict = activeBookings.some((b) => {
      return Math.max(current, b.start) < Math.min(slotEnd, b.end);
    });

    slots.push({
      startTime: minutesToTimeStr(current),
      endTime: minutesToTimeStr(slotEnd),
      isAvailable: !isConflict,
    });
  }

  return slots;
}
