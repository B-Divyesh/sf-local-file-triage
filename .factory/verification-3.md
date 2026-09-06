# Verification 3 — Triagebox

Date: 2026-09-06 UTC  
Work order: `local-file-triage-verify-3`  
Live URL: <https://local-file-triage.sociobot.in>  
Implementation reviewed: `23f9d6b2ee5b474752da3da27f9f470600531758`  
Documentation/evidence reviewed: `f3c8d7ff81c12ca13e03ff6c32d473361d699604`

## Verdict: PASS

**Finding count: 0. Untested public-claim count: 0.**

The supplied deployment-wrapper/build failure is not reproduced. The live
JavaScript and CSS hashes match a clean build of the implementation candidate.
The commit after it changes only handoff and evidence files, not product code.

## What the fresh first screen says

Fresh desktop (1440×900) and Pixel 5 (393×727 CSS px) browsers, both at
`scrollY=0`, state:

- Job: “Organize a folder. Review every move.”
- Audience: “For people cleaning a messy folder…”
- First action: **Try it with sample data**. Its adjacent explanation says it
  loads five proposed destinations and saves nothing.

The same first screen shows the three required facts: files stay in this
browser, the app works offline after its first visit, and the free 100-move / $19
Pro price. The phone image shows all of that before scrolling. Fresh visual and
URL-verifier evidence is in `evidence/verify3-home/` and
`evidence/verify3-demo/`.

## Demo, data boundary, and recovery

The one-click action and direct `/demo` loaded five realistic proposed file
moves, including `IMG_4821.jpg`, with the persistent label “Demo — sample data,
nothing is saved”, **Reset demo**, and **Start for real**. The first sample row
was visible before scrolling on the short Pixel 5 viewport.

After approving `IMG_4821.jpg`, **Reset demo** restored zero approvals, the
`Photos` destination, and the message “Demo reset. The five sample destinations
are back.” The declared sandbox test separately seeds `PRIVATE-tax-record.pdf`
in the real IndexedDB key, enters and leaves the demo, and proves that the real
record remains while the demo record is discarded. No real folder was selected
for this demonstration. Browser request logging found no external request while
using the normal or sample product flow.

Normal, boundary, invalid, and recovery paths are covered by the passing tests:
unchecked default approvals; the 101st hidden row; persisted edits; imported
receipt export; collision-safe undo retry; malformed/mismatched plan entries;
file capability fallback; free 100-file limit and fixture Pro removal; route
history; offline reload; reset; and the designed unknown route. `/does-not-exist`
is a deliberate, styled HTTP 404 and is not a finding.

## Clean checkout and claims

Fresh clone: `/tmp/triagebox-verify3-gDcyen`, at
`f3c8d7ff81c12ca13e03ff6c32d473361d699604`.

```text
npm ci       PASS — 158 packages installed; npm audit reported 0 vulnerabilities
npm test     PASS — 10 unit tests; build wrote dist/; copy audit; 54 browser tests
```

Every exact command declared in `.factory/claims.json` was run from that clone
and passed. Browser claim commands ran in both desktop Chromium and Pixel 5
projects.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `approval-required` | PASS |
| `displayed-bulk-controls` | PASS |
| `review-persistence` | PASS |
| `imported-receipt-export` | PASS |
| `undo-retry` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `deterministic-routes` | PASS |
| `reversible-move` | PASS |
| `receipt-csv` | PASS |
| `receipt-json` | PASS |
| `real-file-locality` | PASS |
| `browser-capabilities` | PASS |
| `storage-boundary` | PASS |
| `no-tracking-runtime` | PASS |
| `installable` | PASS |
| `free-limit` | PASS |
| `checkout-origin` | PASS |
| `permission-on-action` | PASS |
| `receipt-original-timestamp` | PASS |
| `recursive-inventory` | PASS |
| `plan-import` | PASS |

## Live checks

```text
TRIAGEBOX_TEST_BASE_URL=https://local-file-triage.sociobot.in npm run test:e2e
PASS — 54/54
```

The live checks include normal and mobile interaction, keyboard focus,
route-title/focus announcements, touch target sizing, offline reload, update
notice behavior, PWA manifest/service worker, privacy request logging, plan
import, receipt download, legal routes, and serious/critical axe results on
`/`, `/demo`, `/privacy/`, `/terms/`, and the 404. The Playwright axe integration
reported no serious or critical violations in either browser project.

`/opt/fleet/lib/verify-url.sh` also passed against `/` and `/demo`: both had a
title, `lang="en"`, one `h1`, a `main` landmark, alt text on all images, labeled
buttons, and no console errors. Its measured load times were 1050 ms and 859 ms.
The standalone axe CLI could not locate a system Chrome binary in this worker;
the project’s pinned Playwright axe integration above is the permitted
alternative and completed successfully.

Live status results: `/`, `/demo`, `/privacy/`, `/terms/`, `/robots.txt`,
`/sitemap.xml`, `/manifest.webmanifest`, and `/sw.js` returned 200;
`/does-not-exist` returned 404. The 404 has the same header, skip link, main,
footer, legal links, and return action as the app. Response headers on all HTML
routes include CSP with response-header `frame-ancestors 'none'`, `nosniff`,
strict referrer policy, frame denial, and a restrictive permissions policy.
Reduced motion removes transitions and transforms. This static PWA has no
product backend, tenant endpoint, health endpoint, process persistence, or
product-owned rate limit; backend-only checks do not apply.

The candidate build contains 39.35 kB raw / 13.31 kB gzip JavaScript and
18.39 kB raw / 4.89 kB gzip CSS. Live `main-LzeQOxW1.js` and
`style-DbwTP0bv.css` SHA-256 values matched the clean build exactly.

## Earlier findings disposition

All earlier findings are currently resolved and retested:

| Earlier group | Current disposition |
| --- | --- |
| F-1-1–F-1-9 | PASS — explicit privacy, capability, storage, billing, permission, timestamp, and recursive-inventory claims passed. |
| F-1-10–F-1-16 | PASS — route metadata, shared 404 shell, focused/announced navigation, external-link naming, touch icon, and version/build checks passed. |
| F-1-17–F-1-30 | PASS — generated copy audit passed; current landing, demo, legal, and README copy use the documented terms and plain wording. |
| F-2-1, F-2-2, F-2-3, F-2-4 | PASS — first-install notice does not obscure facts; JSON receipt and installation claims are tested; the exact generated copy audit passed. |
| F-3-1–F-3-16 | PASS — demo opens directly into populated work; short-phone facts and first row are visible; plan import, keyboard rerender focus, shared navigation, legal pages, and terminology checks passed. |
| RB-01–RB-05 | PASS — unchecked starts, displayed-row scope, saved review edits, imported receipt export, and retryable collision-safe undo all passed their regressions. |
| V1 and FINAL-MOBILE | PASS — claims, demo isolation, live-region behavior, 44 px touch targets, headers, cache/manifest, routing, three steps, and unobstructed mobile controls passed. |

## Scope notes

`.factory/brief.json` remains absent; this verification used the researched
brief supplied with the work order. No product code, deployment configuration,
backend, database, billing setup, or other product was changed during this
verification.
