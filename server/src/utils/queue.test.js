import { describe, it, expect } from 'vitest';
import { calculateQueueWaitTimes, getBarberWorkingDetails } from './queue.js';
import { timeToMinutes, minutesToTimeStr } from './slots.js';

describe('Queue Logic & Wait Time Estimation Engine (Pure Functions)', () => {
  const mockBarbers = [
    {
      id: 'barb-1',
      name: 'John Smith',
      isActive: true,
      schedule: {
        monday: { start: '09:00 AM', end: '08:30 PM', isOff: false, breaks: [] },
      },
    },
    {
      id: 'barb-2',
      name: 'Michael Brown',
      isActive: true,
      schedule: {
        monday: { start: '09:00 AM', end: '08:30 PM', isOff: false, breaks: [{ start: '01:00 PM', end: '02:00 PM' }] },
      },
    },
  ];

  const mockServices = [
    { id: 'srv-haircut', name: 'Signature Haircut', durationMinutes: 30, price: 650 },
    { id: 'srv-deluxe', name: 'Royal Grooming Package', durationMinutes: 60, price: 1200 },
  ];

  const mockSettings = {
    queueSettings: {
      walkInsEnabled: true,
      maxQueueLength: 20,
      bufferMinutes: 5,
      stopAcceptingBeforeClosingMinutes: 45,
    },
    holidays: [],
  };

  it('calculates 0 wait time when both barbers are free at the start of shift', () => {
    const result = calculateQueueWaitTimes({
      barbers: mockBarbers,
      services: mockServices,
      queueEntries: [],
      confirmedBookings: [],
      settings: mockSettings,
      dateStr: '2026-11-02', // Monday
      currentMinutes: timeToMinutes('10:00 AM'), // 600
      targetDuration: 30,
    });

    expect(result.totalWaiting).toBe(0);
    expect(result.workingBarbersCount).toBe(2);
    expect(result.prospectEstimation.canBeServedBeforeClosing).toBe(true);
    expect(result.prospectEstimation.estimatedWaitMinutes).toBe(0);
    expect(result.prospectEstimation.estimatedStartTime).toBe('10:00 AM');
    expect(result.prospectEstimation.assignedBarberId).toBe('barb-1');
  });

  it('accounts for barber in-service remaining time and picks the earliest free barber', () => {
    // Barb-1 is in-service for 30 min service, started 10 mins ago -> 20 mins remaining + 5 min buffer = 25 mins wait
    // Barb-2 is free -> wait time should be 0 mins on Barb-2!
    const queueEntries = [
      {
        id: 'q-1',
        barberId: 'barb-1',
        serviceId: 'srv-haircut',
        status: 'in_service',
        startedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
    ];

    const result = calculateQueueWaitTimes({
      barbers: mockBarbers,
      services: mockServices,
      queueEntries,
      confirmedBookings: [],
      settings: mockSettings,
      dateStr: '2026-11-02',
      currentMinutes: timeToMinutes('10:00 AM'),
      targetDuration: 30,
    });

    // Since 'any' barber is allowed, Barb-2 is free right now
    expect(result.prospectEstimation.assignedBarberId).toBe('barb-2');
    expect(result.prospectEstimation.estimatedWaitMinutes).toBe(0);

    // If customer specifically requests Barb-1, wait should be 25 mins (20 remaining + 5 buffer)
    const resultBarb1 = calculateQueueWaitTimes({
      barbers: mockBarbers,
      services: mockServices,
      queueEntries,
      confirmedBookings: [],
      settings: mockSettings,
      dateStr: '2026-11-02',
      currentMinutes: timeToMinutes('10:00 AM'),
      targetBarberId: 'barb-1',
      targetDuration: 30,
    });

    expect(resultBarb1.prospectEstimation.assignedBarberId).toBe('barb-1');
    expect(resultBarb1.prospectEstimation.estimatedWaitMinutes).toBe(25);
    expect(resultBarb1.prospectEstimation.estimatedStartTime).toBe('10:25 AM');
  });

  it('respects confirmed bookings: walk-ins never overlap scheduled appointments', () => {
    // Barb-1 has confirmed appointment from 10:15 AM to 10:45 AM
    const confirmedBookings = [
      {
        barberId: 'barb-1',
        status: 'confirmed',
        startTime: '10:15 AM',
        endTime: '10:45 AM',
      },
    ];

    // Only Barb-1 working
    const result = calculateQueueWaitTimes({
      barbers: [mockBarbers[0]],
      services: mockServices,
      queueEntries: [],
      confirmedBookings,
      settings: mockSettings,
      dateStr: '2026-11-02',
      currentMinutes: timeToMinutes('10:00 AM'),
      targetDuration: 30, // 30 mins cannot fit before 10:15 AM!
    });

    // Appointment ends at 10:45 AM + 5 min buffer = 10:50 AM
    expect(result.prospectEstimation.estimatedStartTime).toBe('10:50 AM');
    expect(result.prospectEstimation.estimatedWaitMinutes).toBe(50);
  });

  it('respects barber breaks: walk-ins jump past lunch break', () => {
    // Barb-2 has lunch break from 01:00 PM to 02:00 PM
    const result = calculateQueueWaitTimes({
      barbers: [mockBarbers[1]],
      services: mockServices,
      queueEntries: [],
      confirmedBookings: [],
      settings: mockSettings,
      dateStr: '2026-11-02',
      currentMinutes: timeToMinutes('12:45 PM'), // 15 mins before break
      targetDuration: 30, // 30 mins cannot fit before 01:00 PM break!
    });

    // Should start right after break finishes at 02:00 PM
    expect(result.prospectEstimation.estimatedStartTime).toBe('02:00 PM');
    expect(result.prospectEstimation.estimatedWaitMinutes).toBe(75); // from 12:45 PM to 02:00 PM = 75 mins
  });

  it('flags entries that cannot be served before closing time', () => {
    // Closing time is 08:30 PM (1230 mins). Stop accepting is 45 mins before (07:45 PM = 1185 mins).
    const result = calculateQueueWaitTimes({
      barbers: [mockBarbers[0]],
      services: mockServices,
      queueEntries: [],
      confirmedBookings: [],
      settings: mockSettings,
      dateStr: '2026-11-02',
      currentMinutes: timeToMinutes('08:00 PM'), // 1200 mins
      targetDuration: 45,
    });

    expect(result.prospectEstimation.canBeServedBeforeClosing).toBe(false);
    expect(result.prospectEstimation.reason).toContain('closing time');
  });
});
