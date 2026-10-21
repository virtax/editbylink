export interface SequenceGuard {
  next: () => number;
  isCurrent: (seq: number) => boolean;
}

/**
 * Creates a monotonic sequence guard to protect against asynchronous race conditions.
 * Each call to `next()` increments the sequence counter.
 * Asynchronous operations verify `isCurrent(seq)` before applying changes, discarding stale results.
 */
export function createSequenceGuard(): SequenceGuard {
  let counter = 0;

  return {
    next: () => ++counter,
    isCurrent: (seq: number) => seq === counter
  };
}
