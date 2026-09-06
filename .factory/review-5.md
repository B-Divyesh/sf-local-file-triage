# Review local folder moves — Triagebox review 5

Date: 2026-09-06 UTC  
Live URL: <https://local-file-triage.sociobot.in>  
Implementation candidate reviewed: `c3f5248c719f5bef9807ce48d696a40b4b0dc78c`  
Documentation base reviewed: `7d7cee731843d52c148c5dce28788c387cf5b8f8`

## Verdict: FAIL

There is one minor finding and zero untested public claims. The sample works,
but on a fresh Pixel 5-sized phone browser its first screen contains no
populated sample row. A visitor must scroll before seeing the realistic output
that the one-click demo is meant to show immediately.

## Job, audience, and first action

Before scrolling, fresh desktop (1440×900) and phone (390×844) contexts made
the job, audience, and first action clear:

| Check | Evidence | Result |
| --- | --- | --- |
| Job | “Organize a folder. Review every move.” | PASS |
| Audience | “For people cleaning a messy folder…” | PASS |
| First action | “Try it with sample data”; it says five destinations will appear and nothing is saved. | PASS |

The first action was visible at y=644 on desktop and y=497 at 390×844. The
privacy, offline, and price facts were visible at 390×844. Both cold loads had
one `h1`, a `main` landmark, the expected title, and no console errors.

## Finding

### Minor — F-5-1: the one-click demo does not show populated output in a common phone viewport

Fresh Chromium configured as Playwright’s Pixel 5 device opened
`/?demo=1` at 393×727 with `scrollY=0`. The demo banner, heading, explanatory
text, status, folder summary, and filter were shown, but the first sample row
started at y=736.47. It was therefore outside the viewport. The captured
pre-scroll page had five loaded records, but no filename, proposed destination,
or approval control was visible until scrolling.

This reopens the substance of F-3-1. The demo-sandbox contract requires the
first screen after the one-click action to already show the product in use with
realistic populated output. The existing regression test sets a taller 390×844
viewport and passes because 107 px of the first row is visible there; it does
not cover the configured Pixel 5 viewport used by the mobile suite.

Suggested repair: reduce the compact demo’s vertical space on short phones, or
place one complete sample row ahead of the filter. Add a 393×727 first-row
visibility assertion while retaining the 390×844 check.

## Demo, privacy, and recovery checks

At 390×844, a single click entered `/?demo=1`, showed the persistent “Demo —
sample data, nothing is saved” label, loaded five realistic records, and kept
all approvals unchecked. **Reset demo** restored the five unchecked sample
records. **Start for real** discarded only `demo:latest` and returned to the
separate real review. The detailed demo claim proves the seeded real record is
not read or changed.

The full suite covered normal use, empty/invalid folder selection, permission
cancellation, read-only preview, 100-file boundary behavior, plan import with
changed/missing files, blocked undo followed by retry, exported receipts, and
offline reload. It covers keyboard focus after reset, bulk changes, and a new
folder action. There is no product backend; tenant, restart, health, and 429
checks do not apply. The billing URL is checked as a declared client-side
integration without contacting another service during this review.

## Claims and clean setup

Fresh clone: `/tmp/triagebox-review5-clean`, created from this repository at
the documentation base above. `npm ci` completed with Node 22.23.2 and no
vulnerabilities. The implementation-file diff from `c3f5248` to the reviewed
documentation base is empty.

`npm run lint`, `npm run build`, `npm run test:copy`, and `npm test` passed.
The build produced `dist/index.html`; `npm test` passed 10 Vitest tests and 52
desktop/mobile Playwright tests. Every exact command in `.factory/claims.json`
was replayed in a fail-fast loop; the log ended `CLAIMS_EXIT=0`.

| Claim ID | Result |
| --- | --- |
| demo-sandbox | PASS |
| approval-required | PASS |
| displayed-bulk-controls | PASS |
| review-persistence | PASS |
| imported-receipt-export | PASS |
| undo-retry | PASS |
| local-only | PASS |
| offline-reload | PASS |
| deterministic-routes | PASS |
| reversible-move | PASS |
| receipt-csv | PASS |
| receipt-json | PASS |
| real-file-locality | PASS |
| browser-capabilities | PASS |
| storage-boundary | PASS |
| no-tracking-runtime | PASS |
| installable | PASS |
| free-limit | PASS |
| checkout-origin | PASS |
| permission-on-action | PASS |
| receipt-original-timestamp | PASS |
| recursive-inventory | PASS |
| plan-import | PASS |

Untested public claims: **0**. The landing, README, privacy, terms, and demo
copy were cross-checked against the registry and generated copy audit. No new
unlisted claim was found.

## Live checks

