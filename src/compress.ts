/**
 * Converts a Uint8Array of bytes into a URL-safe Base64 string (base64url).
 * Complies with RFC 4648 §5: replaces '+' with '-', '/' with '_', and omits '=' padding.
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const CHUNK_SIZE = 8192;
  for (let i = 0; i < len; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Converts a URL-safe Base64 string (base64url) back into a Uint8Array of bytes.
 */
export function base64UrlToBytes(base64url: string): Uint8Array<ArrayBuffer> {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compresses a UTF-8 text string using native CompressionStream('deflate-raw')
 * and returns a URL-safe Base64 (base64url) string.
 */
export async function compressText(text: string): Promise<string> {
  if (!text) {
    return '';
  }

  const stream = new Response(text).body!
    .pipeThrough(new CompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return bytesToBase64Url(new Uint8Array(buffer));
}

/**
 * Decompresses a URL-safe Base64 (base64url) string back into the original text
 * using native DecompressionStream('deflate-raw').
 * Safely recovers with an empty string on invalid/corrupted payloads.
 */
export async function decompressText(payload: string): Promise<string> {
  if (!payload) {
    return '';
  }

  try {
    const bytes = base64UrlToBytes(payload);
    const stream = new Response(bytes).body!
      .pipeThrough(new DecompressionStream('deflate-raw'));
    return await new Response(stream).text();
  } catch {
    return '';
  }
}
