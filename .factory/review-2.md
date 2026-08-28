# Adversarial first-read review 2 — Triagebox

Date: 2026-08-28 UTC
Live URL: <https://local-file-triage.sociobot.in>
Reviewed commit: `7e276d8d7dee135fd616321ca7eea8cb675de116`

## Verdict: FAIL

Four findings remain. Two are blocking: on a cold 390 px visit an automatic
offline toast covers a required first-screen fact, and the product continues to
use the unexplained word “routes” for proposed file destinations. Two additional
claim/documentation gaps remain. All declared claim commands passed; the failure
is from the live presentation and unlisted promises, not a failed declared test.

## Cold first read

Fresh Chromium contexts, with no prior storage, loaded `/` at 390×844 and
1440×900 before scrolling.

| Question | Answer from the first screen | Result |
| --- | --- | --- |
| What does it do? | It surveys a folder and lets me approve each file move. | Clear. |
| For whom? | “For people cleaning a messy folder.” | Clear. |
| What should I click first? | **Try it with sample data**; “See five routes. Nothing is saved.” says what follows. | Clear. |

The primary action was at y=504–550 on phone and y=644–691 on desktop. There
was no horizontal overflow and no console error on normal routes. The cold-read
questions therefore pass, subject to the mobile obstruction in F-2-1.

## Findings

### Blocking

#### F-2-1 — The cold mobile update toast obscures the required third first-screen fact

- **Quote/location:** fixed toast, “Triagebox is ready offline. Refresh to update
  the app.” On a fresh 390×844 live load it occupied y=746–824 while the hero
  facts occupied y=640–760. It covered the **Receipt / JSON + CSV** fact.
- **Why this fails:** the first screen is required to show three plain facts.
  The toast arrives automatically, has no dismissal control, and hides part of
  that required content for roughly six seconds. It also visually fills almost
  the full phone width, interrupting a visitor who has not asked for an update.
- **Concrete fix:** do not show an update toast for the initial service-worker
  install; reserve it for a genuinely newer waiting worker. On mobile, position
  any transient notice where it cannot overlap content, or make it a dismissible
  in-flow status. Add a 390×844 cold-load test that asserts the toast rectangle
  does not intersect the three hero facts.

#### F-1-20 (regressed) — “Routes” still replaces the documented product word, “proposed destination”

- **Quote/location:** landing action result, “See five routes. Nothing is
  saved.” Demo banner, “Sample routes stay separate from your local survey.”
  Workbench uses “Filter routes”, “0 routes approved”, and “No routes match this
  search.” Terms says “reviewing each route.” The terminology table says the
  product word is **proposed destination**.
- **Why this fails:** a route normally means a navigation path or journey. Here
  it means a file’s proposed destination or an approved move. A first-time
  visitor must translate between “where each file will go”, “destination”, and
  “route”; this is the same terminology failure recorded as F-1-20, only reduced
  rather than removed.
- **Concrete fix:** choose one plain noun throughout. For example, replace the
  hero result with “See five proposed file destinations. Nothing is saved.” and
  use “Filter proposed destinations” and “0 file moves approved” in the
  workbench. Update the terms and `.factory/copy-audit.md` terminology table,
  then add a copy regression check that rejects user-facing `route`/`routes`
  outside literal URL/404 contexts.

#### F-2-2 — JSON receipt export is a landing and README promise without its own observable claim

- **Quote/location:** landing fact, “Receipt / JSON + CSV”; README, “Each run
  can export JSON and CSV receipts and can be undone without overwriting an
  existing original path.”
- **Why this fails:** `receipt-csv` only claims “Receipts export as CSV.”
  `imported-receipt-export` checks that the **Export JSON** button is visible,
  not that a JSON file downloads and contains the receipt. The real-file
  locality test clicks the button but does not observe its download. The JSON
  half of the visitor-facing export promise has no claims entry as required.
- **Concrete fix:** add `receipt-json` to `.factory/claims.json` and a tagged
  Playwright test that performs a real/sample move, waits for the JSON download,
  parses it, and asserts its receipt actions. Alternatively remove JSON from all
  user-facing export promises.

#### F-2-3 — README promises installability without a listed claim or sandbox test

