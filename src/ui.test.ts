import { describe, it, expect } from 'vitest';
import { getLayoutHTML } from './ui.ts';

describe('UI layout structure', () => {
  it('generates layout with all required IDs', () => {
    const html = getLayoutHTML();
    expect(html).toContain('id="editor-input"');
    expect(html).toContain('id="preview-content"');
    expect(html).toContain('id="format-select"');
    expect(html).toContain('id="btn-theme-toggle"');
    expect(html).toContain('id="btn-view-toggle"');
    expect(html).toContain('id="btn-copy-link"');
    expect(html).toContain('id="status-bar"');
  });

  it('includes split-container with both editor and preview sections', () => {
    const html = getLayoutHTML();
    expect(html).toContain('class="split-container"');
    expect(html).toContain('id="pane-editor"');
    expect(html).toContain('id="pane-preview"');
  });

  it('provides format options for md and raw', () => {
    const html = getLayoutHTML();
    expect(html).toContain('value="md"');
    expect(html).toContain('value="raw"');
  });
});
