import { describe, it, expect } from 'vitest';
import { normalizeFormat, encodePayload, decodePayload } from './codec.ts';

describe('codec module for raw and md formats', () => {
  it('normalizes format names and aliases', () => {
    expect(normalizeFormat('raw')).toBe('raw');
    expect(normalizeFormat('txt')).toBe('raw');
    expect(normalizeFormat('TXT')).toBe('raw');
    expect(normalizeFormat('md')).toBe('md');
    expect(normalizeFormat('MD')).toBe('md');
    expect(normalizeFormat('z')).toBe('z');
    expect(normalizeFormat('unknown')).toBe('md');
  });

  it('encodes and decodes empty strings', async () => {
    expect(await encodePayload('', 'raw')).toBe('');
    expect(await decodePayload('', 'raw')).toBe('');
    expect(await encodePayload('', 'md')).toBe('');
    expect(await decodePayload('', 'md')).toBe('');
  });

  it('roundtrips plain text with raw format', async () => {
    const original = 'Hello World!\nThis is line 2.\nSpecial chars: #, ?, &, =, /, %';
    const encoded = await encodePayload(original, 'raw');
    const decoded = await decodePayload(encoded, 'raw');
    expect(decoded).toBe(original);
  });

  it('roundtrips Markdown text with md format', async () => {
    const original = '# Title\n\n- [ ] Item 1\n- [x] Item 2\n\n```js\nconst x = 42;\n```\n\nСсылка: [Test](https://example.com/foo?bar=baz&qux=1)';
    const encoded = await encodePayload(original, 'md');
    const decoded = await decodePayload(encoded, 'md');
    expect(decoded).toBe(original);
  });

  it('correctly handles Unicode, Cyrillic, and emojis', async () => {
    const original = 'Привет, мир! 🚀 Тест кодировки Markdown: **жирный**, _курсив_.';
    const encoded = await encodePayload(original, 'md');
    const decoded = await decodePayload(encoded, 'md');
    expect(decoded).toBe(original);
  });

  it('handles malformed URI sequences without throwing', async () => {
    const malformed = '%E0%A4%A';
    const result = await decodePayload(malformed, 'raw');
    expect(typeof result).toBe('string');
  });

  it('roundtrips compressed format z', async () => {
    const original = '# Title\n\nContent for compressed format z test with unicode: 🚀';
    const encoded = await encodePayload(original, 'z');
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');

    const decoded = await decodePayload(encoded, 'z');
    expect(decoded).toBe(original);
  });
});
