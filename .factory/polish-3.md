# Polish round 3 — cumulative finding ledger

Date: 2026-08-28 UTC

Work order: `local-file-triage-polish-3`

Reviewed release candidate: `7e6790d0571fe2e6ccd4b8f3fec61dc43c419e78`

Adversarial review commit: `ea1ebe669fbd79b4b44181144260e0ce45b39a62`

Deployed product commit: `c3f5248c719f5bef9807ce48d696a40b4b0dc78c`

Live URL: <https://local-file-triage.sociobot.in>

Every finding in reviews 1–3 and the earlier polish histories was reopened for
this round. The tables below record the implemented change and its observable
evidence. “Live suite” means the complete 52-case Playwright suite run with
`TRIAGEBOX_TEST_BASE_URL=https://local-file-triage.sociobot.in` against a fresh
browser context after deployment.

## Review 3 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Replaced the repeated landing content in demo mode with a compact product screen. It loads five sample records at once, keeps the demo banner visible, and puts the first row in the 390×844 viewport. | `@claim:demo-sandbox`; live suite; first row y=736 with 108 px visible; `evidence/polish-3-live-demo-390.png`; live `/?demo=1`. |
| F-1-12 (reopened) | The true 404 now renders through the same header, footer, version, icons, metadata, and legal navigation source as every route. | `demo metadata, route focus, legal metadata, and designed 404 use complete route shells`; live HTTP 404; `evidence/polish-3-live-404-desktop.png`; live `/does-not-exist`. |
| F-2-4 (regressed) | Added a generated exact-copy audit from the rendered cold 390 px landing page, demo state, update state, and README. The check compares the generated output byte-for-byte. | `npm run test:copy`; `.factory/copy-audit.md`; clean-clone `npm test`; live `/` and `/?demo=1`. |
| F-3-15 | Rerenders preserve a logical action key and restore focus after reset, bulk approval, bulk clear, new-folder reset, import, and execution. | `keyboard focus survives demo reset, bulk changes, and a new folder action`; live suite; live reset and bulk controls both finish focused, never on `BODY`. |
| F-3-2 | Replaced the hero detail blocks with the required privacy, offline, and exact free/Pro facts. | `cold 390px load keeps all first-screen facts visible and shows no initial update notice`; `@claim:offline-reload`; `@claim:free-limit`; facts end at y=811; `evidence/polish-3-live-home-390.png`; live `/`. |
| F-3-3 | Removed the untested 1,000–10,000-file range from README audience copy. | `npm run test:copy`; `.factory/copy-audit.md`; live catalog description check. |
| F-3-4 | Replaced the categorical Chrome/Edge statement with conditional browser-support wording. | `@claim:browser-capabilities`; `npm run test:copy`; live `/`. |
| F-3-5 | Reworded the modified-date statement as Triagebox behavior: the original date is recorded, and preservation is not promised. | `@claim:receipt-original-timestamp`; `@claim:receipt-json`; live `/terms/`. |
| F-3-6 | Changed the README minimum claim to “Development is verified with Node.js 22.” | clean clone used Node 22.23.2; `npm run test:copy`. |
| F-3-7 | Added strict plan JSON import after explicit writable-folder choice. Exact path, size, and timestamp matches restore edits and approvals; changed or missing files remain unapproved. | `@claim:plan-import`; `tests/plan.test.ts`; `tests/fixtures/import-plan.json`; live suite. |
| F-3-8 | Replaced “survey” in user copy with folder choice, scan, review, or file move. | terminology browser test; `npm run test:copy`; live `/` and `/demo`. |
| F-3-9 | Removed the empty “Ready.” status and retained the useful permission state. | home workflow test; exact copy audit; live `/`. |
| F-3-10 | Removed the invented coordinate and numbered-section labels. | exact copy audit; `evidence/polish-3-live-home-390.png`; live `/`. |
| F-3-11 | Removed the vague “safety controls” sentence. | exact copy audit; `@claim:free-limit`; live `/#unlock`. |
| F-3-12 | Rewrote the error page as “Page not found” with literal recovery actions. | 404 route-shell test; `evidence/polish-3-live-404-desktop.png`; live `/does-not-exist` returns 404. |
| F-3-13 | Renamed the primary navigation destination from “Workbench” to “Review files.” | route-shell test; live header check on all five routes; live `/`. |
| F-3-14 | Renamed the README section to “Product documentation.” | `npm run test:copy`; `.factory/copy-audit.md`. |
| F-3-16 | Added Privacy to the four-link shared primary header and retained Terms in the footer. | route-shell test; 44 px mobile target audit; live header is `Demo · Review files · Upgrade · Privacy` on all routes. |

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Initial worker installation stays silent. A real update uses an in-flow, dismissible notice. | cold 390 px test; live `updateHidden=true`, facts bottom y=811; `evidence/polish-3-live-home-390.png`. |
| F-1-20 (review 2 regression) | Removed user-facing “route” as a synonym for proposed destination or file move. | `user-facing copy uses destination and file move instead of route terminology`; exact copy audit; live `/`, `/demo`, `/privacy/`, `/terms/`. |
| F-2-2 | Kept a dedicated JSON receipt claim that downloads and parses a completed receipt. | `@claim:receipt-json`; `@claim:real-file-locality`; clean and live suites. |
| F-2-3 | Kept installability separate from offline reload and validates manifest, icons, worker activation, and control. | `@claim:installable`; `@claim:offline-reload`; live manifest MIME `application/manifest+json`. |
| F-2-4 | Replaced the manual summary with the exact generated copy artifact and stale-file gate. | `npm run audit:copy`; `npm run test:copy`; `.factory/copy-audit.md`. |

