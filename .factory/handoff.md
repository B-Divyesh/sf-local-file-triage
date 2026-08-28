# Triagebox polish handoff — round 1

Date: 2026-08-28 UTC

Work order: `local-file-triage-polish-1`.

## Delivered

- Resolved all 30 findings in [`review-1.md`](review-1.md); the finding-to-change
  evidence table is [`polish-1.md`](polish-1.md).
- Added nine missing observable claims and tests. The registry now covers demo
  isolation, real-file locality, browser fallbacks, storage boundaries, runtime
  requests, free/Pro limit presentation, checkout origin, permission timing,
  original timestamps, and recursive inventory.
- Rewrote first-screen and README copy in plain words. The catalog description is
  verb-first and 62 characters.
- Added complete demo/legal/404 metadata, route focus and live announcements,
  external-link labels, a 180px touch icon, and commit-derived footer build ID.
- Preserved the field-paper topographic visual identity and static PWA deployment
  class. The service worker precaches the new icon.

## Run and verify

```bash
npm ci
npm test
npm run build
npm run preview
```

Local evidence before handoff:

- `npm test`: PASS — 8 unit tests, build to `dist/`, 40 Playwright desktop/mobile
  tests, including axe WCAG A/AA, offline reload, keyboard/focus, metadata, and
  privacy request logging.
- Bundle: JavaScript 32.46 kB raw / 11.72 kB gzip; CSS 15.94 kB raw / 4.44 kB
  gzip. Both are inside the static-product budget.
- Screenshots: `evidence/home-390.png`, `evidence/demo-390.png`, and
  `evidence/not-found-desktop.png`.
- Claim commands: each command in `claims.json` is run separately from a fresh
  clone after this commit; results and deployment evidence are appended below.

## Demo

Open `/demo` or `/?demo=1`. The sample has five realistic file records and is
stored only under IndexedDB key `demo:latest`; real work uses `latest`. The
banner supplies **Reset demo** and **Start for real**. See [`demo.md`](demo.md).

## Known gaps

None. Deployment and cold-live verification are the final work-order steps.
