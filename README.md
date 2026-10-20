# EditByLink

> Zero-backend, privacy-first Markdown and plain text editor stored entirely inside URL hash fragments with native client-side PDF export.

[![Tests](https://img.shields.io/badge/tests-29%20passed-brightgreen.svg)]()
[![Bundle Size](https://img.shields.io/badge/bundle%20size-15%20KB%20gzip-blue.svg)]()
[![Zero Backend](https://img.shields.io/badge/backend-zero%20server-orange.svg)]()

---

## ✨ Highlights

- **100% Client-Side & Privacy-First**: Document contents reside purely within the URL hash fragment (`#`) in your browser. No server storage, no database, zero CDN leakages.
- **Ultra-Lightweight & Fast**: Built with Vanilla TypeScript and Vite. No heavy UI frameworks. Instant startup and < 15 KB gzipped bundle.
- **Responsive Split-Screen Workspace**: Side-by-side raw text editor and live preview pane on desktop; adaptive stacked layout on mobile.
- **Dedicated View Mode**: Instant toggle between split editing and distraction-free, read-only document presentation (`#/view/...`).
- **Strict XSS Protection**: Markdown rendered via `marked` with strict HTML tag escaping by default.
- **Smart Throttled Sync**: 250ms debounced `window.history.replaceState()` sync preventing WebKit/Safari rate-limit quotas (max 100 calls / 30s).
- **Auto Light/Dark Theming**: Adapts automatically to system preferences (`prefers-color-scheme`) with one-click manual cycle (`Auto 🌓` -> `Light ☀️` -> `Dark 🌙`).
- **High-Fidelity PDF Export**: Native browser print pipeline preserving crisp vector fonts, text selection, and clickable hyperlinks (Phase 2).

---

## 🔗 URL Hash Schema

All state is serialized into the URL hash to avoid HTTP `414 Request-URI Too Long` errors on static web servers:

```text
#/{mode}/{format}/{payload}
```

- **`mode`**:
  - `edit`: Split-screen editor + live preview pane.
  - `view`: Distraction-free document view.
- **`format`**:
  - `md`: Standard uncompressed Markdown (`encodeURIComponent`).
  - `raw` (or `txt`): Plain uncompressed text.
  - `z`: Deflate-raw compressed binary payload encoded in URL-safe Base64 (`base64url`) *(Phase 1)*.
- **`payload`**: The encoded document payload.

### Examples

- `#/edit/md/%23%20Hello%20World` — Edit standard Markdown document.
- `#/view/md/%23%20Hello%20World` — View Markdown document in read-only mode.
- `#/edit/raw/Plain%20Text%20Notes` — Edit plain text document.

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/qualitica/editbylink.git
cd editbylink
npm install
```

### Development Server

Start the local dev server at `http://localhost:3000`:

```bash
npm run dev
```

### Run Tests

Execute the unit test suite with Vitest:

```bash
npm test
```

### Production Build

Type-check and build optimized static assets into `dist/`:

```bash
npm run build
```

The resulting `dist/` folder can be hosted directly on GitHub Pages, Cloudflare Pages, AWS S3, or any static file host.

---

## 📁 Project Structure

```text
editbylink/
├── doc/
│   ├── architecture.md    # In-depth architectural design & technical decisions
│   └── roadmap.md         # Phase-by-phase implementation roadmap
├── src/
│   ├── app.test.ts        # Baseline environment tests
│   ├── codec.ts           # Format normalization and payload encode/decode
│   ├── codec.test.ts      # Codec test suite
│   ├── debounce.ts        # Debounced execution utility (flush/cancel)
│   ├── debounce.test.ts   # Debounce test suite
│   ├── main.ts            # Application bootstrap and state coordination
│   ├── markdown.ts        # Markdown parser with strict HTML escaping
│   ├── markdown.test.ts   # Markdown parser and XSS security tests
│   ├── router.ts          # URL hash parser, builder, and listener
│   ├── router.test.ts     # URL hash routing test suite
│   ├── style.css          # Design system, CSS variables, dark/light themes
│   ├── theme.ts           # Theme management (auto/light/dark)
│   ├── theme.test.ts      # Theme logic test suite
│   ├── ui.ts              # Semantic DOM layout and controls
│   └── ui.test.ts         # DOM layout structure tests
├── index.html             # HTML entrypoint
├── package.json           # Scripts and dependencies
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite bundler configuration
```

---

## 📖 Documentation

- [Architecture Guide](file:///Users/virtax/work/qualitica/editbylink/doc/architecture.md) — Detailed technical specs, engine URL limits, and compression architecture.
- [Project Roadmap](file:///Users/virtax/work/qualitica/editbylink/doc/roadmap.md) — Progress tracker covering Phase 0 through Phase 4.

---

## 📄 License

MIT

Copyright (c) 2026 Dmytro Partsyrnyi (@virtax).