- **Quote/location:** README, “You can install the app, and it reloads offline
  after your first visit.”
- **Why this fails:** `offline-reload` proves only a controlled-page reload
  offline. It does not prove the distinct “You can install the app” promise.
  No registry entry covers installability, manifest eligibility, or the
  installation path.
- **Concrete fix:** either split and remove “You can install the app”, or add an
  `installable` claim with an observable Chromium installability/PWA-manifest
  check from a clean context. Keep the existing offline reload claim separate.

### Minor

#### F-2-4 — The shipped copy-audit record is not the required complete audit

- **Quote/location:** `.factory/copy-audit.md` lists nine first-screen units and
  seven control units, then summarizes the README instead of listing its
  sentences. It omits live text such as “Triagebox is ready offline. Refresh to
  update the app.” and most footer, upgrade, and README copy.
- **Why this fails:** the plain-words contract requires every landing and README
  sentence with a word count. The existing summary cannot detect a later
  reintroduction of “routes” or an overlong sentence.
- **Concrete fix:** regenerate `.factory/copy-audit.md` from rendered landing
  copy and README, with one row per sentence/control and its word count; include
  a terminology table and recorded flags.

## Complete copy audit

Counts treat hyphenated compounds and product names as one word. Labels,
buttons, headings, and standalone status text are included as copy units. No
unit exceeds 22 words. `route/routes` is flagged by F-1-20; the remaining
terms are plain, and no supplied banned marketing adjective appears.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to main content | 5 | Clear link |
| Triagebox | 1 | Brand |
| Demo | 1 | Clear nav label |
| Workbench | 1 | Product section name |
| Upgrade | 1 | Clear nav label |
| Organize files locally | 3 | Plain job |
| No uploads | 2 | `real-file-locality` |
| Survey the folder. | 3 | Plain headline |
| Approve every move. | 3 | Plain headline |
| For people cleaning a messy folder, Triagebox shows where each file will go before it moves. | 16 | Plain audience/result |
| Try it with sample data | 5 | Clear primary action |
| See five routes. | 3 | F-1-20 |
| Nothing is saved. | 3 | `demo-sandbox` |
| File details | 2 | Clear fact label |
| Stay in this browser | 4 | `real-file-locality` |
| Method | 1 | Clear fact label |
| Copy · verify · remove | 3 | `reversible-move` |
| Receipt | 1 | Clear fact label |
| JSON + CSV | 2 | F-2-2 |
| See every proposed destination before moving a file. | 8 | Clear caption |
| Ready. | 1 | Status |
| No folder permission requested yet. | 5 | `permission-on-action` |
| Local / file details stay here | 5 | `real-file-locality` |
| Choose and review a folder | 5 | Clear section label |
| Open one folder. | 3 | Clear empty state |
| Nothing moves yet. | 3 | `approval-required` |
| After you choose a folder, Triagebox suggests a destination from each file’s type and year. | 15 | `permission-on-action`; `deterministic-routes` |
| Choose a folder | 3 | Result-naming action |
| Preview a folder | 3 | Result-naming action |
| Undo from receipt | 3 | Result-naming action |
| Try the five-file sample | 4 | Clear sample action |
| How review-before-move works | 4 | Clear heading |
| Survey | 1 | Step label |
| Choose one local folder. | 4 | Clear step |
| Review | 1 | Step label |
| Check each destination you want. | 5 | Clear step |
| Move | 1 | Step label |
| Copy, verify, then keep a receipt. | 6 | Clear step |
| Optional Pro license | 3 | Clear label |
| Remove the 100-file move limit | 6 | Clear heading |
| Free includes surveys, editing, exports, undo, and 100 moves per run. | 11 | `free-limit` |
| A $19 one-time Triagebox Pro license removes the per-run limit. | 10 | `free-limit` |
| Your safety controls stay free. | 5 | Tier statement, covered by free-tier context |
| Buy Pro on Sociobot/Dodo · $19 | 5 | Result-naming external action |
| Opens in a new site | 5 | External-link disclosure |
| Have a license? | 3 | Clear disclosure |
| Restore it | 2 | Clear action |
| License token | 2 | Clear label |
| Verify license | 2 | Result-naming action |
| Checkout opens on Sociobot/Dodo. | 4 | `checkout-origin` |
| See terms and privacy. | 4 | Clear links |
| Review file moves before they happen. | 6 | Clear footer line |
| Privacy | 1 | Clear link |
| Terms | 1 | Clear link |
| View source on GitHub | 4 | Clear external link |
| Map artwork generated for Triagebox · 2026 · v1.0.1 · build 7e276d8 | 9 | Provenance |
| Triagebox is ready offline. | 4 | `offline-reload` |
| Refresh to update the app. | 5 | Also causes F-2-1 obstruction |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Triagebox organizes messy folders after you review every proposed move. | 10 | Plain opening |
| It lists files in nested folders and suggests a destination by type and year. | 14 | `recursive-inventory`; `deterministic-routes` |
| You review each suggestion before moving files. | 7 | `approval-required` |
| Each run can export JSON and CSV receipts and can be undone without overwriting an existing original path. | 18 | F-2-2; `reversible-move` |
| Live product: local-file-triage.sociobot.in | 3 | Link |
| Open /demo or choose Try it with sample data. | 9 | Clear demo instruction |
| The five-file sample is isolated from your saved local survey. | 10 | `demo-sandbox` |
| Reset demo restores the sample. | 4 | `demo-sandbox` |
| Start for real returns to your separate survey. | 9 | `demo-sandbox` |
| Details are in .factory/demo.md. | 4 | Documentation link |
| For people cleaning or migrating folders with 1,000–10,000 files. | 9 | Clear audience |
| File details stay in your browser, and nothing moves without review. | 10 | `real-file-locality`; `approval-required` |
| Triagebox asks for folder access only after you choose a folder. | 10 | `permission-on-action` |
| File type and modified year choose each proposed destination. | 9 | `deterministic-routes` |
| The editable plan does nothing until you approve a specific run. | 10 | `approval-required` |
| For each move, Triagebox copies bytes, checks the destination size, then removes the source. | 12 | `reversible-move` |
| Name collisions receive (2), (3), and so on. | 8 | `reversible-move` |
| Nothing is overwritten. | 3 | `reversible-move` |
| The receipt records original and destination paths, byte size, original timestamp, outcome, and errors. | 13 | `receipt-original-timestamp` |
| Undo uses the same copy, check, and remove sequence in reverse. | 11 | `undo-retry`; `reversible-move` |
| Browser file APIs cannot restore a copied file’s modified date. | 10 | Honest platform limit |
| Keep a separate backup during important migrations. | 7 | Safety advice |
| Desktop folder choice is available in current Chrome or Edge. | 10 | `browser-capabilities` |
| Other browsers and mobile devices can preview a folder and export a plan. | 12 | `browser-capabilities` |
| Your last survey and receipt use IndexedDB. | 8 | `storage-boundary` |
| The demo uses demo:latest; real work uses latest. | 7 | `storage-boundary` |
| The optional Pro token and its check result use namespaced localStorage keys. | 12 | `storage-boundary` |
| There are no analytics, third-party scripts, or CDN fonts. | 9 | `no-tracking-runtime` |
| You can install the app, and it reloads offline after your first visit. | 12 | F-2-3; `offline-reload` only |
| Read the full privacy policy and terms. | 7 | Clear links |
| The free tier includes surveys, per-file review and edits, exports, undo, and 100 file moves per run. | 17 | `free-limit` |
| Triagebox Pro is a $19 one-time license that removes the per-run limit. | 12 | `free-limit` |
| Checkout opens a page hosted by Sociobot/Dodo. | 7 | `checkout-origin` |
| License checks use the Sociobot billing API. | 7 | `checkout-origin` |
| Requires Node.js 22+. | 3 | Developer prerequisite |
| npm test runs unit tests, builds production output, then runs Chromium desktop and mobile checks. | 15 | Developer documentation |
| Playwright 1.58.2 is pinned for the factory image. | 8 | Developer documentation |
| The static deployment root is dist/, with dist/index.html at its root. | 12 | Deployment documentation |
| Product and visual decisions: .factory/design.md. | 5 | Documentation link |
| Observable product claims and regression commands: .factory/claims.json. | 7 | Documentation link |
| Build handoff: .factory/handoff.md. | 4 | Documentation link |
| License: MIT. | 2 | License statement |