## Review 1 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Broad privacy copy is backed by real selected-file preview, move, both exports, and undo request logging. | `@claim:real-file-locality`; live suite; live request log contains no external origin. |
| F-1-2 | Capability copy is conditional and both writable and fallback preview/export paths are covered. | `@claim:browser-capabilities`; live suite. |
| F-1-3 | Demo and real IndexedDB records remain separate; exit deletes only `demo:latest`; license keys remain documented. | `@claim:storage-boundary`; `@claim:demo-sandbox`; `.factory/demo.md`. |
| F-1-4 | Every product route loads without analytics, CDN fonts, or third-party runtime resources. | `@claim:no-tracking-runtime`; live suite; live external request list `[]`. |
| F-1-5 | The free 100-move boundary, $19 one-time price, and fixture-verified Pro removal are observable. | `@claim:free-limit`; live `/` and `/terms/`. |
| F-1-6 | Copy promises only hosted Sociobot/Dodo checkout and Sociobot verification behavior. | `@claim:checkout-origin`; live checkout link origin. |
| F-1-7 | Folder permission is requested only from the explicit folder action. | `@claim:permission-on-action`; live suite. |
| F-1-8 | Exact original timestamps remain in receipt JSON and CSV. | `@claim:receipt-original-timestamp`; `@claim:receipt-json`; `@claim:receipt-csv`. |
| F-1-9 | Nested folders are traversed once with their relative paths. | `@claim:recursive-inventory`. |
| F-1-10 | `/demo` and `?demo=1` set demo-specific title, canonical, description, OG, and Twitter metadata. | route metadata test; live canonical `/demo`; live `/?demo=1`. |
| F-1-11 | Privacy and Terms contain their own title, canonical, description, OG, and Twitter metadata. | legal metadata test; live `/privacy/` and `/terms/`. |
| F-1-12 | The 404 now shares the complete application shell and remains a true HTTP 404. | route-shell test; stock live verifier; `evidence/polish-3-live-404-desktop.png`. |
| F-1-13 | Route navigation, Back, and Forward focus and announce the destination h1. | `browser Back and Forward restore route heading focus and announce the route title`; live suite. |
| F-1-14 | GitHub and checkout links identify their external destination in their accessible names. | route-shell accessibility checks; live footer and upgrade checks. |
| F-1-15 | Every document uses a real 180×180 Apple touch icon. | metadata test; clean asset inspection; live route crawl. |
| F-1-16 | Package and footer use v1.1.0 with stable visible build ID `polish3`. | clean build; live footer in all screenshots. |
| F-1-17 | README opening is split into short job-focused sentences. | exact copy audit. |
| F-1-18 | README audience copy is short and contains no unsupported scale range. | exact copy audit. |
| F-1-19 | The landing label says “Organize files locally.” | exact copy audit; `evidence/polish-3-live-home-390.png`. |
| F-1-20 | Proposed destination and file move are the consistent task terms. | terminology browser test; exact copy audit. |
| F-1-21 | Figure, status, and update text state literal product behavior. | exact copy audit; live `/`. |
| F-1-22 | The work section says “Choose and review a folder.” | home workflow test; live `/#review-files`. |
| F-1-23 | The explanation uses file type, year, and destination in plain words. | `@claim:deterministic-routes`; exact copy audit. |
| F-1-24 | Both try-out entry points use sample wording and enter isolated demo mode. | `@claim:demo-sandbox`; live `/` to `/?demo=1`. |
| F-1-25 | The process heading names review-before-move instead of claiming safety. | home workflow test; exact copy audit. |
| F-1-26 | The paid section says “Optional Pro license.” | exact copy audit; live `/#unlock`. |
| F-1-27 | The upgrade heading names the 100-file result. | `@claim:free-limit`; live `/#unlock`. |
| F-1-28 | User copy avoids the unexplained PWA acronym and separates installation from offline behavior. | `@claim:installable`; `@claim:offline-reload`; exact copy audit. |
| F-1-29 | README and navigation use concrete task names instead of “workbench.” | exact copy audit; route-shell test. |
| F-1-30 | User copy says “receipt”; schema identifiers remain developer-only. | receipt claim tests; exact copy audit. |

