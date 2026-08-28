# Adversarial first-read review 4 — Triagebox

Date: 2026-08-28 UTC
Live URL: <https://local-file-triage.sociobot.in>
Reviewed repository commit: `87ec24d5165237ba462c54d62c5ea27006882f40`

## Verdict: PASS

No blocking, major, or minor findings remain. The live product is clear before
scrolling, provides an isolated one-click demo, and backs its visitor-facing
claims with passing clean-clone tests. This is a PASS under the required
zero-finding rule.

## Cold first read

Fresh Chromium browser contexts with no retained storage loaded the live home
page at 390×844 and 1440×900. These notes were recorded before scrolling.

| Question | Answer from the first screen | Result |
| --- | --- | --- |
| What does it do? | It organizes a local folder after I review every proposed file move. | PASS |
| For whom? | “For people cleaning a messy folder.” | PASS |
| What should I click first? | **Try it with sample data**. It says five proposed destinations will appear and nothing will be saved. | PASS |

The first-screen headline is “Organize a folder. Review every move.” The
primary action was visible at y=496–542 on the phone and y=644–691 on desktop.
The phone screen showed the privacy, offline, and price facts without overflow
or an update notice. Both contexts had zero console errors and zero
third-party requests.

## Copy audit

The checked generated audit, `.factory/copy-audit.md`, covers the rendered
390-pixel landing page, the demo route, the conditional update notice, and the
README. `npm run test:copy` passed. Every unit is at or below 22 words, uses no
listed banned marketing word, and uses the documented terms *folder*, *folder
review*, *proposed destination*, *approval*, *file move*, *receipt*, and *demo*.

Landing sentences, headings, labels, and controls (word count):

| Copy | Words | Check |
| --- | ---: | --- |
| Organize files locally · No uploads | 5 | Plain job/privacy label; locality claim |
| Organize a folder. Review every move. | 6 | Clear headline |
| For people cleaning a messy folder, Triagebox shows where each file will go before it moves. | 16 | Clear audience and result |
| Try it with sample data | 5 | Result-naming primary action |
| See five proposed destinations. Nothing is saved. | 7 | Clear immediate result |
| Privacy | 1 | Clear fact label |
| Files stay in this browser | 5 | `real-file-locality` |
| Offline | 1 | Clear fact label |
| Works offline after the first visit | 6 | `offline-reload` |
| Price | 1 | Clear fact label |
| Free: 100 moves per run · Pro: $19 once | 8 | `free-limit` |
| See every proposed destination before moving a file. | 8 | Plain figure caption |
| No folder permission requested yet. | 5 | `permission-on-action` |
| File details stay in this browser | 6 | `real-file-locality` |
| Choose and review a folder | 5 | Out-of-context section heading |
| Open one folder. Nothing moves yet. | 6 | Clear empty state |
| After you choose a folder, Triagebox suggests a destination from each file’s type and year. | 15 | `deterministic-routes` |
| Choose a folder | 3 | Result-naming action |
| Preview a folder | 3 | Result-naming action |
| Import plan JSON | 3 | Result-naming action |
| Undo from receipt | 3 | Result-naming action |
| Try the five-file sample | 4 | Clear demo action |
| How review-before-move works | 3 | Literal process heading |
| 1. Choose Choose one local folder. | 6 | Literal step |
| 2. Review Check each destination you want. | 7 | Literal step |
| 3. Move Copy, verify, then keep a receipt. | 8 | Literal step |
| Optional Pro license | 3 | Clear paid-section heading |
| Remove the 100-file move limit | 5 | Clear paid result |
| Free runs move up to 100 files. A $19 one-time Triagebox Pro license removes the per-run limit. | 17 | `free-limit` |
| Checkout opens on Sociobot/Dodo. See terms and privacy. | 8 | `checkout-origin` |
| Buy Pro on Sociobot/Dodo · $19 | 5 | Named external result |
| Have a license? Restore it | 5 | Clear in-context disclosure/action |
| License token | 2 | Bound form label |
| Verify license | 2 | Result-naming action |
| Review file moves before they happen. | 6 | Plain footer description |
| Terms | 1 | Clear legal link |
| View source on GitHub | 4 | Named external destination |
| Map artwork generated for Triagebox · 2026 · v1.1.0 · build polish3 | 9 | Asset/build provenance |