## Demo, sandbox, and privacy checks

- **PASS:** `/demo` was reachable in one click and directly. Its first rendered
  product screen contained five realistic named files—camera photo, contract,
  voice note, archive, and text note—with type, year, size, and editable
  destinations.
- **PASS:** the banner was present: “Demo — sample data, nothing is saved,” with
  **Reset demo** and **Start for real**. After an edit and approval, reset
  restored five unapproved sample rows and the default destination.
- **PASS:** the declared demo test seeds a real `latest` record and confirms it
  is invisible at `/demo`; code uses distinct `demo:latest` and `latest`
  IndexedDB records.
- **PASS:** a fresh live demo trace contained only
  `https://local-file-triage.sociobot.in` requests. The full local claim suite
  separately checks real preview/move/export/undo request locality and offline
  reload.

## Declared claims

A new clone at `/tmp/triagebox-review-2-EhcyVc` was created from the reviewed
commit. `npm ci`, `npm run build`, the full `npm test` suite (8 Vitest + 40
desktop/mobile Playwright tests), and every exact registry command passed. The
preview server was held open while Playwright ran; an initial automatic
web-server race was rerun successfully and is not a product-test failure.

| Claim IDs whose exact listed commands passed |
| --- |
| demo-sandbox; approval-required; displayed-bulk-controls; review-persistence; imported-receipt-export |
| undo-retry; local-only; offline-reload; deterministic-routes; reversible-move; receipt-csv |
| real-file-locality; browser-capabilities; storage-boundary; no-tracking-runtime; free-limit |
| checkout-origin; permission-on-action; receipt-original-timestamp; recursive-inventory |