`TRIAGEBOX_TEST_BASE_URL=https://local-file-triage.sociobot.in npm run test:e2e`
passed all 52 desktop/mobile tests. The stock verifier passed for `/` and
`/demo`: title, English `lang`, one `h1`, `main`, complete image alt text,
labeled buttons, and no console errors. Axe CLI could not start its Selenium
browser in this container even after supplying Playwright Chromium; the
equivalent installed Playwright axe-core integration was then run directly on
`/`, `/demo`, `/privacy/`, `/terms/`, and `/does-not-exist` with zero WCAG
2 A/AA violations, including zero serious or critical violations.

| URL | HTTP result | Result |
| --- | ---: | --- |
| `/` | 200 | PASS |
| `/demo` | 200 | PASS |
| `/privacy/` | 200 | PASS |
| `/terms/` | 200 | PASS |
| `/does-not-exist` | 404 | PASS — designed page, header, footer, recovery links, and route title render |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | 200 | PASS |

The live response has CSP, nosniff, referrer, frame, and permissions headers.
The manifest contains 192/512 maskable icons and standalone display. The
service worker precaches the shell, claims clients, supports an offline reload,
and announces an available update. All discovered same-origin links returned
200, except the 404 page’s functional `#main` skip link, which correctly
retained that deliberate page’s HTTP 404. External link targets were inspected
as URLs but not requested outside product scope.

The field-paper, moss, ochre, and contour-map visual system remains consistent
with `.factory/design.md`; it is legible in the fresh desktop and phone loads
and is distinct from a generic dashboard. Reduced-motion CSS removes motion
durations and looping animation. This review found no separate visual-identity,
contrast, keyboard, or motion finding.

Privacy request checks in the claim suite covered demo, real preview, move,
receipt exports, undo, and every product route. They observed same-origin
runtime requests only, except the explicitly user-triggered Sociobot license
flow covered by its fixture. No analytics, third-party scripts, or CDN fonts
were found.

## Earlier findings: current disposition

| Earlier item | Current disposition and proof |
| --- | --- |
| F-1-1 | PASS — `real-file-locality` covers real preview, move, export, and undo requests. |
| F-1-2 | PASS — `browser-capabilities` covers writable choice and read-only preview/export. |
| F-1-3 | PASS — `storage-boundary` confirms separate demo, real, and license keys. |
| F-1-4 | PASS — `no-tracking-runtime` records same-origin resources on all routes. |
| F-1-5 | PASS — `free-limit` checks 100 files, $19, and verified Pro removal. |
| F-1-6 | PASS — `checkout-origin` checks Sociobot checkout and verification URLs. |
| F-1-7 | PASS — `permission-on-action` observes no picker call before the button. |
| F-1-8 | PASS — receipt JSON/CSV tests retain original timestamps. |
| F-1-9 | PASS — `recursive-inventory` covers nested relative paths. |
| F-1-10 | PASS — live demo has its own title, canonical, description, OG, and Twitter data. |
| F-1-11 | PASS — live privacy and terms pages have their own complete metadata. |
| F-1-12 | PASS — the live HTTP 404 has the shared shell and recovery actions. |
| F-1-13 | PASS — live Back/Forward tests focus and announce the destination `h1`. |
| F-1-14 | PASS — external controls name their destination. |
| F-1-15 | PASS — the 180×180 touch icon is referenced by every document. |
| F-1-16 | PASS — package/footer remain v1.1.0 with build `polish3`. |
| F-1-17 through F-1-19 | PASS — README opening/audience and landing label remain plain and short. |
| F-1-20 through F-1-30 | PASS — copy audit and live routes retain destination/receipt terms, literal headings, consistent sample terms, and no PWA or workbench jargon. |
| F-2-1 | PASS — no cold-load update notice obscures the first-screen facts. |
| F-2-2 | PASS — `receipt-json` downloads and parses a completed receipt. |
| F-2-3 | PASS — `installable` covers manifest, icons, and active worker. |
| F-2-4 | PASS — `test:copy` verifies the generated exact copy audit. |
| F-3-1 | **REGRESSED as F-5-1** — a Pixel 5 first screen has no visible sample row. |
| F-3-2 through F-3-7 | PASS — facts, claim scope, browser wording, date wording, Node wording, and plan import remain correct. |
| F-3-8 through F-3-14 | PASS — plain task wording and concrete 404/navigation/README labels remain. |
| F-3-15 | PASS — keyboard focus survives the tested rerenders. |
| F-3-16 | PASS — every live route has Demo, Review files, Upgrade, and Privacy. |
| RB-01 through RB-05 | PASS — dedicated tests cover unchecked default, displayed bulk scope, persistence, imported receipt export, and retryable undo. |
| V1-claims, V1-demo, V1-announcements, V1-touch, V1-security, V1-routing, V1-cache, V1-metadata, V1-three-steps, FINAL-MOBILE | PASS except the re-opened demo-first-screen presentation issue above; current clean and live suites, route checks, request logs, and headers reconfirm the rest. |

## Required next step

Repair F-5-1, add the short-phone regression assertion, then repeat the live
phone demo check. Until then, this review is **FAIL**.
