import {
  timeToMinutes,
  minutesToTimeStr,
  getKolkataCurrentDateAndMinutes,
} from './slots.js';

/**
 * Resolves a barber's working hours, breaks, and active status for a given date
 * @param {Object} barber
 * @param {string} dateStr - YYYY-MM-DD
 * @param {Object} settings
 * @returns {{ isWorking: boolean, startMinutes: number, closeMinutes: number, breaks: Array<{start: number, end: number}> }}
 */
export function getBarberWorkingDetails(barber, dateStr, settings = {}) {
  if (!barber || barber.isActive === false) {
    return { isWorking: false, startMinutes: 0, closeMinutes: 0, breaks: [] };
  }

  // 1. Check leave days
  if (Array.isArray(barber.leaves) && barber.leaves.includes(dateStr)) {
    return { isWorking: false, startMinutes: 0, closeMinutes: 0, breaks: [] };
  }

  // 2. Check shop holidays
  if (Array.isArray(settings?.holidays) && settings.holidays.includes(dateStr)) {
    return { isWorking: false, startMinutes: 0, closeMinutes: 0, breaks: [] };
  }

  // Default day of week
  const dateObj = new Date(`${dateStr}T12:00:00+05:30`);
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = daysOfWeek[dateObj.getDay()];

  // Check barber schedule
  let isOff = false;
  let startMinutes = 9 * 60; // 09:00 AM default
  let closeMinutes = 20 * 60 + 30; // 08:30 PM default
  const breaks = [];

  if (barber.schedule && barber.schedule[dayName]) {
    const daySched = barber.schedule[dayName];
    if (daySched.isOff) {
      return { isWorking: false, startMinutes: 0, closeMinutes: 0, breaks: [] };
    }
    if (daySched.start) startMinutes = timeToMinutes(daySched.start);
    if (daySched.end) closeMinutes = timeToMinutes(daySched.end);
    if (Array.isArray(daySched.breaks)) {
      daySched.breaks.forEach((brk) => {
        breaks.push({
          start: timeToMinutes(brk.start),
          end: timeToMinutes(brk.end),
        });
      });
    }
  } else if (Array.isArray(settings?.shopHours) && settings.shopHours.length > 0) {
    // Fallback to shopHours
    const primary = settings.shopHours[0];
    if (primary?.time) {
      const parts = primary.time.split(/–|-/);
      if (parts.length === 2) {
        startMinutes = timeToMinutes(parts[0].trim());
        closeMinutes = timeToMinutes(parts[1].trim());
      }
    }
  }

  return {
    isWorking: true,
    startMinutes,
    closeMinutes,
    breaks,
  };
}

/**
 * Pure function: calculates real-time estimated wait times and earliest available barber
 *
 * @param {Object} params
 * @param {Array<Object>} params.barbers - All active master barbers
 * @param {Array<Object>} params.services - Service catalog with durationMinutes
 * @param {Array<Object>} params.queueEntries - Active queue entries (in_service, called, waiting) for today
 * @param {Array<Object>} params.confirmedBookings - Confirmed/pending appointments for today
 * @param {Object} params.settings - Shop settings (bufferMinutes, stopAcceptingBeforeClosingMinutes)
 * @param {string} [params.dateStr] - YYYY-MM-DD
 * @param {number} [params.currentMinutes] - Minutes from midnight
 * @param {string} [params.targetBarberId] - Optional requested barber ID (empty for 'any')
 * @param {number} [params.targetDuration] - Duration in minutes of the prospective haircut
 * @returns {Object}
 */
