import { describe, it, expect } from 'vitest';
import {
  compressText,
  decompressText,
  bytesToBase64Url,
  base64UrlToBytes
} from './compress.ts';

describe('compression module (deflate-raw + base64url)', () => {
  it('converts bytes to base64url and back with exact fidelity', () => {
    const original = new Uint8Array([0, 1, 2, 250, 251, 255, 62, 63, 64]);
    const b64url = bytesToBase64Url(original);

    // URL-safe characters only
    expect(b64url).not.toContain('+');
    expect(b64url).not.toContain('/');
    expect(b64url).not.toContain('=');

    const recovered = base64UrlToBytes(b64url);
    expect(recovered).toEqual(original);
  });

  it('handles empty input', async () => {
    expect(await compressText('')).toBe('');
    expect(await decompressText('')).toBe('');
  });

  it('roundtrips short ASCII text', async () => {
    const text = 'Hello, EditByLink!';
    const compressed = await compressText(text);
    expect(typeof compressed).toBe('string');
    expect(compressed.length).toBeGreaterThan(0);

    const decompressed = await decompressText(compressed);
    expect(decompressed).toBe(text);
  });

  it('roundtrips Markdown with Cyrillic, emojis, and code blocks', async () => {
    const markdown = `# Привіт, світ! 🚀

Це документ із розміткою Markdown для тесту стиснення:
- [x] Завдання 1
- [ ] Завдання 2

typescript
function test(): string { 
return "успіх";
}
\`\`\`
`;
    const compressed = await compressText(markdown);
    expect(compressed).not.toContain('+');
    expect(compressed).not.toContain('/');
    expect(compressed).not.toContain('=');

    const decompressed = await decompressText(compressed);
    expect(decompressed).toBe(markdown);
  });

  it('compresses repetitive Markdown significantly', async () => {
    const repetitive = '# Header\n'.repeat(50) + 'Some repeating paragraphs of content.\n'.repeat(50);
    const compressed = await compressText(repetitive);
    const decompressed = await decompressText(compressed);

    expect(decompressed).toBe(repetitive);
    // Compression should reduce length significantly compared to URL-encoded raw text
    const rawUrlLength = encodeURIComponent(repetitive).length;
    expect(compressed.length).toBeLessThan(rawUrlLength * 0.2);
  });

  it('safely handles corrupted or invalid payloads without throwing', async () => {
    const corruptedBase64 = '!!!not-a-valid-base64-string@@@';
    const result1 = await decompressText(corruptedBase64);
    expect(result1).toBe('');

    const invalidDeflate = bytesToBase64Url(new Uint8Array([1, 2, 3, 4, 5]));
    const result2 = await decompressText(invalidDeflate);
    expect(result2).toBe('');
  });
});
