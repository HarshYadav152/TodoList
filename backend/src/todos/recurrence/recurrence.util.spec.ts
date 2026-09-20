import { computeNextOccurrence } from './recurrence.util';
import { Recurrence } from '../schemas/todo.schema';

describe('computeNextOccurrence', () => {
  it('advances daily by the given interval', () => {
    const due = new Date('2026-09-10T09:00:00.000Z');
    const rule: Recurrence = { frequency: 'daily', interval: 3 } as Recurrence;

    const next = computeNextOccurrence(due, rule);

    expect(next?.toISOString()).toBe('2026-09-13T09:00:00.000Z');
  });

  it('advances weekly with no daysOfWeek by 7 * interval days', () => {
    const due = new Date('2026-09-10T09:00:00.000Z'); // Thursday
    const rule: Recurrence = { frequency: 'weekly', interval: 2 } as Recurrence;

    const next = computeNextOccurrence(due, rule);

    expect(next?.toISOString()).toBe('2026-09-24T09:00:00.000Z');
  });

  it('finds the next matching weekday within the same week', () => {
    const due = new Date('2026-09-10T09:00:00.000Z'); // Thursday = 4
    const rule: Recurrence = {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 4, 6],
    } as Recurrence; // Mon/Thu/Sat

    const next = computeNextOccurrence(due, rule);

    // Next listed day after Thursday this week is Saturday (+2 days).
    expect(next?.toISOString()).toBe('2026-09-12T09:00:00.000Z');
  });

  it('wraps to the following interval-th week once past all listed weekdays', () => {
    const due = new Date('2026-09-12T09:00:00.000Z'); // Saturday = 6, last day in the set
    const rule: Recurrence = {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 4, 6],
    } as Recurrence;

    const next = computeNextOccurrence(due, rule);

    // Wraps to Monday of the following week.
    expect(next?.toISOString()).toBe('2026-09-14T09:00:00.000Z');
  });

  it('advances monthly, including across year boundaries', () => {
    const due = new Date('2026-12-15T09:00:00.000Z');
    const rule: Recurrence = {
      frequency: 'monthly',
      interval: 2,
    } as Recurrence;

    const next = computeNextOccurrence(due, rule);

    expect(next?.toISOString()).toBe('2027-02-15T09:00:00.000Z');
  });

  it('returns null once the next occurrence would pass endDate', () => {
    const due = new Date('2026-09-10T09:00:00.000Z');
    const rule: Recurrence = {
      frequency: 'daily',
      interval: 5,
      endDate: new Date('2026-09-12T00:00:00.000Z'),
    } as Recurrence;

    const next = computeNextOccurrence(due, rule);

    expect(next).toBeNull();
  });

  it('throws on an unrecognized frequency instead of silently miscalculating', () => {
    const due = new Date('2026-09-10T09:00:00.000Z');
    const rule = { frequency: 'yearly', interval: 1 } as unknown as Recurrence;

    expect(() => computeNextOccurrence(due, rule)).toThrow(
      /Unsupported recurrence frequency/,
    );
  });
});
