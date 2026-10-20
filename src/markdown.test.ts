import { describe, it, expect } from 'vitest';
import { renderContent, escapeHtml } from './markdown.ts';

describe('markdown rendering and XSS protection', () => {
  it('escapes special HTML characters', () => {
    expect(escapeHtml('<script>alert("xss") & \'foo\'</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;) &amp; &#39;foo&#39;&lt;/script&gt;'
    );
  });

  it('renders standard Markdown elements', () => {
    const md = '# Header 1\n\nParagraph with **bold** and *italic*.';
    const html = renderContent(md, 'md');
    expect(html).toContain('<h1>Header 1</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('renders GFM tables and task lists', () => {
    const md = `
| A | B |
|---|---|
| 1 | 2 |

- [x] Done task
- [ ] Todo task
`;
    const html = renderContent(md, 'md');
    expect(html).toContain('<table>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('type="checkbox"');
  });

  it('strictly escapes raw HTML injection to prevent XSS', () => {
    const malicious = '<script>alert("hack")</script>\n<img src="x" onerror="alert(1)">\n<b onmouseover="evil()">test</b>';
    const html = renderContent(malicious, 'md');
    // All raw tags must be escaped so browser never executes them as HTML
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img');
    expect(html).toContain('&lt;b');
  });

  it('renders raw format wrapped in pre code blocks', () => {
    const rawText = 'Line 1\n<tag>Line 2</tag>';
    const html = renderContent(rawText, 'raw');
    expect(html).toBe('<pre><code>Line 1\n&lt;tag&gt;Line 2&lt;/tag&gt;</code></pre>');
  });
});