README headings and sentences (word count):

| Copy | Words | Check |
| --- | ---: | --- |
| Triagebox | 1 | Repository name |
| Triagebox organizes messy folders after you review every proposed move. | 10 | Plain opening |
| It lists files in nested folders and suggests a destination by type and year. | 14 | `recursive-inventory`; `deterministic-routes` |
| You review each suggestion before moving files. | 7 | `approval-required` |
| Each run can export JSON and CSV receipts and can be undone without overwriting an existing original path. | 18 | Receipt/undo claims |
| Live product: https://local-file-triage.sociobot.in | 3 | Link |
| Try the sample | 3 | Clear heading |
| Open https://local-file-triage.sociobot.in/?demo=1 or choose Try it with sample data. | 10 | Clear instruction |
| The five-file sample is isolated from your saved folder review. | 10 | `demo-sandbox` |
| Reset demo restores the sample. | 5 | `demo-sandbox` |
| Start for real returns to your separate folder review. | 9 | `demo-sandbox` |
| Details are in .factory/demo.md. | 4 | Documentation link |
| Who it is for | 4 | Clear heading |
| For people cleaning or migrating folders. | 6 | Clear audience |
| File details stay in your browser, and nothing moves without review. | 11 | Locality/approval claims |
| Safety model | 2 | Names the mechanism section |
| Triagebox asks for folder access only after you choose a folder. | 11 | `permission-on-action` |
| File type and modified year choose each proposed destination. | 9 | `deterministic-routes` |
| The editable plan does nothing until you approve a specific run. | 11 | `approval-required` |
| For each move, Triagebox copies bytes, checks the destination size, then removes the source. | 14 | `reversible-move` |
| Name collisions receive (2), (3), and so on. | 8 | `reversible-move` |
| Nothing is overwritten. | 3 | `reversible-move` |
| The receipt records original and destination paths, byte size, original timestamp, outcome, and errors. | 14 | Receipt claims |
| Undo uses the same copy, check, and remove sequence in reverse. | 11 | `undo-retry`; `reversible-move` |
| Triagebox records the original date in the receipt. | 8 | `receipt-original-timestamp` |
| It does not promise to preserve the copied file’s modified date. | 11 | Honest limitation |
| Keep a separate backup during important migrations. | 7 | Useful advice |
| Exported plan JSON can be imported after choosing the matching folder. | 11 | `plan-import` |
| Exact path, size, and date matches regain their edits and approvals. | 11 | `plan-import` |
| Changed or missing files stay unapproved and are reported. | 9 | `plan-import` |
| Browser support and privacy | 4 | Clear heading |
| Writable folder choice appears when your browser supports it. | 9 | `browser-capabilities` |
| Other browsers and mobile devices can preview a folder and export a plan. | 13 | `browser-capabilities` |
| Your last folder review and receipt use IndexedDB. | 8 | `storage-boundary` |
| The demo uses demo:latest; real work uses latest. | 8 | `storage-boundary` |
| The optional Pro token and its check result use namespaced localStorage keys. | 12 | `storage-boundary` |
| There are no analytics, third-party scripts, or CDN fonts. | 9 | `no-tracking-runtime` |
| Supporting browsers receive the manifest and service worker needed to install Triagebox. | 12 | `installable` |
| The app reloads offline after your first visit. | 8 | `offline-reload` |
| Read the full privacy policy and terms. | 7 | Clear links |
| Free and Pro | 3 | Clear heading |
| The free tier includes folder scans, per-file review and edits, exports, undo, and 100 file moves per run. | 18 | `free-limit` |
| Triagebox Pro is a $19 one-time license that removes the per-run limit. | 12 | `free-limit` |
| Checkout opens a page hosted by Sociobot/Dodo. | 7 | `checkout-origin` |
| License checks use the Sociobot billing API. | 7 | `checkout-origin` |
| Develop and verify | 3 | Clear heading |
| Development is verified with Node.js 22. | 6 | Observed development environment |
| npm test runs unit, copy, build, and Chromium desktop and mobile checks. | 12 | Verified command |
| Playwright 1.58.2 is pinned for the factory image. | 8 | Repository fact |
| The static deployment root is dist/, with dist/index.html at its root. | 11 | Verified build output |
| Product documentation | 2 | Clear heading |
| Product and visual decisions: .factory/design.md. | 5 | Documentation link |
| Observable product claims and regression commands: .factory/claims.json. | 7 | Documentation link |
| Build handoff: .factory/handoff.md. | 3 | Documentation link |
| License: MIT. | 2 | Verified license |

