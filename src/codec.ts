import { DocumentFormat } from './router.ts';
import { compressText, decompressText } from './compress.ts';

export interface CodecOptions {
  format: DocumentFormat;
}

/**
 * Normalizes format aliases (e.g., 'txt' -> 'raw').
 */
export function normalizeFormat(format: string): DocumentFormat {
  const lower = format.toLowerCase();
  if (lower === 'txt') {
    return 'raw';
  }
  if (lower === 'raw' || lower === 'md' || lower === 'z') {
    return lower;
  }
  return 'md';
}

/**
 * Encodes text into a URL payload string according to the requested format.
 */
export async function encodePayload(text: string, format: DocumentFormat): Promise<string> {
  const normFormat = normalizeFormat(format);

  switch (normFormat) {
    case 'raw':
    case 'md':
      return encodeURIComponent(text);
    case 'z':
      return compressText(text);
    default:
      return encodeURIComponent(text);
  }
}

/**
 * Decodes a URL payload string into original text according to the format.
 * Recovers safely from malformed URI components or corrupted streams.
 */
export async function decodePayload(payload: string, format: DocumentFormat): Promise<string> {
  if (!payload) {
    return '';
  }

  const normFormat = normalizeFormat(format);

  switch (normFormat) {
    case 'raw':
    case 'md': {
      try {
        return decodeURIComponent(payload);
      } catch {
        // Fallback for malformed percent-encoding
        return unescape(payload);
      }
    }
    case 'z': {
      return decompressText(payload);
    }
    default:
      try {
        return decodeURIComponent(payload);
      } catch {
        return payload;
      }
  }
}
