import { describe, it, expect } from 'vitest';
import { formatBytes, calculateStatusMetrics, UNIVERSAL_URL_LIMIT } from './status.ts';

describe('status metrics utility', () => {
  describe('formatBytes', () => {
    it('formats values under 1024 as bytes (B)', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1023)).toBe('1023 B');
    });

    it('formats values >= 1024 as kilobytes (KB) with 1 decimal place', () => {
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(65536)).toBe('64.0 KB');
    });
  });

  describe('calculateStatusMetrics', () => {
    it('computes character and UTF-8 byte counts correctly', () => {
      const text = 'Hello мир 🚀'; // 12 chars, UTF-8 multi-byte
      const metrics = calculateStatusMetrics(text, '', 'md', 50);

      expect(metrics.charCount).toBe(12);
      expect(metrics.byteCount).toBeGreaterThan(12);
      expect(metrics.savingsPercent).toBe(0);
      expect(metrics.isOverLimit).toBe(false);
    });

    it('calculates compression savings percentage for format z', () => {
      const text = 'A'.repeat(500);
      const fakeCompressedPayload = 'B'.repeat(150); // 70% savings
      const metrics = calculateStatusMetrics(text, fakeCompressedPayload, 'z', 200);

      expect(metrics.byteCount).toBe(500);
      expect(metrics.savingsPercent).toBe(70);
    });

    it('returns 0% savings for uncompressed formats', () => {
      const text = 'Sample document content';
      const metricsMd = calculateStatusMetrics(text, 'payload', 'md', 100);
      const metricsRaw = calculateStatusMetrics(text, 'payload', 'raw', 100);

      expect(metricsMd.savingsPercent).toBe(0);
      expect(metricsRaw.savingsPercent).toBe(0);
    });

    it('tracks URL budget percentage up to 100%', () => {
      const halfwayUrl = UNIVERSAL_URL_LIMIT / 2;
      const metrics = calculateStatusMetrics('text', '', 'md', halfwayUrl);

      expect(metrics.budgetPercent).toBe(50);
      expect(metrics.isOverLimit).toBe(false);
    });

    it('triggers red alert flag when URL exceeds 64 KB limit', () => {
      const overLimitUrl = UNIVERSAL_URL_LIMIT + 1;
      const metrics = calculateStatusMetrics('text', '', 'md', overLimitUrl);

      expect(metrics.isOverLimit).toBe(true);
      expect(metrics.budgetPercent).toBe(100);
    });
  });
});
