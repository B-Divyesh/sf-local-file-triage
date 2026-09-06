# Review local folder moves — Triagebox review 6

Date: 2026-09-06 UTC
Work order: `local-file-triage-review-6`
Live URL: <https://local-file-triage.sociobot.in>
Implementation candidate reviewed: `23f9d6b2ee5b474752da3da27f9f470600531758`
Documentation/evidence commit reviewed: `ef176dd130d2759e464d3edc1766780c6d57dbad`

## Verdict: PASS

**Finding count: 0. Untested public-claim count: 0.**

The current documentation commit differs from the implementation candidate only
in reports and captured evidence. A clean local build and the live deployment
use identical `main-LzeQOxW1.js` and `style-DbwTP0bv.css` SHA-256 values.

## Job, audience, and first action before scrolling

Fresh, storage-free Chromium sessions were opened at `scrollY=0` on a 1440×900
desktop and a Playwright Pixel 5 (393×727 CSS px). Both plainly state:

| Check | Observed text | Result |
| --- | --- | --- |
| Job | “Organize a folder. Review every move.” | PASS |
| Audience | “For people cleaning a messy folder, Triagebox shows where each file will go before it moves.” | PASS |
| First action | **Try it with sample data**; it says five proposed destinations will load and nothing is saved. | PASS |

The three first-screen facts were visible on both sizes: files stay in this
browser, the app works offline after the first visit, and free runs allow 100
moves while Pro costs $19 once. On Pixel 5 the action occupied y=400.1–478.5
and all facts ended at y=654, inside the 727 px viewport. There was one `h1`,
a `main` landmark, the expected title, no horizontal overflow, and no console
errors.

## Demo, isolation, reset, and recovery

One click from the home screen opened `/?demo=1` without a real folder request.
The demo immediately contained five realistic proposed moves, including
`IMG_4821.jpg`, and retained the label **“Demo — sample data, nothing is
saved”** with **Reset demo** and **Start for real**. On the 393×727 phone, the
first populated row began at y=623.7, so its filename and approval control were
visible before scrolling.

The first proposal began unchecked, could be approved, and **Reset demo**
returned it to unchecked. **Start for real** returned to `/` and removed the
demo banner. The direct session did not choose or change a real folder. The
`demo-sandbox` and `storage-boundary` claim tests separately seed a real review,
enter/reset/exit demo, and prove that real state remains separate while demo
state is discarded. This covers the prior short-phone regression F-5-1 as well
as the original F-3-1 concern.

Normal and recovery coverage passed for explicit approval, shown-row bulk
controls, saved edits, empty/cancelled selection, read-only preview, the 101st
row and free-limit boundary, malformed/mismatched plan data, imported receipt
export, collision-safe undo retry, offline reload, route history, and the
designed unknown route. No real data was used in these checks; filesystem cases
use the shipped browser fixtures.

## Claims and clean setup

The repository was clean at `ef176dd` before report creation. `npm ci` installed
158 packages and reported zero vulnerabilities. The declared test sequence
passed:

```text
npm test
PASS — 10 unit tests; dist/ build; copy audit; 54 local browser tests
```

Every exact command in `.factory/claims.json` was then replayed separately in a
fail-fast loop. All 23 passed in both configured browser projects where
applicable:

| Claims | Result |
| --- | --- |
| `demo-sandbox`, `approval-required`, `displayed-bulk-controls`, `review-persistence`, `imported-receipt-export` | PASS |
| `undo-retry`, `local-only`, `offline-reload`, `deterministic-routes`, `reversible-move` | PASS |
| `receipt-csv`, `receipt-json`, `real-file-locality`, `browser-capabilities`, `storage-boundary` | PASS |
| `no-tracking-runtime`, `installable`, `free-limit`, `checkout-origin`, `permission-on-action` | PASS |
| `receipt-original-timestamp`, `recursive-inventory`, `plan-import` | PASS |

Landing, demo, privacy, terms, and README copy were cross-checked against the
registry and the passing generated copy audit. No public claim was missing a
test, false, incomplete, or untested.

## Live, accessibility, privacy, and PWA checks

```text
TRIAGEBOX_TEST_BASE_URL=https://local-file-triage.sociobot.in npm run test:e2e
PASS — 54/54
```

The live suite covers desktop and mobile interaction, keyboard and rerender
focus, route heading focus/announcement, visible touch targets, serious/critical
axe findings, reduced motion, privacy request logging, plan import, receipt
download, legal pages, 404 shell, manifest/service worker, update notice, and
offline reload. Its installed Playwright axe integration reported no serious or
critical findings; it is the supported browser-backed alternative to standalone
axe CLI in this worker.

`/opt/fleet/lib/verify-url.sh` passed on `/` and `/demo`. It reported no console
errors, English `lang`, exactly one `h1`, a `main` landmark, alt text on all
images, and labeled buttons. Measured live loads were 697 ms for home and 679
ms for demo.

Live HTTP results were 200 for `/`, `/demo`, `/privacy/`, `/terms/`,
`/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, and `/sw.js`.
`/does-not-exist` deliberately returned 404 and rendered the product’s header,
skip link, main content, footer, legal links, title, and recovery actions; it is
not a defect. HTML responses include CSP with response-header
`frame-ancestors 'none'`, `nosniff`, strict referrer policy, frame denial,
permissions policy, and HSTS. Runtime request assertions found only same-origin
product requests, except the fixture-checked user license flow to the documented
Sociobot billing origin. There is no analytics, CDN font, product backend,
tenant store, health endpoint, restart state, or product-owned rate limiter.
Backend-only checks therefore do not apply.

The local production build produced `dist/index.html`; JavaScript is 39.35 kB
raw / 13.31 kB gzip and CSS is 18.39 kB raw / 4.89 kB gzip, under the static
budgets. Live JavaScript and CSS hashes exactly matched that build.

## Earlier findings disposition

All historical findings listed in reviews 1–5 and verifications 1–3 were
inspected. Their present disposition is PASS:

| Earlier group | Current proof |
| --- | --- |
| F-1-1–F-1-9 | Locality, capability, storage, billing, explicit permission, timestamp, and recursive-inventory claim commands passed. |
| F-1-10–F-1-16 | The live route suite passed route metadata, shared 404 shell, heading focus/announcements, external-link naming, touch icon, and build information checks. |
| F-1-17–F-1-30 | The generated copy audit and live copy checks passed; current wording is plain and consistently uses folder, proposed destination, file move, receipt, and demo. |
| F-2-1–F-2-4 | No first-screen obstruction appeared; JSON receipt, installability, and generated copy-audit tests passed. |
| F-3-1–F-3-16 and F-5-1 | The Pixel 5 direct check and live regression test show a populated row at y=623.7 before scrolling; demo, navigation, legal, plan import, keyboard, and terminology checks passed. |
| RB-01–RB-05 | Dedicated tests passed for unchecked proposals, displayed-row scope, persistence, imported receipt export, and retryable collision-safe undo. |
| V1 claims/demo/announcements/touch/security/routing/cache/metadata/three-steps and FINAL-MOBILE | The clean and live suites reconfirmed these checks. |

No prior item remains open or regressed.

## Scope

No product code, deployment configuration, service, database, secret, or billing
setting was changed during this review. The product’s known browser limitation is
honestly documented: writable folder moves need browser folder-access support;
unsupported browsers retain the local preview and plan-export path.
