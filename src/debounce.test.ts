import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce.ts';

describe('debounce utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays execution by specified duration', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 250);

    debounced();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(249);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('resets timer on consecutive calls', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 250);

    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels scheduled invocation', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 250);

    debounced();
    debounced.cancel();

    vi.advanceTimersByTime(300);
    expect(callback).not.toHaveBeenCalled();
  });

  it('flushes pending invocation immediately', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 250);

    debounced('arg1');
    expect(callback).not.toHaveBeenCalled();

    debounced.flush();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1');

    // Timer shouldn't fire again
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