export function calculateQueueWaitTimes({
  barbers = [],
  services = [],
  queueEntries = [],
  confirmedBookings = [],
  settings = {},
  dateStr,
  currentMinutes,
  targetBarberId = '',
  targetDuration = 30,
}) {
  const resolvedDate = dateStr || getKolkataCurrentDateAndMinutes().todayDate;
  const resolvedNow =
    typeof currentMinutes === 'number'
      ? currentMinutes
      : getKolkataCurrentDateAndMinutes().currentMinutes;

  const bufferMinutes = Number(settings?.queueSettings?.bufferMinutes ?? 5);
  const stopBeforeClosing = Number(settings?.queueSettings?.stopAcceptingBeforeClosingMinutes ?? 45);

  // Map services for duration lookup
  const serviceDurationMap = new Map();
  for (const s of services) {
    const dur = Number(s.durationMinutes) || 30;
    if (s.id) serviceDurationMap.set(s.id, dur);
    if (s._id) serviceDurationMap.set(s._id.toString(), dur);
  }

  // Filter working barbers for today
  const workingBarbers = [];
  const barberTimelines = new Map();

  for (const barber of barbers) {
    const bId = (barber.id || barber._id || '').toString();
    const details = getBarberWorkingDetails(barber, resolvedDate, settings);

    if (details.isWorking) {
      workingBarbers.push({
        ...barber,
        id: bId,
        details,
      });

      // Fixed busy blocks: breaks and confirmed appointments
      const busyBlocks = [...details.breaks];

      // Add confirmed bookings for this barber
      for (const booking of confirmedBookings) {
        const bookedBarberId = (booking.barberId || '').toString();
        if (
          bookedBarberId === bId &&
          (booking.status === 'confirmed' || booking.status === 'pending')
        ) {
          const aptStart = timeToMinutes(booking.startTime);
          const aptEnd = timeToMinutes(booking.endTime) || aptStart + 30;
          busyBlocks.push({
            start: aptStart,
            end: aptEnd + bufferMinutes,
            isAppointment: true,
          });
        }
      }

      // Sort busy blocks
      busyBlocks.sort((a, b) => a.start - b.start);

      // Check current in_service item
      const inServiceEntry = queueEntries.find(
        (e) => (e.barberId || '').toString() === bId && e.status === 'in_service'
      );

      let earliestAvailable = Math.max(resolvedNow, details.startMinutes);

      if (inServiceEntry) {
        const srvDur = serviceDurationMap.get(inServiceEntry.serviceId) || 30;
        let elapsed = 0;
        if (inServiceEntry.startedAt) {
          const startedDate = new Date(inServiceEntry.startedAt);
          if (!isNaN(startedDate.getTime())) {
            const nowTime = new Date();
            elapsed = Math.max(0, Math.floor((nowTime - startedDate) / 60000));
          }
        }
        const remaining = Math.max(0, srvDur - elapsed);
        earliestAvailable = Math.max(earliestAvailable, resolvedNow + remaining + bufferMinutes);
      }

      barberTimelines.set(bId, {
        barberId: bId,
        barberName: barber.name,
        details,
        busyBlocks,
        earliestAvailable,
        inServiceEntry: inServiceEntry || null,
      });
    }
  }

  // Helper: finds the earliest start time of length D on a given barber's timeline
  function findNextSlotOnBarber(timeline, duration) {
    let candidate = timeline.earliestAvailable;
    const { closeMinutes } = timeline.details;

    while (candidate + duration <= closeMinutes) {
      // Check collision with any busy block (appointments or breaks)
      const conflict = timeline.busyBlocks.find(
        (block) => candidate < block.end && candidate + duration > block.start
      );

      if (!conflict) {
        return candidate;
      }

      // Advance candidate past the conflicting block
      candidate = conflict.end;
    }

    return null; // Cannot be served before barber's closing
  }

  // Helper: schedules a duration on a barber's timeline
  function bookSlotOnBarber(timeline, start, duration) {
    const end = start + duration + bufferMinutes;
    timeline.busyBlocks.push({ start, end });
    timeline.busyBlocks.sort((a, b) => a.start - b.start);
    timeline.earliestAvailable = Math.max(timeline.earliestAvailable, end);
  }

  // Process waiting / called queue entries in order of joinedAt / tokenNumber
  const waitingEntries = queueEntries
    .filter((e) => e.status === 'waiting' || e.status === 'called')
    .sort((a, b) => {
      const aTime = a.joinedAt ? new Date(a.joinedAt).getTime() : a.tokenNumber;
      const bTime = b.joinedAt ? new Date(b.joinedAt).getTime() : b.tokenNumber;
      return aTime - bTime;
    });

  const entryEstimations = new Map();

  for (const entry of waitingEntries) {
    const entryDuration = serviceDurationMap.get(entry.serviceId) || 30;
    const requestedBarber = (entry.barberId || '').toString();

    let chosenBarber = null;
    let chosenStart = null;

    if (requestedBarber && barberTimelines.has(requestedBarber)) {
      const timeline = barberTimelines.get(requestedBarber);
      const start = findNextSlotOnBarber(timeline, entryDuration);
      if (start !== null) {
        chosenBarber = timeline;
        chosenStart = start;
      }
    } else {
      // 'Any' barber: pick whoever can start earliest
      let minStart = Infinity;
      for (const timeline of barberTimelines.values()) {
        const start = findNextSlotOnBarber(timeline, entryDuration);
        if (start !== null && start < minStart) {
          minStart = start;
          chosenBarber = timeline;
          chosenStart = start;
        }
      }
    }

    if (chosenBarber && chosenStart !== null) {
      bookSlotOnBarber(chosenBarber, chosenStart, entryDuration);
      const waitMinutes = Math.max(0, chosenStart - resolvedNow);
      entryEstimations.set(entry._id?.toString() || entry.id, {
        estimatedStartMinutes: chosenStart,
        estimatedStart: minutesToTimeStr(chosenStart),
        estimatedWaitMinutes: waitMinutes,
        assignedBarberId: chosenBarber.barberId,
        assignedBarberName: chosenBarber.barberName,
        canBeServedBeforeClosing: true,
      });
    } else {
      entryEstimations.set(entry._id?.toString() || entry.id, {
        estimatedStartMinutes: null,
        estimatedStart: 'Over capacity',
        estimatedWaitMinutes: 999,
        assignedBarberId: null,
        assignedBarberName: 'None',
        canBeServedBeforeClosing: false,
      });
    }
  }

  // Now estimate for a NEW prospect / prospective walk-in
  let prospectEstimation = {
    estimatedStartMinutes: null,
    estimatedStartTime: null,
    estimatedWaitMinutes: 0,
    assignedBarberId: null,
    assignedBarberName: null,
    canBeServedBeforeClosing: false,
    reason: 'No barbers available today.',
  };

  if (workingBarbers.length === 0) {
    prospectEstimation.reason = 'All barbers are off today or shop is closed.';
  } else {
    let chosenBarber = null;
    let chosenStart = null;
    const reqB = (targetBarberId || '').toString();

    if (reqB && barberTimelines.has(reqB)) {
      const timeline = barberTimelines.get(reqB);
      const start = findNextSlotOnBarber(timeline, targetDuration);
      if (start !== null) {
        chosenBarber = timeline;
        chosenStart = start;
      }
    } else {
      let minStart = Infinity;
      for (const timeline of barberTimelines.values()) {
        const start = findNextSlotOnBarber(timeline, targetDuration);
        if (start !== null && start < minStart) {
          minStart = start;
          chosenBarber = timeline;
          chosenStart = start;
        }
      }
    }

    if (chosenBarber && chosenStart !== null) {
      const waitMinutes = Math.max(0, chosenStart - resolvedNow);
      const latestPermitted = chosenBarber.details.closeMinutes - stopBeforeClosing;

      if (chosenStart + targetDuration > latestPermitted) {
        prospectEstimation = {
          estimatedStartMinutes: chosenStart,
          estimatedStartTime: minutesToTimeStr(chosenStart),
          estimatedWaitMinutes: waitMinutes,
          assignedBarberId: chosenBarber.barberId,
          assignedBarberName: chosenBarber.barberName,
          canBeServedBeforeClosing: false,
          reason: `Cut would finish too close to closing time (${minutesToTimeStr(
            chosenBarber.details.closeMinutes
          )}).`,
        };
      } else {
        prospectEstimation = {
          estimatedStartMinutes: chosenStart,
          estimatedStartTime: minutesToTimeStr(chosenStart),
          estimatedWaitMinutes: waitMinutes,
          assignedBarberId: chosenBarber.barberId,
          assignedBarberName: chosenBarber.barberName,
          canBeServedBeforeClosing: true,
          reason: null,
        };
      }
    } else {
      prospectEstimation = {
        estimatedStartMinutes: null,
        estimatedStartTime: null,
        estimatedWaitMinutes: null,
        assignedBarberId: null,
        assignedBarberName: null,
        canBeServedBeforeClosing: false,
        reason: 'Cut cannot be completed before shop closing time.',
      };
    }
  }

  // Summary counts
  const totalWaiting = waitingEntries.length;
  const inServiceCount = queueEntries.filter((e) => e.status === 'in_service').length;

  return {
    date: resolvedDate,
    currentMinutes: resolvedNow,
    workingBarbersCount: workingBarbers.length,
    totalWaiting,
    inServiceCount,
    entryEstimations,
    prospectEstimation,
  };
}
