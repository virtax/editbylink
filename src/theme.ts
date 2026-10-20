export type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'ebl_theme';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved;
    }
  } catch {
    // In case localStorage is blocked or unavailable
  }
  return 'auto';
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // In case localStorage is blocked or unavailable
  }
}

export function getEffectiveTheme(mode: ThemeMode, systemPrefersDark: boolean): 'light' | 'dark' {
  if (mode === 'auto') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return mode;
}

export function cycleTheme(current: ThemeMode): ThemeMode {
  switch (current) {
    case 'auto':
      return 'light';
    case 'light':
      return 'dark';
    case 'dark':
      return 'auto';
    default:
      return 'auto';
  }
}

export function getThemeIcon(theme: ThemeMode): string {
  switch (theme) {
    case 'light':
      return '☀️';
    case 'dark':
      return '🌙';
    case 'auto':
    default:
      return '🌓';
  }
}

export function getThemeLabel(theme: ThemeMode): string {
  switch (theme) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'auto':
    default:
      return 'Auto';
  }
}

export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