No rewrite is proposed because this audit has no copy finding.

## Demo, sandbox, privacy, and offline

PASS. A single activation of **Try it with sample data** opened `/?demo=1` with
five realistic file records: a camera photo, contract, voice note, archive, and
text note. The first phone viewport contained the product summary and the first
sample row (top 736 px; 108 px visible). The persistent banner reads “Demo —
sample data, nothing is saved” and includes working **Reset demo** and **Start
for real** controls.

The demo claim test seeds a private real record, verifies that it does not
appear in demo, resets edited demo data to the original five unchecked records,
then exits and confirms that only `latest` remains. Code uses `demo:latest` for
demo state and `latest` for real folder-review state. No real folder handle is
requested in demo mode.

The live request log for home and demo contained only the product origin and no
console errors. The full request-locality claim exercises real preview, move,
JSON/CSV export, and undo. The offline claim reloads the installed shell after
the first visit with the browser context offline.

## Claims

A fresh local clone at `/tmp/triagebox-review4-clean-iO4PON` was installed and
built. Each exact command from `.factory/claims.json` completed successfully.

| Claim ID | Result |
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

Every claim-like landing and README sentence above maps to a listed claim or is
an observed repository/documentation fact. No unlisted claim was found.

## Earlier finding re-check

Every earlier review, polish report, and handoff was read. The following checks
were made on the current code and live deployment; no earlier finding is merely
marked fixed.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Real file preview, move, export, and undo stay same-origin; `real-file-locality` passes. |
| F-1-2 | Feature-present chooser and feature-absent preview/export pass `browser-capabilities`. |
| F-1-3 | IndexedDB and license storage keys remain separate; `storage-boundary` passes. |
| F-1-4 | All product routes make only same-origin runtime requests; `no-tracking-runtime` passes. |
| F-1-5 | The 100-file cap, $19 price, and Pro removal are observed by `free-limit`. |
| F-1-6 | Checkout link/verification use Sociobot; `checkout-origin` passes. |
| F-1-7 | Picker call remains explicit-action only; `permission-on-action` passes. |
| F-1-8 | JSON/CSV record original timestamps; receipt claims pass. |
| F-1-9 | Nested relative paths are covered by `recursive-inventory`. |
| F-1-10 | Demo canonical, title, description, OG, and Twitter metadata are route-specific. |
| F-1-11 | Privacy and Terms retain complete route metadata. |
| F-1-12 | The true HTTP 404 has the shared header, footer, legal links, metadata, and recovery actions. |
| F-1-13 | Route, Back, and Forward focus and announce the destination h1. |
| F-1-14 | GitHub and checkout controls name their external destinations. |
| F-1-15 | All entry documents reference the 180×180 Apple touch icon. |
| F-1-16 | Package/footer identify v1.1.0 and build `polish3`. |
| F-1-17 | README opening is short and job-specific. |
| F-1-18 | README audience has no unsupported scale claim. |
| F-1-19 | The landing label says “Organize files locally.” |
| F-1-20 | Current user copy contains no `route`/`routes` task synonym. |
| F-1-21 | Figure, status, and update text are literal rather than metaphorical. |
| F-1-22 | The folder section is headed “Choose and review a folder.” |
| F-1-23 | The suggestion explanation names file type, year, and destination. |
| F-1-24 | Both demo entry points use sample wording and enter isolated demo mode. |
| F-1-25 | The process heading names review-before-move. |
| F-1-26 | The paid section is headed “Optional Pro license.” |
| F-1-27 | The upgrade heading names the 100-file result. |
| F-1-28 | User copy avoids unexplained PWA jargon and separates install/offline claims. |
| F-1-29 | README/navigation avoid the abstract “workbench” label. |
| F-1-30 | User copy says receipt; schema-only code may say manifest. |
| F-2-1 | A cold phone load has no update overlay; all three facts remain visible. |
| F-2-2 | JSON receipt download is parsed by `receipt-json`. |
| F-2-3 | Manifest, icons, worker control, and install eligibility are tested separately. |
| F-2-4 | Generated copy audit is current and `test:copy` passes. |
| F-3-1 | The demo opens directly into sample work, with a sample row in the initial phone viewport. |
| F-3-2 | Privacy, offline, and exact price facts are all on the first screen. |
| F-3-3 | Unsupported 1,000–10,000-file language is absent. |
| F-3-4 | Browser capability language is conditional. |
| F-3-5 | Date language states what Triagebox records and does not promise. |
| F-3-6 | README says Node 22 is verified, not required. |
| F-3-7 | Exact-match plan import is implemented and tested. |
| F-3-8 | User task copy no longer uses “survey.” |
| F-3-9 | The empty “Ready.” status is absent. |
| F-3-10 | Coordinate/numbered lore labels are absent. |
| F-3-11 | The vague “safety controls” tier claim is absent. |
| F-3-12 | The error route says “Page not found.” |
| F-3-13 | Primary navigation says “Review files.” |
| F-3-14 | The README documentation heading is concrete. |
| F-3-15 | Reset, bulk actions, and new-folder reset keep focus off `BODY`. |
| F-3-16 | Every route header includes Demo, Review files, Upgrade, and Privacy. |
| RB-01 to RB-05 | Unchecked defaults, displayed-row scope, persistence, imported receipt export, and retryable undo each retain a passing dedicated test. |
| V1-claims, V1-demo, V1-announcements, V1-touch, V1-security, V1-routing, V1-cache, V1-metadata, V1-three-steps, FINAL-MOBILE | The current live suite, metadata/crawl checks, request logs, and mobile screenshot reconfirm all listed conditions. |

