import { describe, it, expect } from 'vitest';
import { parseHash, buildHash } from './router.ts';

describe('router hash parsing and building', () => {
  it('handles empty or missing hashes gracefully with defaults', () => {
    expect(parseHash('')).toEqual({ mode: 'edit', format: 'md', payload: '' });
    expect(parseHash('#')).toEqual({ mode: 'edit', format: 'md', payload: '' });
    expect(parseHash('#/')).toEqual({ mode: 'edit', format: 'md', payload: '' });
  });

  it('parses single mode without format or payload', () => {
    expect(parseHash('#/edit')).toEqual({ mode: 'edit', format: 'md', payload: '' });
    expect(parseHash('#/view')).toEqual({ mode: 'view', format: 'md', payload: '' });
  });

  it('parses mode and known format without payload', () => {
    expect(parseHash('#/edit/raw')).toEqual({ mode: 'edit', format: 'raw', payload: '' });
    expect(parseHash('#/view/txt')).toEqual({ mode: 'view', format: 'txt', payload: '' });
    expect(parseHash('#/view/z')).toEqual({ mode: 'view', format: 'z', payload: '' });
  });

  it('parses mode, format, and payload properly', () => {
    expect(parseHash('#/edit/raw/Hello%20World')).toEqual({
      mode: 'edit',
      format: 'raw',
      payload: 'Hello%20World'
    });
    expect(parseHash('#/view/md/SampleText')).toEqual({
      mode: 'view',
      format: 'md',
      payload: 'SampleText'
    });
  });

  it('preserves slashes inside the payload', () => {
    expect(parseHash('#/edit/md/https://example.com/page/1')).toEqual({
      mode: 'edit',
      format: 'md',
      payload: 'https://example.com/page/1'
    });
  });

  it('falls back if format is not known and treats rest as payload', () => {
    expect(parseHash('#/edit/customPayloadWithoutFormat')).toEqual({
      mode: 'edit',
      format: 'md',
      payload: 'customPayloadWithoutFormat'
    });
  });

  it('builds hashes correctly', () => {
    expect(buildHash({ mode: 'edit', format: 'md', payload: '' })).toBe('#/edit/md');
    expect(buildHash({ mode: 'view', format: 'raw', payload: 'test' })).toBe('#/view/raw/test');
    expect(buildHash({ mode: 'edit', format: 'z', payload: 'comp123' })).toBe('#/edit/z/comp123');
  });
});
