# Repair handoff — ready for release

Date: 2026-08-28 UTC
Work order: `local-file-triage-repair-1`
Base verifier report: `734e3fc9e8c67e7e70a5e05ba291513bd54c946d`
Core repair commit: `8352ad9c871013135fbfe71325821454166dd3ae`; this handoff also records the follow-up CSP console correction.

## What changed

- Added the required claim registry, demo documentation, and copy audit. Every
  listed claim has one `@claim:` regression command.
- Added a first-screen **Try it with sample data** action and `/demo`. It loads
  five realistic routes immediately, displays a persistent demo banner, supports
  reset/start-for-real, and uses IndexedDB key `demo:latest`, separate from the
  real `latest` record.
- New proposals are unchecked. Bulk actions now name and affect only the rows
  currently rendered. Approval, bucket, and filename edits are serialized to
  IndexedDB so a reload preserves the latest review.
- Imported manifests with no plan rows keep their receipt and JSON/CSV exports
  visible. A safely blocked undo remains retryable after the original-path
  blocker is removed; retry still never overwrites an original file.
- Added live activity announcements, 44 px mobile approval targets, three-step
  how-it-works copy, canonical/social metadata, product 404, response-policy and
  immutable-cache deployment configuration, build ID, and an ESLint gate.

## Verification evidence

Run from a clean dependency install:

```sh
npm ci
npm run lint
npm test
```

- Unit/integration: 6/6 Vitest tests passed, including default-unapproved and
  blocked-undo retry filesystem coverage.
- Browser: 22/22 Playwright tests pass across Desktop Chrome and Pixel 5 (390 px
  class). They cover the demo boundary/reset, default approval, exact 101-row
  bulk scope, reload persistence, imported receipt exports, keyboard operation,
  axe WCAG A/AA serious/critical = 0, touch targets, privacy requests, and
  offline reload after service-worker installation.
- Production build: `dist/` generated. Initial JS is 31.24 kB raw / 11.48 kB
  gzip; CSS is 15.94 kB raw / 4.44 kB gzip; the mobile hero WebP is 32 kB.
- Local mobile Lighthouse run: performance 98, accessibility 100, LCP 1.74 s,
  CLS 0. The CLI emitted its result JSON before a post-audit browser-tab crash;
  the scored report is at `/tmp/triagebox-lighthouse.json` in this worker.
- Privacy: the claim test intercepts the full demo review flow and observed no
  third-party request. Optional license traffic remains the disclosed Sociobot
  exception and is not triggered by demo use.
- Live post-deploy identity: the public HTML SHA-256 exactly matched `dist`, and
  `/demo` referenced the same built JS. Manifest MIME, CSP, frame and permissions
  headers were present; an unknown route returned the designed HTTP 404. The
  initial live CSP check exposed the former inline fallback as a console error;
  it is now an external same-origin asset and is included in the final deploy.

## Deploy

Static deployment remains the original artifact class. Deploy `dist/` with the
included `staticwebapp.config.json`; it carries CSP, frame, permissions,
referrer, MIME, 404, and immutable asset-cache policy. `/demo` rewrites to the
same app shell and unknown server routes receive the product 404 response.

## Known limits

- Writable moves still require desktop Chromium File System Access API. Mobile
  and other browsers retain read-only preview and plan export.
- Browser filesystem APIs cannot restore a copied file’s modified timestamp;
  receipts record it instead.
- `.factory/brief.json` was absent at the verifier base commit, so no brief file
  was changed during this repair.
