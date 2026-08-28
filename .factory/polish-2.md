# Polish round 2 — Triagebox

Date: 2026-08-28 UTC

Work order: `local-file-triage-polish-2`

Reviewed candidate: `7e276d8d7dee135fd616321ca7eea8cb675de116`

Repair implementation: `ffb093befa3eace943cbe3e87c69ba5bf7dcdda6`

Live URL: <https://local-file-triage.sociobot.in>

Every finding in `review-1.md`, `review-2.md`, `polish-1.md`, and the earlier
verification reports was rechecked. All are resolved. The visual treatment
remains the original topographic field-paper system documented in `design.md`.

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | The worker now distinguishes a first install from a real shell update. First install emits no notice. A real update uses a dismissible, in-flow notice, never a fixed overlay. The mobile action rail is also sticky within the workbench instead of covering the page. | `cold 390px load keeps all first-screen facts visible…`; live report `home.factsBottom=760`, `updateHidden=true`; `evidence/live-polish-2-home-390.png` |
| F-1-20 (regressed) | Replaced every user-facing “route” with “proposed destination” or “file move,” including hero, demo banner, filter, empty state, approval count, terms, alt text, and reset status. | `user-facing copy uses destination and file move instead of route terminology`; `copy-audit.md`; live home/demo copy checks |
| F-2-2 | Added the `receipt-json` claim. Its browser test performs a real mocked filesystem move, downloads the JSON receipt, parses it, and asserts the recorded action, timestamp, size, and status. | `@claim:receipt-json` passed in desktop and mobile from the clean clone |
| F-2-3 | Added the `installable` claim and narrowed the README sentence to the observable installation files. The test checks the manifest MIME, standalone start URL, 192/512 maskable icons, CDP manifest errors, active worker, and controlling worker after reload. | `@claim:installable`; live report `manifest`; `@claim:offline-reload` remains separate |
| F-2-4 | Rebuilt `copy-audit.md` with every cold landing, demo-specific, update-notice, and README copy unit, counts, evidence, and one terminology table. | `copy-audit.md`; terminology regression test |

## Review 1 findings

| Finding | Change made or reconfirmed | Evidence |
| --- | --- | --- |
| F-1-1 | Real selected-file locality covers preview, move, both receipt exports, and undo; broad copy uses the tested scope. | `@claim:real-file-locality`; live `externalRequests=[]` |
| F-1-2 | Feature-present folder choice and feature-absent preview/plan export remain covered. | `@claim:browser-capabilities` |
| F-1-3 | Demo survey, real survey, token, and verdict remain in separate documented storage keys. Demo exit now deletes `demo:latest`. | `@claim:storage-boundary`; `@claim:demo-sandbox` |
| F-1-4 | Home, demo, privacy, and terms load without analytics, CDN fonts, or third-party runtime scripts. | `@claim:no-tracking-runtime`; live `externalRequests=[]` |
| F-1-5 | Free moves stop at 100 and a fixture-verified $19 Pro license removes the limit. | `@claim:free-limit` |
| F-1-6 | Copy promises only observable hosted checkout and Sociobot verification behavior. | `@claim:checkout-origin` |
| F-1-7 | The directory picker is untouched until **Choose a folder** is activated. | `@claim:permission-on-action` |
| F-1-8 | JSON data and CSV include the exact original timestamp. | `@claim:receipt-original-timestamp`; `@claim:receipt-json` |
| F-1-9 | Nested folders are traversed once with complete relative paths. | `@claim:recursive-inventory` |
| F-1-10 | `/demo` and `?demo=1` set the demo title, description, canonical, OG, and Twitter metadata. | `demo metadata, route focus…`; live report `routes.demo` |
| F-1-11 | Privacy and terms retain complete route-specific OG/Twitter metadata. | `demo metadata, route focus…`; live report `routes.privacy/terms` |
| F-1-12 | The HTTP 404 retains the field-map header, skip link, main, footer, legal links, metadata, icons, and return action. | live report `routes.notFound.status=404`; `evidence/live-polish-2-404-desktop.png` |
| F-1-13 | Navigation and Back focus the destination h1 and announce the route title. | `browser Back restores a route heading focus…`; live demo `headingFocused=true` |
| F-1-14 | GitHub and checkout controls name the external destination and expose “opens in a new site.” | route-shell browser checks; clean link inspection |
| F-1-15 | All documents reference the real 180×180 apple-touch icon. | `demo metadata, route focus…`; asset dimensions retained |
| F-1-16 | Package and visible footer now use v1.0.2; build-time injection supplies the deployed short commit. Static 404 uses v1.0.2 with `static-404`. | clean build; live footer; `evidence/live-polish-2-404-desktop.png` |
| F-1-17 | README opening remains split into short job-focused sentences. | `copy-audit.md` |
| F-1-18 | README audience remains two short concrete sentences. | `copy-audit.md` |
| F-1-19 | Landing eyebrow remains “Organize files locally.” | `evidence/live-polish-2-home-390.png` |
| F-1-20 | Completed again across all user-facing surfaces; no synonym regression remains. | terminology browser regression; `copy-audit.md` |
| F-1-21 | Caption and update copy remain literal and concrete. | `copy-audit.md`; live screenshots |
| F-1-22 | Section label remains “Choose and review a folder.” | home workflow browser test |
| F-1-23 | Explanation uses file type, year, and destination in plain words. | `@claim:deterministic-routes`; `copy-audit.md` |
| F-1-24 | Both sample actions use “sample”; both now enter `/demo`, so neither writes real survey state. | `@claim:demo-sandbox` |
| F-1-25 | Heading remains “How review-before-move works.” | home workflow browser test |
| F-1-26 | Upgrade label remains “Optional Pro license.” | `copy-audit.md` |
| F-1-27 | Upgrade heading remains “Remove the 100-file move limit.” | `@claim:free-limit` |
| F-1-28 | README avoids the PWA acronym and now separates installability from offline reload. | `@claim:installable`; `@claim:offline-reload` |
| F-1-29 | README opening remains concrete and avoids “workbench.” | `copy-audit.md` |
| F-1-30 | User copy consistently says “receipt”; schema identifiers stay developer-only. | `copy-audit.md`; receipt claim tests |