F-2-2 and F-2-3 are unlisted promises, so passing those declared commands does
not convert the claim gate to PASS.

## History re-check

All earlier `.factory/review-*.md`, `.factory/polish-*.md`, `.factory/handoff.md`,
and both verification reports were read. The independent-verification issues
RB-01 through RB-05 are fixed in the live product and tests: proposals start
unchecked; bulk approval is scoped to displayed rows; edits persist; imported
receipts remain exportable; and blocked undo can retry. Earlier F-1-1 through
F-1-19 and F-1-21 through F-1-30 are confirmed fixed by the current registry,
live DOM, metadata, and tests. F-1-20 is not fully fixed and is re-opened above.

## Structure, crawl, accessibility, and identity

- **PASS:** `/`, `/demo`, `/privacy/`, and `/terms/` return 200; their titles,
  meta descriptions, canonicals, OG/Twitter metadata, favicon/touch icon,
  `lang=en`, one h1, and one main were present. `/does-not-exist` returned the
  designed 404 with HTTP 404.
- **PASS:** browser Back restored the route and focused/announced the new h1 in
  the local suite. Headers and footers were consistent; the skip link, legal
  links, and external-link labels were present.
- **PASS:** every discovered internal link returned 200; checkout followed from
  Sociobot to a 200 Dodo-hosted page, and GitHub returned 200.
- **PASS:** the clean-clone suite’s axe checks report zero serious/critical
  WCAG A/AA violations. Live normal routes had no console errors or overflow.
  The expected browser console entry for a deliberately requested 404 is not
  counted as a normal-route error.
- **PASS:** the field-paper contour-map art, restrained palette, asymmetrical
  map figure, and survey-ledger layout match `design.md` and are distinct from a
  generic SaaS template. The first-load JS is 11.72 kB gzip.

## Missed leverage

No finding. The product already supplies the expected high-value local workflow:
folder preview, editable proposals, plan/receipt export, undo, and an isolated
demo. AI classification or sync would weaken the deliberate local-first,
deterministic, review-before-move model and is not implied by the documented
job.

## What would make this perfect

Make the cold mobile screen unobstructed; use one concrete word for a proposed
file destination throughout; register observable JSON-export and installability
claims (or remove those promises); and complete the committed copy audit. Then
rerun the fresh-clone suite, every exact claim command, phone/desktop cold reads,
demo reset/isolation, request tracing, offline reload, route crawl, and axe.
Only a rerun with zero findings merits PASS.
