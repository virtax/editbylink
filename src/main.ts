import './style.css';
import { setupUI } from './ui.ts';
import { parseHash, updateHash, listenToHashChange, DocumentFormat, AppMode } from './router.ts';
import { decodePayload, encodePayload, normalizeFormat } from './codec.ts';
import { getStoredTheme, setStoredTheme, applyTheme, cycleTheme, getThemeIcon, getThemeLabel, ThemeMode } from './theme.ts';
import { renderContent } from './markdown.ts';
import { debounce } from './debounce.ts';
import { createSequenceGuard } from './sequence.ts';
import { formatBytes, calculateStatusMetrics } from './status.ts';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('App root element not found');
}

const ui = setupUI(appRoot);

let currentMode: AppMode = 'edit';
let currentFormat: DocumentFormat = 'md';
let currentTheme: ThemeMode = getStoredTheme();
let isUpdatingFromUrl = false;
const stateGuard = createSequenceGuard();

function updateThemeButton(): void {
  const iconEl = document.querySelector<HTMLSpanElement>('#theme-icon');
  const labelEl = document.querySelector<HTMLSpanElement>('#theme-label');
  if (iconEl) {
    iconEl.textContent = getThemeIcon(currentTheme);
  }
  if (labelEl) {
    labelEl.textContent = getThemeLabel(currentTheme);
  }
}

function initTheme(): void {
  applyTheme(currentTheme);
  updateThemeButton();
}

function updatePreview(text: string): void {
  ui.preview.innerHTML = renderContent(text, currentFormat);
}

let latestPayload = '';

function updateStatusBar(text: string, payload: string = latestPayload): void {
  latestPayload = payload;
  const urlLength = window.location.href.length;
  const metrics = calculateStatusMetrics(text, payload, currentFormat, urlLength);

  ui.charCountEl.textContent = `${metrics.charCount.toLocaleString()} chars`;
  ui.savingsEl.textContent = `${metrics.savingsPercent}% saved`;

  if (metrics.isOverLimit) {
    ui.budgetTextEl.textContent = `URL: ${formatBytes(metrics.urlLength)} / 64 KB`;
    ui.budgetEl.classList.add('status-alert');
  } else {
    ui.budgetTextEl.textContent = `URL: ${formatBytes(metrics.urlLength)} / 64 KB`;
    ui.budgetEl.classList.remove('status-alert');
  }

  ui.budgetFillEl.style.width = `${metrics.budgetPercent}%`;
}

function applyMode(mode: AppMode): void {
  currentMode = mode;
  if (mode === 'view') {
    ui.editorPane.style.display = 'none';
    ui.previewPane.style.display = 'flex';
    ui.viewToggleBtn.innerHTML = '✏️ <span class="btn-text">Edit</span>';
  } else {
    ui.editorPane.style.display = 'flex';
    ui.previewPane.style.display = 'flex';
    ui.viewToggleBtn.innerHTML = '👁️ <span class="btn-text">View</span>';
  }
  updateStatusBar(ui.editor.value, latestPayload);
}

async function syncStateToUrl(): Promise<void> {
  const seq = stateGuard.next();
  const text = ui.editor.value;
  const format = currentFormat;
  const mode = currentMode;
  const payload = await encodePayload(text, format);
  if (!stateGuard.isCurrent(seq)) {
    return;
  }
  updateHash({
    mode,
    format,
    payload
  });
  updateStatusBar(text, payload);
}

const debouncedSyncToUrl = debounce(syncStateToUrl, 250);

async function loadFromRoute(): Promise<void> {
  const seq = stateGuard.next();
  debouncedSyncToUrl.cancel();
  isUpdatingFromUrl = true;
  const state = parseHash(window.location.hash);
  currentMode = state.mode;
  currentFormat = normalizeFormat(state.format);

  ui.formatSelect.value = currentFormat;
  applyMode(currentMode);

  const text = await decodePayload(state.payload, currentFormat);
  if (!stateGuard.isCurrent(seq)) {
    return;
  }
  ui.editor.value = text;
  updatePreview(text);
  updateStatusBar(text, state.payload);
  isUpdatingFromUrl = false;
}

// Event Listeners
ui.editor.addEventListener('input', () => {
  if (isUpdatingFromUrl) return;
  stateGuard.next();
  const text = ui.editor.value;
  updatePreview(text);
  updateStatusBar(text, latestPayload);
  debouncedSyncToUrl();
});

ui.formatSelect.addEventListener('change', async () => {
  debouncedSyncToUrl.cancel();
  currentFormat = normalizeFormat(ui.formatSelect.value);
  updatePreview(ui.editor.value);
  updateStatusBar(ui.editor.value, latestPayload);
  await syncStateToUrl();
});

ui.themeToggleBtn.addEventListener('click', () => {
  currentTheme = cycleTheme(currentTheme);
  setStoredTheme(currentTheme);
  applyTheme(currentTheme);
  updateThemeButton();
});

ui.viewToggleBtn.addEventListener('click', async () => {
  debouncedSyncToUrl.cancel();
  const nextMode: AppMode = currentMode === 'view' ? 'edit' : 'view';
  applyMode(nextMode);
  await syncStateToUrl();
});

ui.exportPdfBtn.addEventListener('click', () => {
  window.print();
});

window.addEventListener('beforeprint', () => {
  const match = ui.editor.value.match(/^#\s+(.+)$/m);
  if (match && match[1]?.trim()) {
    document.title = match[1].trim();
  }
});

window.addEventListener('afterprint', () => {
  document.title = 'EditByLink';
});

ui.copyLinkBtn.addEventListener('click', async () => {
  debouncedSyncToUrl.cancel();
  await syncStateToUrl();
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    const originalText = ui.copyLinkBtn.innerHTML;
    ui.copyLinkBtn.innerHTML = '✅ <span class="btn-text">Copied!</span>';
    setTimeout(() => {
      ui.copyLinkBtn.innerHTML = originalText;
    }, 1800);
  } catch {
    prompt('Copy URL:', url);
  }
});

listenToHashChange(() => {
  loadFromRoute();
});

// Initialize on page load
initTheme();
loadFromRoute();
