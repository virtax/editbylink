import './style.css';
import { setupUI } from './ui.ts';
import { parseHash, updateHash, listenToHashChange, DocumentFormat, AppMode } from './router.ts';
import { decodePayload, encodePayload, normalizeFormat } from './codec.ts';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('App root element not found');
}

const ui = setupUI(appRoot);

let currentMode: AppMode = 'edit';
let currentFormat: DocumentFormat = 'md';
let isUpdatingFromUrl = false;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function updatePreview(text: string): void {
  // Simple preliminary formatting: preserved whitespace & escaped HTML
  // Marked parser integration with full GFM will follow in 0.5
  ui.preview.innerHTML = `<pre><code>${escapeHtml(text)}</code></pre>`;
}

function updateStatusBar(text: string): void {
  const charCountEl = document.querySelector<HTMLSpanElement>('#status-char-count');
  const modeEl = document.querySelector<HTMLSpanElement>('#status-mode');
  if (charCountEl) {
    charCountEl.textContent = `${text.length} chars`;
  }
  if (modeEl) {
    modeEl.textContent = `Mode: ${currentMode === 'view' ? 'View' : 'Edit'}`;
  }
}

function applyMode(mode: AppMode): void {
  currentMode = mode;
  if (mode === 'view') {
    ui.editorPane.style.display = 'none';
    ui.previewPane.style.display = 'flex';
    ui.viewToggleBtn.innerHTML = '✏️ <span class="btn-text">Edit Mode</span>';
  } else {
    ui.editorPane.style.display = 'flex';
    ui.previewPane.style.display = 'flex';
    ui.viewToggleBtn.innerHTML = '👁️ <span class="btn-text">View Mode</span>';
  }
  updateStatusBar(ui.editor.value);
}

async function syncStateToUrl(): Promise<void> {
  const text = ui.editor.value;
  const payload = await encodePayload(text, currentFormat);
  updateHash({
    mode: currentMode,
    format: currentFormat,
    payload
  });
}

async function loadFromRoute(): Promise<void> {
  isUpdatingFromUrl = true;
  const state = parseHash(window.location.hash);
  currentMode = state.mode;
  currentFormat = normalizeFormat(state.format);

  ui.formatSelect.value = currentFormat === 'raw' ? 'raw' : 'md';
  applyMode(currentMode);

  const text = await decodePayload(state.payload, currentFormat);
  ui.editor.value = text;
  updatePreview(text);
  updateStatusBar(text);
  isUpdatingFromUrl = false;
}

// Event Listeners
ui.editor.addEventListener('input', () => {
  if (isUpdatingFromUrl) return;
  const text = ui.editor.value;
  updatePreview(text);
  updateStatusBar(text);
});

ui.formatSelect.addEventListener('change', async () => {
  currentFormat = normalizeFormat(ui.formatSelect.value);
  await syncStateToUrl();
});

ui.viewToggleBtn.addEventListener('click', async () => {
  const nextMode: AppMode = currentMode === 'view' ? 'edit' : 'view';
  applyMode(nextMode);
  await syncStateToUrl();
});

ui.copyLinkBtn.addEventListener('click', async () => {
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
loadFromRoute();
