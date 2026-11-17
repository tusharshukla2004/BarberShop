import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hero } from './Hero';

vi.mock('@/features/booking/AppointmentForm', () => ({
  AppointmentForm: () => <form aria-label="appointment booking form" />,
}));

describe('Hero', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the appointment call to action in place of the photo gallery', () => {
    render(<Hero />);

    expect(
      screen.queryByRole('region', { name: /barbershop photo showcase/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Expert cuts, modern fades/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /book an appointment/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /appointment booking form/i })).toBeInTheDocument();
  });

  it('opens the booking popup after three and a half minutes', () => {
    vi.useFakeTimers();
    render(<Hero />);

    act(() => {
      vi.advanceTimersByTime(3.5 * 60 * 1000);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