## Earlier independent and red-team findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| V1-claims | The registry contains 23 unique claims with exact runnable commands and one matching tagged test each. | All 23 commands passed from `/tmp/triagebox-polish3-final-5kNCwR` at `c3f5248`. |
| V1-demo | One click or direct `?demo=1` opens five isolated records with a persistent banner, reset, and real-mode exit. | `@claim:demo-sandbox`; `evidence/polish-3-live-demo-390.png`; live `/?demo=1`. |
| RB-01 | New proposed file moves start unchecked. | `@claim:approval-required`. |
| RB-02 | Bulk actions affect only the displayed slice. | `@claim:displayed-bulk-controls`; live suite. |
| RB-03 | Approvals, destination categories, and names survive reload. | `@claim:review-persistence`. |
| RB-04 | Imported receipts remain visible and exportable. | `@claim:imported-receipt-export`; `@claim:receipt-json`. |
| RB-05 | A blocked undo can be retried after its blocker is removed. | `@claim:undo-retry`. |
| V1-announcements | Async activity and route changes use polite live regions; rerenders restore focus. | accessibility and keyboard focus tests; live suite. |
| V1-touch | Every visible mobile interactive target is at least 44×44 px. | five-route mobile accessibility audit; live suite. |
| V1-security | CSP, frame, referrer, permissions, and nosniff headers remain active. | live response-header check; stock live verifier. |
| V1-routing | Deep links, history navigation, route focus, titles, canonicals, and HTTP 404 work from the address bar. | route/focus tests; live suite. |
| V1-cache | Hashed assets are immutable and the manifest has the correct MIME type. | live headers: `max-age=31536000, immutable`; live manifest check. |
| V1-metadata | Canonical, OG/Twitter, social art, touch icon, and build label are complete. | route metadata test; live suite. |
| V1-three-steps | Choose, Review, and Move remain a real ordered list with task wording. | home workflow test; exact copy audit. |
| FINAL-MOBILE | Removed the mobile sticky action rail after the final gate proved it could cover checkboxes and “Show more”; tightened header spacing without shrinking touch targets. | final clean-clone 52/52; mobile suite 26/26; live suite 52/52; zero horizontal overflow on five routes. |

## Verification record

- Clean clone: `/tmp/triagebox-polish3-final-5kNCwR`, commit `c3f5248`.
- `npm ci`: 158 packages, 0 vulnerabilities.
- `npm run lint`: pass.
- `npm test`: 10/10 Vitest, exact copy audit, build, 52/52 Playwright.
- Every `.factory/claims.json` command: 23/23 pass from the clean clone.
- Production Playwright suite: 52/52 pass on desktop Chromium and Pixel 5.
- Production Axe CLI: zero violations on `/`, `/demo`, `/privacy/`, `/terms/`, and the 404; `evidence/axe-polish-3-live/axe-polish-3-live.json`.
- Stock URL verifier: no console errors, one h1, one main, English lang, complete alt text on home and demo; `evidence/polish-3-live-home-verify/` and `evidence/polish-3-live-demo-verify/`.
- Production Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 60 ms; `evidence/lighthouse-polish-3-live.json`.
- Production assets: JavaScript 39.35 KB raw / 13.31 KB gzip; CSS 17.85 KB raw / 4.79 KB gzip.
- Deployment ID: `ce758aa5-5fce-4110-bf21-40d72fda7ba0`; Azure Static Web Apps status `Succeeded`; custom domain returned 200 with managed TLS.

No review finding remains unresolved.
