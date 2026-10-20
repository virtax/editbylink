export interface AppUI {
  container: HTMLElement;
  editor: HTMLTextAreaElement;
  preview: HTMLDivElement;
  formatSelect: HTMLSelectElement;
  viewToggleBtn: HTMLButtonElement;
  themeToggleBtn: HTMLButtonElement;
  copyLinkBtn: HTMLButtonElement;
  statusBar: HTMLElement;
  editorPane: HTMLElement;
  previewPane: HTMLElement;
}

export function getLayoutHTML(): string {
  return `
    <header class="app-header">
      <div class="brand">
        <span class="brand-logo">🔗</span>
        <span class="brand-name">EditByLink</span>
      </div>
      <div class="toolbar-actions">
        <label class="toolbar-item" for="format-select">
          <span class="toolbar-label">Format:</span>
          <select id="format-select" class="select-input">
            <option value="md">Markdown (md)</option>
            <option value="raw">Plain Text (raw)</option>
          </select>
        </label>
        <button id="btn-theme-toggle" class="btn btn-secondary" title="Switch Theme (Auto / Light / Dark)">
          <span id="theme-icon">🌓</span> <span class="btn-text" id="theme-label">Auto</span>
        </button>
        <button id="btn-view-toggle" class="btn btn-secondary" title="Toggle between Edit and View modes">
          👁️ <span class="btn-text">View Mode</span>
        </button>
        <button id="btn-copy-link" class="btn btn-primary" title="Copy shareable link">
          📋 <span class="btn-text">Copy Link</span>
        </button>
      </div>
    </header>

    <main class="split-container" id="split-container">
      <section class="pane pane-editor" id="pane-editor">
        <div class="pane-header">
          <span class="pane-title">Editor</span>
        </div>
        <textarea
          id="editor-input"
          class="editor-textarea"
          spellcheck="false"
          placeholder="Type or paste your Markdown here..."
        ></textarea>
      </section>

      <section class="pane pane-preview" id="pane-preview">
        <div class="pane-header">
          <span class="pane-title">Preview</span>
        </div>
        <div id="preview-content" class="preview-body"></div>
      </section>
    </main>

    <footer class="status-bar" id="status-bar">
      <div class="status-left">
        <span id="status-char-count">0 chars</span>
      </div>
      <div class="status-right">
        <span class="status-mode" id="status-mode">Mode: Edit</span>
      </div>
    </footer>
  `;
}

export function setupUI(root: HTMLElement): AppUI {
  root.innerHTML = getLayoutHTML();

  return {
    container: root,
    editor: root.querySelector('#editor-input') as HTMLTextAreaElement,
    preview: root.querySelector('#preview-content') as HTMLDivElement,
    formatSelect: root.querySelector('#format-select') as HTMLSelectElement,
    viewToggleBtn: root.querySelector('#btn-view-toggle') as HTMLButtonElement,
    themeToggleBtn: root.querySelector('#btn-theme-toggle') as HTMLButtonElement,
    copyLinkBtn: root.querySelector('#btn-copy-link') as HTMLButtonElement,
    statusBar: root.querySelector('#status-bar') as HTMLElement,
    editorPane: root.querySelector('#pane-editor') as HTMLElement,
    previewPane: root.querySelector('#pane-preview') as HTMLElement
  };
}
