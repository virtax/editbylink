import { describe, it, expect } from 'vitest';
import { createSequenceGuard } from './sequence.ts';

describe('sequence guard utility', () => {
  it('increments sequence numbers monotonically', () => {
    const guard = createSequenceGuard();
    const seq1 = guard.next();
    const seq2 = guard.next();
    const seq3 = guard.next();

    expect(seq1).toBe(1);
    expect(seq2).toBe(2);
    expect(seq3).toBe(3);
  });

  it('correctly validates current sequence number', () => {
    const guard = createSequenceGuard();
    const seq1 = guard.next();
    expect(guard.isCurrent(seq1)).toBe(true);

    const seq2 = guard.next();
    expect(guard.isCurrent(seq1)).toBe(false);
    expect(guard.isCurrent(seq2)).toBe(true);
  });

  it('discards stale out-of-order asynchronous completions', async () => {
    const guard = createSequenceGuard();
    const results: string[] = [];

    // Simulate async operation 1 (takes longer)
    const runOp1 = async () => {
      const seq = guard.next();
      await new Promise((r) => setTimeout(r, 50));
      if (!guard.isCurrent(seq)) return;
      results.push('op1');
    };

    // Simulate async operation 2 (finishes quicker)
    const runOp2 = async () => {
      const seq = guard.next();
      await new Promise((r) => setTimeout(r, 10));
      if (!guard.isCurrent(seq)) return;
      results.push('op2');
    };

    const p1 = runOp1();
    const p2 = runOp2();

    await Promise.all([p1, p2]);

    // Only op2 should have committed; op1 was superseded
    expect(results).toEqual(['op2']);
  });

  it('invalidates pending sequence when next() is called', () => {
    const guard = createSequenceGuard();
    const seq = guard.next();
    expect(guard.isCurrent(seq)).toBe(true);

    guard.next();
    expect(guard.isCurrent(seq)).toBe(false);
  });
});
