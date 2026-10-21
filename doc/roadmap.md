# Roadmap: EditByLink

## Phase 0: Core Foundation & MVP
- [x] 0.1 Initialize project with **Vite + Vanilla TypeScript** and zero runtime frameworks.
- [x] 0.2 Implement URL hash parser and router (`#/edit/...` and `#/view/...`).
- [x] 0.3 Support uncompressed plain text (`raw`) and uncompressed Markdown (`md`) formats.
- [x] 0.4 Build responsive split-screen UI (side-by-side Editor & Preview panes).
- [x] 0.5 Add support for Light theme, Auto by default.
- [x] 0.6 Integrate `marked` parser with strict HTML escaping (`renderer.html`).
- [x] 0.7 Debounced input sync (`250ms`) via `window.history.replaceState()`.

## Phase 1: Compression & Engine Budget Indicators
- [x] 1.1 Implement `CompressionStream('deflate-raw')` and `DecompressionStream` pipeline with `base64url` serialization.
- [x] 1.2 Race-condition protection using a monotonic sequence/version counter.
- [x] 1.3 Add format switcher (`raw` text, standard `md`, compressed `z`).
- [x] 1.4 Build bottom status bar:
  - Document character and byte counters.
  - Compression savings ratio (%).
  - Active URL budget gauge with universal browser limit (~64 KB).
  - Dynamic red alert state when exceeding the 64 KB threshold.

## Phase 2: Native PDF Export & Dedicated View Mode
- [x] 2.1 Create `@media print` print-optimized styling:
  - Isolate preview pane; hide editor, toolbar, and status bar.
  - Page break protection rules (`break-after: avoid` for headers, `break-inside: avoid` for code, tables, images).
- [x] 2.2 Client-side "Export to PDF" trigger calling `window.print()`.
- [ ] 2.3 Page format selector (`A4` vs `US Letter`) with dynamic `@page { size: ... }` application.
- [ ] 2.4 Standalone View Mode (`#/view/...`):
  - Clean, distraction-free reading layout.
  - Quick action to jump into Edit Mode (`#/edit/...`).

## Phase 3: Polish, Edge Cases & Testing
- [ ] 3.1 Implement quick "Copy Shareable Link" with interactive feedback (toast/badge).
- [ ] 3.2 Test Safari/WebKit rate-limiting resilience under aggressive typing simulations.
- [ ] 3.3 External and inline data image verification (`![alt](...)`).
- [ ] 3.4 Unit tests for compression, decompressor fallback, and URL hash serialization (`npm test`).

## Phase 4: Future Considerations (Backlog)
- [ ] 4.1 Code block syntax highlighting via lightweight highlighter (e.g., PrismJS or lowlight).
- [ ] 4.2 LaTeX / Math formula support via KaTeX.
- [ ] 4.3 Reading time and word count metrics in status bar.
- [ ] 4.4 Dark / Light / Sepia theme selector for preview and PDF export.