## Earlier independent-verification findings

| Finding | Change made or reconfirmed | Evidence |
| --- | --- | --- |
| V1-claims | The registry now contains 22 unique claim IDs, each with one tagged observable test. | All 22 exact registry commands passed from `/tmp/triagebox-polish-2-clean-ipOzbo` |
| V1-demo | A first-screen click and direct `/demo` or `?demo=1` load the isolated five-file demo, persistent banner, reset, and exit. Exit deletes demo state and restores only real state. | `@claim:demo-sandbox`; `demo.md`; live report |
| RB-01 | Proposals start unchecked. | `@claim:approval-required` |
| RB-02 | Bulk approval changes only the displayed slice. | `@claim:displayed-bulk-controls` |
| RB-03 | Approval, destination, and name edits persist across reload. | `@claim:review-persistence` |
| RB-04 | Imported undo receipts remain visible and exportable. | `@claim:imported-receipt-export`; `@claim:receipt-json` |
| RB-05 | A blocked undo can be retried after its blocker is removed. | `@claim:undo-retry` |
| V1-announcements | Async activity uses an atomic polite status region. | accessibility browser test |
| V1-touch | Mobile approval, buttons, and legal links retain 44 px targets. | mobile accessibility browser test |
| V1-security | CSP, frame, referrer, permissions, and nosniff headers remain deployed. | production response-header check; stock URL verifier |
| V1-routing | `/demo`, legal routes, Back focus, and a true HTTP 404 remain working. | route tests; live report |
| V1-cache | Hashed assets retain immutable caching and the manifest MIME is correct. | production curl check; live report `manifest` |
| V1-metadata | Canonical, OG/Twitter, social art, touch icon, and build label remain complete. | route metadata browser test; live report |
| V1-three-steps | Survey, Review, and Move remain visible as a real ordered list. | home workflow browser test; `copy-audit.md` |

## Verification summary

- Clean clone commit: `ffb093befa3eace943cbe3e87c69ba5bf7dcdda6`.
- Clean clone: `npm ci`, `npm run lint`, `npm run build`, and `npm test` passed.
- Full suite: 8/8 Vitest and 48/48 Playwright checks passed.
- Claims: all 22 exact `.factory/claims.json` commands passed individually.
- Accessibility: axe serious/critical count 0 on local desktop/mobile and live home/privacy/terms.
- Privacy: live `externalRequests=[]`; claim flow covers preview, move, export, and undo.
- Offline: live `/demo` reloaded with its banner and five rows after `context.setOffline(true)`.
- Performance: 32.98 kB raw / 11.84 kB gzip JS; 16.09 kB raw / 4.46 kB gzip CSS. Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO, 1.9 s LCP, 0 CLS.
- Stock verifier: title, lang, one h1, main, alt text, button names, and zero console errors passed at the live URL.
- Live machine-readable evidence: `evidence/live-polish-2-report.json`.
- Screenshots: `evidence/live-polish-2-home-390.png`, `evidence/live-polish-2-demo-390.png`, and `evidence/live-polish-2-404-desktop.png`.

No finding of any recorded severity remains.
