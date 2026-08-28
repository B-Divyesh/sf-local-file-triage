# Triagebox v1 handoff

Date: 2026-08-28  
Work order: `local-file-triage-build-1`  
Deploy class: static PWA, output `dist/`

## What shipped

- A complete local folder survey using the File System Access API, with a
  read-only `webkitdirectory` fallback for browsers without writable handles.
- Deterministic, explainable type/year routing into
  `Triagebox/<bucket>/<year>/<filename>` for photos, video, audio, documents,
  archives, code, and other files.
- A review ledger with per-row approval, category and filename revision, filter,
  pagination for large surveys, bulk visible-row controls, and clear empty/error/
  permission states.
- A conservative move transaction: choose an unused collision-safe name, copy
  bytes, verify byte size, remove the source only after verification, and remove
  the new copy again if source removal fails.
- Portable JSON and CSV receipts plus same-session undo and JSON receipt-import
  undo. Undo recreates the original directory tree and refuses to overwrite an
  existing original path.
- IndexedDB persistence for the last plan/receipt. File handles are intentionally
  not persisted; the user must explicitly select a folder again after refresh.
- $19 one-time Pro unlock through the Sociobot checkout/verify contract. Returned
  licenses use `sb_license:local-file-triage`; verification is cached for no more
  than one day and never blocks the free first paint. Free includes all safety,
  review, export, and undo features plus 100 moves per run.
- Installable offline PWA with 192/512 icons, versioned shell caching, runtime
  asset caching, update notice, cached routes, and a resilient inline offline
  fallback.
- Dedicated `/privacy/` and `/terms/` pages; no analytics, CDN fonts, third-party
  runtime scripts, or file-data network calls.
- Product-specific topographic cartography system in `.factory/design.md` and an
  original generated map illustration with prompt provenance. Responsive WebP is
  29 KB on mobile and 68 KB at 800 px; JPEG fallback is 96 KB.

## How to run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

`npm test` passes:

- 5 Vitest checks covering categorization, safe naming, plan/CSV output, and an
  in-memory copy → verify → collision rename → source removal → undo round trip.
- 8 Playwright checks across desktop Chromium and a 390 px-class mobile profile.
  These cover the working example survey, editable rows, one-h1/landmarks/legal
  routes, no console errors, no horizontal overflow, axe WCAG A/AA checks, and
  explicit `context.setOffline(true)` reload behavior.

`npm run build` produces `dist/index.html`, `dist/privacy/index.html`, and
`dist/terms/index.html`. Production payloads are 29.6 KB JavaScript and 15.0 KB
CSS uncompressed, both comfortably inside the 200/50 KB budgets. `npm audit`
reports zero vulnerabilities.

Lighthouse 12.8.2, mobile defaults against the production preview:

| Category / metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1.7 s |
| FCP | 0.9 s |
| Total blocking time | 0 ms |
| CLS | 0 |

The axe Playwright integration found no serious or critical WCAG A/AA issues in
either desktop or mobile treatment. Visual review was completed at 1440×1000 and
390×844 in the light treatment. Dark colors and reduced-motion behavior are
provided through media queries.

## Known constraints and honest deviations

- Browser file APIs do not expose a way to set the filesystem `lastModified`
  timestamp on a newly copied file. The brief asks to preserve timestamps; this
  is technically impossible in a static PWA. Triagebox records each original
  timestamp in JSON/CSV and explains the limitation before use, in the terms, and
  in every manifest.
- Writable moves require current desktop Chromium (Chrome/Edge). Safari, Firefox,
  and mobile get a real read-only inventory/edit/export workflow, not a fake move.
- An operating-system folder picker cannot be driven by Playwright. The actual
  transaction and undo code is exercised end to end with in-memory File System
  Access-compatible handles; final browser QA should additionally move and undo a
  disposable backed-up folder on the deployment domain.
- The billing product is registered by the factory later. Code uses only the
  slug-based production Sociobot endpoint and contains no provider/product secret.

## Recommended next steps

1. Run the volunteer-folder acceptance study from the brief (10 folders with at
   least 1,000 files) and measure approval/revision and full-undo rates.
2. After factory billing registration, perform a live checkout/return/restore/
   revocation smoke test on the deployment domain.
3. Consider an optional native wrapper only if timestamp preservation becomes a
   hard requirement; do not imply the PWA can provide it.
