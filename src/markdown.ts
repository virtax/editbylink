import { Marked } from 'marked';
import { DocumentFormat } from './router.ts';

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const markedInstance = new Marked({
  gfm: true,
  breaks: true
});

// Strictly escape all raw HTML elements to prevent XSS
markedInstance.use({
  renderer: {
    html({ text }: { text: string }): string {
      return escapeHtml(text);
    }
  }
});

/**
 * Parses and renders markdown or plain text to sanitized HTML.
 */
export function renderContent(content: string, format: DocumentFormat = 'md'): string {
  if (format === 'raw' || format === 'txt') {
    return `<pre><code>${escapeHtml(content)}</code></pre>`;
  }
  return markedInstance.parse(content) as string;
}
