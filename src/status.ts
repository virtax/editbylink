import { DocumentFormat } from './router.ts';

export const UNIVERSAL_URL_LIMIT = 65536; // 64 KB ceiling

export interface StatusMetrics {
  charCount: number;
  byteCount: number;
  savingsPercent: number;
  urlLength: number;
  maxUrlLength: number;
  isOverLimit: boolean;
  budgetPercent: number;
}

/**
 * Formats a byte number into a human-readable string (e.g., '120 B', '1.5 KB').
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Calculates real-time document and URL budget metrics for the status bar.
 */
export function calculateStatusMetrics(
  text: string,
  payload: string,
  format: DocumentFormat,
  urlLength: number
): StatusMetrics {
  const charCount = text.length;
  const byteCount = new TextEncoder().encode(text).length;

  let savingsPercent = 0;
  if (format === 'z' && byteCount > 0 && payload.length > 0) {
    const saved = byteCount - payload.length;
    savingsPercent = Math.max(0, Math.round((saved / byteCount) * 100));
  }

  const budgetPercent = Math.min(100, Math.round((urlLength / UNIVERSAL_URL_LIMIT) * 100));
  const isOverLimit = urlLength > UNIVERSAL_URL_LIMIT;

  return {
    charCount,
    byteCount,
    savingsPercent,
    urlLength,
    maxUrlLength: UNIVERSAL_URL_LIMIT,
    isOverLimit,
    budgetPercent
  };
}
