import { Recurrence } from '../schemas/todo.schema';

/**
 * Pure function: given the due date of the occurrence that was just
 * completed and its recurrence rule, return the due date of the next
 * occurrence, or null if the series has ended.
 *
 * Kept dependency-free and side-effect-free on purpose so it can be unit
 * tested without touching Mongo, and so the "what counts as the next
 * occurrence" rule lives in exactly one place.
 */
export function computeNextOccurrence(
  currentDueDate: Date,
  recurrence: Recurrence,
): Date | null {
  const next = new Date(currentDueDate.getTime());

  switch (recurrence.frequency) {
    case 'daily':
      next.setDate(next.getDate() + recurrence.interval);
      break;

    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        next.setDate(
          next.getDate() +
            nextWeekdayOffset(
              next.getDay(),
              recurrence.daysOfWeek,
              recurrence.interval,
            ),
        );
      } else {
        next.setDate(next.getDate() + 7 * recurrence.interval);
      }
      break;

    case 'monthly':
      next.setMonth(next.getMonth() + recurrence.interval);
      break;

    default:
      // Exhaustiveness guard: if a new frequency is ever added to the schema
      // without updating this switch, fail loudly instead of silently
      // returning a wrong date.
      throw new Error(
        `Unsupported recurrence frequency: ${recurrence.frequency as string}`,
      );
  }

  if (
    recurrence.endDate &&
    next.getTime() > new Date(recurrence.endDate).getTime()
  ) {
    return null;
  }

  return next;
}

/**
 * Given today's weekday (0=Sun..6=Sat) and a sorted-or-unsorted set of target
 * weekdays, return how many days until the next one lands, wrapping to the
 * following interval-th week once we've passed every listed day this week.
 */
function nextWeekdayOffset(
  currentDay: number,
  daysOfWeek: number[],
  interval: number,
): number {
  const sorted = [...new Set(daysOfWeek)].sort((a, b) => a - b);
  const upcoming = sorted.find((d) => d > currentDay);

  if (upcoming !== undefined) {
    return upcoming - currentDay;
  }

  // Wrapped past the last target day this week — jump to the first target
  // day, (interval) weeks out.
  const daysUntilEndOfWeek = 7 - currentDay;
  return daysUntilEndOfWeek + sorted[0] + 7 * (interval - 1);
}
