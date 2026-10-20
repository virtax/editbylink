# Architecture: EditByLink

## 1. Overview & Philosophy
`EditByLink` is a 100% client-side, zero-backend, privacy-first web application for editing and sharing Markdown and plain text documents encoded directly within the URL hash fragment, with native client-side PDF export.

### Guiding Principles
- **Zero Backend**: Statically hostable on GitHub Pages, Cloudflare Pages, S3, or any static file server.
- **Privacy & Security**: Document contents reside purely on the client inside the URL hash (`#`) and are never transmitted to server access logs or upstream CDNs.
- **Zero Framework Overhead**: Built with lightweight Vanilla TypeScript/JavaScript and Vite for instant load times (Time to Interactive < 100ms) and minimal bundle size (< 25 KB total).
- **High-Fidelity PDF Output**: Leverages native browser print pipelines (`window.print()` + CSS Paged Media `@page`) for crisp vector fonts and clickable links without heavy canvas rasterizers.

---

## 2. URL Schema & State Architecture

### 2.1 URL Hash Structure
All state is stored within the URL hash to avoid HTTP `414 Request-URI Too Long` errors on static web servers:

```
#/{mode}/{format}/{payload}
```

- **`mode`**:
  - `edit`: Split-screen workspace (raw text editor on the left, live preview on the right, status bar at bottom).
  - `view`: Distraction-free, read-only formatted document preview.
- **`format`**:
  - `raw` (or `txt`): Plain uncompressed text (`encodeURIComponent`).
  - `md`: Plain uncompressed Markdown.
  - `z`: Compressed binary payload using standard `deflate-raw` encoded in URL-safe Base64 (`base64url`).
- **`payload`**: The encoded document payload.

**Examples:**
- `#/edit/raw/Hello%20World`
- `#/view/z/S0vMTVWyUkpKLFKyUkrLz1cqVspNLEnNVwIA`

### 2.2 Routing & History Management
- State transitions are recorded using `window.history.replaceState()`.
- **Throttling & Debounce**: WebKit (Safari iOS/macOS) enforces an uncatchable security quota: maximum 100 `replaceState` calls per 30-second sliding window. Keystrokes are debounced by 250ms to ensure fast typing never triggers this limitation.
- **Monotonic Version Counter**: Prevents race conditions with asynchronous compression streams overwriting newer editor states.

---

## 3. Data Pipeline & Compression

```mermaid
flowchart LR
    A[Editor Input] -->|Debounce 250ms| B[Version Check]
    B --> C{Format Selected}
    C -->|raw / md| D[encodeURIComponent]
    C -->|z (compressed)| E[CompressionStream 'deflate-raw']
    E --> F[Uint8Array to base64url]
    D --> G[history.replaceState]
    F --> G
    G --> H[Update Status Bar]
```

### 3.1 Compression Stream Implementation
- Uses native browser `CompressionStream('deflate-raw')` and `DecompressionStream('deflate-raw')` (supported in Chrome 80+, Safari 16.4+, Firefox 113+).
- Binary chunks are converted to `base64url` (replacing `+` with `-`, `/` with `_`, and omitting `=` padding characters).
- Instant fallback to `encodeURIComponent` if the browser does not support Streams API.

---

## 4. Markdown Rendering & Security (XSS Defense)

- **Engine**: Minimalist `marked` parser (~10 KB).
- **Strict HTML Disallowance**: Raw HTML tags are disallowed in MVP to eliminate cross-site scripting (XSS) vectors.
- **Implementation**: The parser overrides the `html` renderer token:
  ```ts
  marked.use({
    renderer: {
      html(html) {
        return escapeHtml(html);
      }
    }
  });
  ```
- **Images**: External image URLs (`![alt](https://...)`) and inline data URIs (`data:image/...`) are rendered if they fit inside browser limits.

---

## 5. Status Bar & Browser URL Limits

A dedicated status bar at the bottom provides real-time character count and URL budget indicators across the major browser rendering engines:

| Engine | Primary Browsers | Practical URL Length Limit |
| :--- | :--- | :--- |
| **Blink** | Google Chrome, Microsoft Edge, Brave, Opera | **32,767 chars** (~32 KB) |
| **WebKit** | Apple Safari (macOS & iOS) | **65,536 chars** (~64 KB) |
| **Gecko** | Mozilla Firefox | **65,536 chars** (~64 KB) |
| **Safe HTTP** | Proxies, legacy tools, referral specs | **2,048 chars** (~2 KB) |

**UI Threshold Alert:**
- When the current URL length surpasses an engine's limit, the corresponding badge in the status bar turns red with an alert icon, warning the user that links may be truncated when opened in that engine.

---

## 6. PDF Export Architecture

- **Technology**: Native browser print subsystem invoked via `window.print()`.
- **CSS Paged Media**:
  ```css
  @page {
    size: var(--page-size, A4 portrait);
    margin: 15mm 20mm 15mm 20mm;
  }

  @media print {
    body { background: #fff; }
    .editor-pane, .status-bar, .toolbar { display: none !important; }
    .preview-pane { display: block !important; width: 100% !important; }
    h1, h2, h3 { break-after: avoid; }
    pre, blockquote, table, img { break-inside: avoid; }
  }
  ```
- **Page Format Selector**: Allows switching between `A4` and `US Letter` via CSS class toggling prior to printing.
- **Benefits**: 0 KB external bundle size, preserves crisp vector fonts, text selection, and hyperlinks in exported PDFs.

---

## 7. Component Layout & UI Structure

- **Split-Screen Editor**:
  - `Header Toolbar`: Format selector (`raw` / `md` / `z`), page size picker (`A4` / `Letter`), Copy Link button, View Mode toggle, Export PDF button.
  - `Main Workspace`: CSS grid or flexbox split pane (left: auto-growing `<textarea>`, right: sanitized `#preview`).
  - `Status Bar`: Document byte size, compression ratio %, and Blink / WebKit / Gecko engine limit indicators.
