/**
 * Generates and triggers download of an iCalendar (.ics) file
 *
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.description
 * @param {string} options.location
 * @param {string} options.date - YYYY-MM-DD
 * @param {string} options.startTime - e.g. "10:00 AM" or "10:00"
 * @param {string} options.endTime - e.g. "10:45 AM" or "10:45"
 * @param {string} [options.referenceNumber]
 */
export function downloadCalendarEvent({
  title,
  description,
  location,
  date,
  startTime,
  endTime,
  referenceNumber,
}) {
  const parseTime = (timeStr) => {
    if (!timeStr) return { hours: 10, minutes: 0 };
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return { hours: 10, minutes: 0 };

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  };

  const [year, month, day] = (date || '2026-11-01').split('-').map((n) => parseInt(n, 10));
  const startT = parseTime(startTime);
  const endT = parseTime(endTime || startTime);

  const formatIcsDate = (y, m, d, hh, mm) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
  };

  const dtStart = formatIcsDate(year, month, day, startT.hours, startT.minutes);
  const dtEnd = formatIcsDate(year, month, day, endT.hours, endT.minutes);
  const uid = `${Date.now()}-${referenceNumber || 'booking'}@sovereignbarber.com`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sovereign Barbershop//Appointment Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), 0, 0)}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title || 'Sovereign Barbershop Appointment'}`,
    `DESCRIPTION:${description || 'Grooming reservation'}`,
    `LOCATION:${location || '100 Feet Road, Indiranagar, Bengaluru'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `sovereign-appointment-${date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
