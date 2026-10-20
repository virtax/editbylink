import { describe, it, expect } from 'vitest';
import { cycleTheme, getEffectiveTheme, getThemeIcon, getThemeLabel, ThemeMode } from './theme.ts';

describe('theme module', () => {
  it('cycles theme through auto -> light -> dark -> auto', () => {
    expect(cycleTheme('auto')).toBe('light');
    expect(cycleTheme('light')).toBe('dark');
    expect(cycleTheme('dark')).toBe('auto');
  });

  it('determines effective theme accurately for auto and manual modes', () => {
    // When auto, follows system preference
    expect(getEffectiveTheme('auto', true)).toBe('dark');
    expect(getEffectiveTheme('auto', false)).toBe('light');

    // When explicitly light or dark, ignores system preference
    expect(getEffectiveTheme('light', true)).toBe('light');
    expect(getEffectiveTheme('light', false)).toBe('light');
    expect(getEffectiveTheme('dark', true)).toBe('dark');
    expect(getEffectiveTheme('dark', false)).toBe('dark');
  });

  it('provides matching icons and labels for each theme mode', () => {
    expect(getThemeIcon('auto')).toBe('🌓');
    expect(getThemeLabel('auto')).toBe('Auto');

    expect(getThemeIcon('light')).toBe('☀️');
    expect(getThemeLabel('light')).toBe('Light');

    expect(getThemeIcon('dark')).toBe('🌙');
    expect(getThemeLabel('dark')).toBe('Dark');
  });
});