## Structure, accessibility, routing, and identity

PASS. `/`, `/demo`, `/privacy/`, and `/terms/` returned 200; the unknown route
returned the designed HTTP 404. Each route has one h1 and main landmark, a
route-appropriate title, description, canonical, OG/Twitter metadata, favicon,
and touch icon. The shared header/footer, skip link, route focus management,
and polite route announcement are present.

The discovered internal URLs returned 200. The GitHub source URL returned 200.
The Sociobot checkout URL returned a 303 to a 200 Dodo-hosted checkout page.
`robots.txt` and `sitemap.xml` are present and list the public routes.

The full 52-test live browser run passed on desktop and mobile, including axe
serious/critical checks and mobile target/overflow checks. The visual system is
distinct rather than a generic SaaS template: field-paper palette, contour-map
art, survey-mark shape language, and ledger-like sample review all match
`.factory/design.md` and remain legible on the phone.

## Missed leverage

No finding. The implied high-value workflow is present: folder scan, editable
review, plan import/export, receipt export, collision-safe move, and undo. An
AI classifier or cloud sync is not implied by this deterministic local-first
job and would weaken its privacy boundary if added decoratively.

## What would make this perfect

Maintain this result by keeping the one-click demo, exact copy audit, and each
claim test in the release gate whenever copy, storage, routing, or file-move
behavior changes. No additional feature or copy change is requested from this
review.
