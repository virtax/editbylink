export type AppMode = 'edit' | 'view';
export type DocumentFormat = 'raw' | 'txt' | 'md' | 'z';

export interface RouteState {
  mode: AppMode;
  format: DocumentFormat;
  payload: string;
}

export const KNOWN_FORMATS: ReadonlySet<string> = new Set(['raw', 'txt', 'md', 'z']);

export const DEFAULT_ROUTE_STATE: RouteState = {
  mode: 'edit',
  format: 'md',
  payload: ''
};

/**
 * Parses the URL hash string (with or without leading '#') into a structured RouteState.
 * Expected format: #/{mode}/{format}/{payload}
 */
export function parseHash(hash: string): RouteState {
  const cleanHash = hash.replace(/^#\/?/, '').trim();
  if (!cleanHash) {
    return { ...DEFAULT_ROUTE_STATE };
  }

  const slashIndex = cleanHash.indexOf('/');
  if (slashIndex === -1) {
    const mode = cleanHash.toLowerCase() === 'view' ? 'view' : 'edit';
    return {
      mode,
      format: 'md',
      payload: ''
    };
  }

  const modeStr = cleanHash.substring(0, slashIndex).toLowerCase();
  const mode: AppMode = modeStr === 'view' ? 'view' : 'edit';
  const rest = cleanHash.substring(slashIndex + 1);

  const nextSlashIndex = rest.indexOf('/');
  if (nextSlashIndex === -1) {
    const candidateFormat = rest.toLowerCase();
    if (KNOWN_FORMATS.has(candidateFormat)) {
      return {
        mode,
        format: candidateFormat as DocumentFormat,
        payload: ''
      };
    }
    // If not a known format, treat rest as payload with default format
    return {
      mode,
      format: 'md',
      payload: rest
    };
  }

  const formatStr = rest.substring(0, nextSlashIndex).toLowerCase();
  if (KNOWN_FORMATS.has(formatStr)) {
    return {
      mode,
      format: formatStr as DocumentFormat,
      payload: rest.substring(nextSlashIndex + 1)
    };
  }

  // Fallback: format omitted, whole rest is payload
  return {
    mode,
    format: 'md',
    payload: rest
  };
}

/**
 * Constructs the URL hash string from RouteState.
 */
export function buildHash(state: RouteState): string {
  const mode = state.mode;
  const format = state.format;
  const payload = state.payload;

  if (!payload) {
    return `#/${mode}/${format}`;
  }

  return `#/${mode}/${format}/${payload}`;
}

/**
 * Subscribes to browser hashchange events.
 * Returns an unlisten function.
 */
export function listenToHashChange(callback: (state: RouteState) => void): () => void {
  const handler = () => {
    callback(parseHash(window.location.hash));
  };

  window.addEventListener('hashchange', handler);
  return () => {
    window.removeEventListener('hashchange', handler);
  };
}

/**
 * Updates the current URL hash using history.replaceState or history.pushState.
 */
export function updateHash(state: RouteState, replace: boolean = true): void {
  const newHash = buildHash(state);
  if (window.location.hash === newHash) {
    return;
  }

  if (replace) {
    const newUrl = `${window.location.pathname}${window.location.search}${newHash}`;
    window.history.replaceState(null, '', newUrl);
  } else {
    window.location.hash = newHash;
  }
}
