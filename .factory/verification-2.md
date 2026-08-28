# Independent verification 2 — PASS

Date: 2026-08-28 UTC
Work order: `local-file-triage-verify-2`
Candidate: `4376a151d06acf672d56cb6ebfd345689ef4ef3c`
Live URL: <https://local-file-triage.sociobot.in>

## Verdict

**PASS — candidate is acceptable for release.** The live deployment matches the
candidate byte-for-byte for checked shell assets and has no console or page
errors. `.factory/brief.json` is absent, so I used the brief included in the
work order.

## Claims gate — PASS

Following `npm ci` and the exact production build, every command from
`.factory/claims.json` passed against the demo entry point. The five browser
claims each passed in desktop Chromium and Pixel 5/mobile; the three unit
commands passed.

| Claim | Result |
| --- | --- |
| demo-sandbox; approval-required; displayed-bulk-controls; review-persistence; imported-receipt-export; local-only; offline-reload | PASS (each exact declared command) |
| undo-retry; deterministic-routes; reversible-move; receipt-csv | PASS (each exact declared command) |

`vite preview` needs `dist/`, so the build is the necessary test-server
prerequisite; the documented `npm test` sequence does this automatically.

## First read and demo — PASS

Cold desktop and 390 px mobile sessions plainly state the job (“Survey the
folder. Approve every move.”), audience (“people cleaning a messy folder”), and
first click (**Try it with sample data** / “See five routes. Nothing is saved.”).
The action is within the first viewport (desktop top 644/900 px; mobile top
504/844 px). `/demo` immediately loaded five realistic routes and showed the
persistent demo banner, Reset demo, and Start for real. A real IndexedDB record
seeded with `PRIVATE-tax-record.pdf` remained invisible to demo (`demo:latest`).

## Clean checks and performance — PASS

```text
npm ci        PASS — 159 packages audited, 0 vulnerabilities
npm run lint  PASS
npm run build PASS — dist/ created
npm test      PASS — 6/6 Vitest, 22/22 Playwright (41.8 s)
```

Initial JS is 31.24 kB raw / 11.48 kB gzip; CSS is 15.94 kB raw / 4.44 kB gzip;
mobile hero WebP is 32 kB. Mobile Lighthouse: performance 96, accessibility
100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.5 s, CLS 0. Lighthouse wrote
its JSON before its isolated browser tab crashed while closing.

## Functional, accessibility, privacy, and PWA evidence — PASS

- A live browser filesystem mock scanned a file, required explicit approval,
  copied and size-verified it, collision-renamed it to `notes (2).txt`, removed
  the source, then undid the run and restored the original bytes.
- A 1,000-file preview finished in 57 ms, rendered 100 rows plus pagination,
  and had no errors. Claim coverage separately checks the 101st-row boundary,
  persistence, invalid-name handling, receipt recovery, and undo retry.
- Keyboard Enter/Space operation, a 3 px focus outline, and reduced motion
  (`0.00001s`) were confirmed. Axe 4.10.2 on live desktop `/` and mobile
  `/demo` returned zero serious/critical WCAG A/AA findings.
- A full live demo request trace (load, approval, edit, invalid-name recovery,
  reset) contained only same-origin assets. No analytics/CDN traffic, console,
  or page errors occurred.
- Active worker `/sw.js`, cache `triagebox-shell-v3`, controlled the page; demo
  reloaded offline with title, h1, and all five rows. The worker has versioned
  precache cleanup, `skipWaiting`, `clients.claim`, and update notification.
- Live headers include CSP, frame/nosniff/referrer/permissions policy; hashed
  assets are immutable for one year; manifest MIME is correct; unknown routes
  return HTTP 404. `index.html`, JS, CSS, worker, manifest, and boot fallback
  SHA-256 values match local `dist/`.
- No sign-in exists, so Entra is not applicable. Invalid license verification
  requests 1–30 returned 200; 31–40 returned 429 with `Retry-After: 4`.
  Observed allowance: 30 requests per test window.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

Transient evidence: `/tmp/triagebox-claims/`, `/tmp/triagebox-e2e-full.log`,
`/tmp/triagebox-lighthouse.json`, and `/tmp/triagebox-live-cold-desktop.png`.
