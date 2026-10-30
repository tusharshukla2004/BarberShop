import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTimeStr,
  calculateSlots,
  getKolkataCurrentDateAndMinutes,
} from '../src/utils/slots.js';

describe('Slots Utility', () => {
  describe('timeToMinutes & minutesToTimeStr', () => {
    it('converts 12-hour AM/PM formats accurately', () => {
      expect(timeToMinutes('09:00 AM')).toBe(540);
      expect(timeToMinutes('12:00 PM')).toBe(720);
      expect(timeToMinutes('12:00 AM')).toBe(0);
      expect(timeToMinutes('02:30 PM')).toBe(870);
      expect(timeToMinutes('08:30 PM')).toBe(1230);
    });

    it('converts 24-hour formats accurately', () => {
      expect(timeToMinutes('09:00')).toBe(540);
      expect(timeToMinutes('20:30')).toBe(1230);
    });

    it('formats minutes back to 12-hour string', () => {
      expect(minutesToTimeStr(540)).toBe('09:00 AM');
      expect(minutesToTimeStr(720)).toBe('12:00 PM');
      expect(minutesToTimeStr(870)).toBe('02:30 PM');
      expect(minutesToTimeStr(1230)).toBe('08:30 PM');
    });
  });

  describe('calculateSlots edge cases', () => {
    const mockBarber = {
      id: 'barb-1',
      isActive: true,
      workingHours: [
        { day: 'Monday', start: '09:00', end: '13:00', isWorking: true },
        { day: 'Tuesday', start: '09:00', end: '13:00', isWorking: false }, // Day off
      ],
      leaveDays: ['2026-11-09'],
    };

    const mockService = {
      id: 'srv-1',
      durationMinutes: 45,
    };

    const mockSettings = {
      slotLengthMinutes: 30,
      holidays: ['2026-12-25'],
    };

    it('returns empty array when shop is closed for a holiday', () => {
      const slots = calculateSlots({
        date: '2026-12-25',
        barber: mockBarber,
        service: mockService,
        settings: mockSettings,
      });

      expect(slots).toEqual([]);
    });

    it('returns empty array when barber is inactive', () => {
      const slots = calculateSlots({
        date: '2026-11-02', // Monday
        barber: { ...mockBarber, isActive: false },
        service: mockService,
        settings: mockSettings,
      });

      expect(slots).toEqual([]);
    });

    it('returns empty array when barber is on leave for the requested date', () => {
      const slots = calculateSlots({
        date: '2026-11-09',
        barber: mockBarber,
        service: mockService,
        settings: mockSettings,
      });

      expect(slots).toEqual([]);
    });

    it('returns empty array when requested date falls on barber non-working day', () => {
      // 2026-11-03 is Tuesday (isWorking: false)
      const slots = calculateSlots({
        date: '2026-11-03',
        barber: mockBarber,
        service: mockService,
        settings: mockSettings,
      });

      expect(slots).toEqual([]);
    });

    it('generates correct slot intervals for standard shift', () => {
      // 2026-11-02 is Monday. Shift: 09:00 - 13:00 (240 min).
      // Slot intervals: 30 min, service duration: 45 min.
      // 09:00 - 09:45
      // 09:30 - 10:15
      // 10:00 - 10:45
      // 10:30 - 11:15
      // 11:00 - 11:45
      // 11:30 - 12:15
      // 12:00 - 12:45
      // 12:30 -> ends at 13:15, exceeds 13:00 -> excluded!
      const slots = calculateSlots({
        date: '2026-11-02',
        barber: mockBarber,
        service: mockService,
        settings: mockSettings,
        now: new Date('2026-10-01T00:00:00Z'),
      });

      expect(slots.length).toBe(7);
      expect(slots[0]).toEqual({
        startTime: '09:00 AM',
        endTime: '09:45 AM',
        isAvailable: true,
      });
      expect(slots[slots.length - 1]).toEqual({
        startTime: '12:00 PM',
        endTime: '12:45 PM',
        isAvailable: true,
      });
    });

    it('marks conflicting slots as unavailable when active booking exists', () => {
      const existingBookings = [
        {
          barberId: 'barb-1',
          date: '2026-11-02',
          startTime: '10:00 AM',
          endTime: '10:45 AM',
          status: 'confirmed',
        },
      ];

      const slots = calculateSlots({
        date: '2026-11-02',
        barber: mockBarber,
        service: mockService,
        existingBookings,
        settings: mockSettings,
        now: new Date('2026-10-01T00:00:00Z'),
      });

      // 09:30 - 10:15 overlaps with 10:00 - 10:45
      // 10:00 - 10:45 overlaps
      // 10:30 - 11:15 overlaps
      const slot930 = slots.find((s) => s.startTime === '09:30 AM');
      const slot1000 = slots.find((s) => s.startTime === '10:00 AM');
      const slot1030 = slots.find((s) => s.startTime === '10:30 AM');
      const slot1100 = slots.find((s) => s.startTime === '11:00 AM');

      expect(slot930?.isAvailable).toBe(false);
      expect(slot1000?.isAvailable).toBe(false);
      expect(slot1030?.isAvailable).toBe(false);
      expect(slot1100?.isAvailable).toBe(true);
    });

    it('filters out past slots for the current date in Asia/Kolkata', () => {
      const now = new Date('2026-11-02T05:30:00Z'); // 11:00 AM IST
      const { todayDate } = getKolkataCurrentDateAndMinutes(now);

      const slots = calculateSlots({
        date: todayDate,
        barber: mockBarber,
        service: mockService,
        settings: mockSettings,
        now,
      });

      // Since current time is 11:00 AM IST, slots at or before 11:00 AM must be filtered out
      const startTimes = slots.map((s) => s.startTime);
      expect(startTimes).not.toContain('09:00 AM');
      expect(startTimes).not.toContain('09:30 AM');
      expect(startTimes).not.toContain('10:00 AM');
      expect(startTimes).not.toContain('10:30 AM');
      expect(startTimes).not.toContain('11:00 AM');
      expect(startTimes).toContain('11:30 AM');
      expect(startTimes).toContain('12:00 PM');
    });
  });
});
