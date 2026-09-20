const ORDER_GAP = 1000;

/**
 * Pure function: given the order values of the todo that should end up
 * immediately before/after the moved item (either may be absent for a
 * drop at the very top/bottom of the list), return the order value the
 * moved item should take.
 *
 * Kept separate from TodosService so the arithmetic can be unit tested
 * without touching Mongo.
 */
export function computeReorderedValue(
  prevOrder: number | null,
  nextOrder: number | null,
): number {
  if (prevOrder !== null && nextOrder !== null) {
    return (prevOrder + nextOrder) / 2;
  }
  if (prevOrder !== null) {
    return prevOrder + ORDER_GAP;
  }
  if (nextOrder !== null) {
    return nextOrder - ORDER_GAP;
  }
  return Date.now();
}

export { ORDER_GAP };
