import { computeReorderedValue, ORDER_GAP } from './compute-order.util';

describe('computeReorderedValue', () => {
  it('returns the midpoint when dropped between two todos', () => {
    expect(computeReorderedValue(1000, 2000)).toBe(1500);
  });

  it('handles a midpoint that is not a round number', () => {
    expect(computeReorderedValue(1000, 1001)).toBe(1000.5);
  });

  it('adds a gap above prevOrder when dropped at the end of the list', () => {
    expect(computeReorderedValue(3000, null)).toBe(3000 + ORDER_GAP);
  });

  it('subtracts a gap below nextOrder when dropped at the start of the list', () => {
    expect(computeReorderedValue(null, 500)).toBe(500 - ORDER_GAP);
  });

  it('falls back to a timestamp when the list has no other items', () => {
    const before = Date.now();
    const result = computeReorderedValue(null, null);
    const after = Date.now();

    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });
});
