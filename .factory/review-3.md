# Adversarial first-read review 3 — Triagebox

Date: 2026-08-28 UTC

Live URL: <https://local-file-triage.sociobot.in>

Reviewed commit: `7e6790d0571fe2e6ccd4b8f3fec61dc43c419e78`

## Verdict: FAIL

There are 18 findings: four blocking, six major, and eight minor. The cold
landing screen is clear, all 22 declared claim commands pass, and the demo data
is genuinely isolated. The release still fails because the first screen after
the demo click contains no product rows, the 404 still does not use the same
header navigation, and the committed copy audit is not an exact record of the
live copy. Quantitative and compatibility statements in the README also remain
outside the claims registry.

## Cold first read

Fresh Chromium contexts with empty browser storage opened `/` at 390×844 and
1440×900. These notes were recorded before scrolling.

| Question | Answer from the first screen | Result |
| --- | --- | --- |
| What does this do? | It proposes where files in a messy folder should go and requires approval before moving them. | PASS |
| For whom? | “For people cleaning a messy folder.” | PASS |
| What should I click first? | **Try it with sample data**. The adjacent copy says it will show five proposed destinations and save nothing. | PASS |

The exact h1 was “Survey the folder. Approve every move.” The exact audience
sentence was “For people cleaning a messy folder, Triagebox shows where each
file will go before it moves.” The primary action began at y=504 px on mobile
and y=644 px on desktop. All three current fact blocks ended at y=760 px on
mobile and y=799 px on desktop. There was no horizontal overflow, automatic
update notice, console error, or third-party request.

The three first-read questions pass. F-3-2 separately records that the fact
blocks do not use the mandatory privacy/offline/price set.

## Findings

### Blocking

#### F-3-1 — The one-click demo opens another marketing screen, not the product in use

- **Quote/location:** after activating **Try it with sample data** at 390×844,
  the first viewport shows the demo banner, “Survey the folder. Approve every
  move.”, the audience sentence, and the same demo action again. No sample file
  or proposed destination is visible.
- **Evidence:** the five `.file-row` elements exist, but the workbench begins at
  y=1539 and the first sample row begins at y=2397. The page remains at
  `scrollY=0`, with focus on the repeated hero h1.
- **Why this fails:** the supplied demo contract requires the first screen after
  the click to already look like the product being used. A phone visitor must
  scroll about three viewports before seeing the first realistic record.
- **Concrete fix:** make `/demo` a route-specific product screen. Keep the
  persistent banner, use an h1 such as “Review five sample file destinations”,
  and place the summary, filters, and first rows in the initial viewport. Add a
  390×844 test that clicks the landing action and asserts a realistic sample row
  intersects the viewport without scripted scrolling.

#### F-1-12 (partly fixed) — The designed 404 still does not use the shared header

- **Quote/location:** normal routes show `Demo · Workbench · Upgrade`; the live
  404 shows `Demo · Privacy · Terms`.
- **Why this fails:** F-1-12 required the 404 to use the standard site shell.
  It now has a header and footer, but its header is separate markup with
  different destinations. The required history rule makes a partially fixed
  earlier finding blocking again under the same ID.
- **Concrete fix:** generate the 404 from the same header/footer source as the
  other routes, or add a regression assertion that the ordered accessible
  header and footer links match across `/`, `/demo`, `/privacy/`, `/terms/`,
  and the HTTP 404 document.

#### F-2-4 (regressed) — The committed copy audit is not an exact landing-page audit

- **Quote/location:** `.factory/copy-audit.md` records “Local / file details
  stay here” (5 words), while the live page says “51.000° LOCAL / FILE DETAILS
  STAY HERE” (6 words). It also drops the visible `02 /` prefix from “02 /
  CHOOSE AND REVIEW A FOLDER” and substitutes `[commit]` for the rendered build
  ID. Several counts are also wrong: “Skip to main content” is 4 words, not 5;
  “Reset demo restores the sample” is 5, not 4; and the copy/verify/remove
  README sentence is 14, not 12.
- **Why this fails:** F-2-4 required every copy unit with an exact count. The
  normalized table hides the decorative wording that this review flags, so it
  cannot serve as the promised regression record. The history rule makes the
  regression blocking under the same ID.
- **Concrete fix:** generate the audit from the rendered cold DOM and README,
  preserve exact strings, include conditional demo/update copy separately, and
  make a test fail when the DOM and committed audit differ.

#### F-3-15 — Workbench rerenders discard keyboard focus

- **Quote/location:** after keyboard activation of **Reset demo** or **Approve
  displayed (5)**, `document.activeElement` becomes `BODY`.
- **Why this fails:** the earlier independent verification recorded that full
  rerenders drop focus. It remains reproducible live. A keyboard or screen-reader
  user is returned to the start of the document after common actions and must
  navigate through the page again.
- **Concrete fix:** preserve the triggering control's logical key across
  `render()`, then restore focus to the equivalent new control. For reset, focus
  the reset control or announced result. Add keyboard tests for reset, bulk
  approve/clear, new scan, and other rerendering actions that assert focus never
  falls to `BODY`.

### Major

#### F-3-2 — The first screen omits the required offline and price facts

- **Quote/location:** the three hero facts are “File details / Stay in this
  browser”, “Method / Copy · verify · remove”, and “Receipt / JSON + CSV”.
- **Why this fails:** the mandatory first-screen shape calls for three short
  privacy, offline, and price facts. Offline behavior and the free/Pro boundary
  are only discoverable later.
- **Concrete fix:** use the already tested facts: “Files stay in this browser”,
  “Works offline after the first visit”, and “Free: 100 moves per run · Pro:
  $19 once”. Move method and receipt details into the product preview.

#### F-3-3 — The 1,000–10,000-file audience is an unlisted quantitative claim

- **Quote/location:** README, “For people cleaning or migrating folders with
  1,000–10,000 files.”
- **Why this fails:** no `.factory/claims.json` entry asserts a 10,000-file scan
  or usable review state. A numeric range implies supported scale.
- **Concrete fix:** either write “For people cleaning or migrating folders,” or
  add a `ten-thousand-file-preview` claim that inventories 10,000 nested files,
  checks pagination and editing, and defines an observable completion limit.

#### F-3-4 — The named Chrome/Edge compatibility statement exceeds its test

- **Quote/location:** README, “Desktop folder choice is available in current
  Chrome or Edge.”
- **Why this fails:** `browser-capabilities` tests Chromium with the API present
  and absent. It does not run current Edge or establish a browser-version
  support statement. The registry claim is conditional—“when supported”—but
  the README is categorical.
- **Concrete fix:** write “Writable folder choice appears when your browser
  supports it,” or add a maintained Edge/browser-version matrix test and align
  the registry claim with the named-browser promise.

#### F-3-5 — The modified-date limitation is an unlisted claim

- **Quote/location:** README and Terms, “Browser file APIs cannot restore a
  copied file’s modified date.”
- **Why this fails:** this is a platform statement a user may rely on, but no
  claim entry tests it. `receipt-original-timestamp` proves only that the old
  timestamp is recorded.
- **Concrete fix:** state the product behavior instead: “Triagebox records the
  original date in the receipt; it does not promise to preserve the copied
  file’s modified date.” Add a fixture test if the copy continues to promise a
  specific copied-file outcome.

#### F-3-6 — The Node.js minimum is an unlisted compatibility claim

- **Quote/location:** README, “Requires Node.js 22+.”
- **Why this fails:** `package.json` has no `engines` field and no registered
  version-matrix test establishes 22 as the minimum. Contributors cannot tell
  whether older versions fail or were merely not checked.
- **Concrete fix:** add `engines.node`, CI for the documented minimum, and a
  matching claim/test, or write “Development is verified with Node.js 22.”

#### F-3-7 — Exported plans cannot be imported into the browser that can move files

- **Quote/location:** the product says unsupported browsers can “preview a
  folder and export a plan,” but the only import action is **Undo from receipt**.
- **Why this fails:** a person can review and export on one device/browser but
  cannot resume that work in desktop Chrome/Edge. They must scan again and redo
  every approval and edit.
- **Concrete fix:** add **Import plan JSON**. After explicit folder selection,
  validate schema, relative paths, sizes, and timestamps; leave mismatches
  unapproved; restore edits and approvals; and require the existing move
  confirmation. Keep it local and add a demo fixture plus a claims entry. An AI
  feature or sync is not justified for this deterministic local workflow.

### Minor

#### F-3-8 — “Survey” is cartography language, not the user’s file task

- **Quote/location:** “Survey the folder”, step label “Survey”, “Choose one
  local folder”, “Your last survey”, and “Free includes surveys”.
- **Why this fails:** the word comes from the visual metaphor. People normally
  choose, scan, or review a folder; “survey” makes them translate the brand
  language before understanding the action.
- **Concrete fix:** use “Organize a folder after reviewing every move” for the
  h1, “Choose” for step 1, and “saved folder review” where persistence is meant.

#### F-3-9 — “Ready.” tells the visitor nothing

- **Quote/location:** landing status, “Ready.”
- **Why this fails:** it gives no state, result, or next action.
- **Concrete fix:** delete it and retain the useful sentence: “No folder
  permission requested yet.”

#### F-3-10 — Coordinate and numbered map labels are decorative lore

- **Quote/location:** “51.000° LOCAL / FILE DETAILS STAY HERE” and “02 / CHOOSE
  AND REVIEW A FOLDER”.
- **Why this fails:** the invented coordinate and unexplained section number
  communicate the map theme, not product information.
- **Concrete fix:** use “File details stay in this browser” and “Choose and
  review a folder” without decorative prefixes.

#### F-3-11 — “Your safety controls stay free” is vague and redundant

- **Quote/location:** upgrade section, “Your safety controls stay free.”
- **Why this fails:** “safety controls” is undefined, and the preceding sentence
  already lists the free functions. It also broadens the price promise without
  naming what remains free.
- **Concrete fix:** delete the sentence, or write “Review, receipt export, and
  undo stay free” and map that exact promise to tests.

#### F-3-12 — The 404 headline is a metaphor instead of an error name

- **Quote/location:** “Map edge” and “This route is not on the map.”
- **Why this fails:** a heading should identify the page without requiring the
  cartography theme.
- **Concrete fix:** use “Page not found” and “This address does not exist. Open
  Triagebox or try the sample.”

#### F-3-13 — “Workbench” is an abstract navigation label

- **Quote/location:** primary navigation, **Workbench**.
- **Why this fails:** it does not name the destination’s task for a first-time
  visitor.
- **Concrete fix:** rename it **Choose a folder** or **Review files**.

#### F-3-14 — “Project notes” does not identify the README section

- **Quote/location:** README heading, “Project notes”.
- **Why this fails:** the section contains design, claims, and handoff links;
  “notes” does not identify that content out of context.
- **Concrete fix:** rename it “Product documentation”.

#### F-3-16 — Normal-route headers omit the required Privacy link

- **Quote/location:** `/`, `/demo`, `/privacy/`, and `/terms/` show `Demo ·
  Workbench · Upgrade` in the primary header; Privacy appears only in the
  footer. The 404 has Privacy but a different header, as recorded in F-1-12.
- **Why this fails:** the standard site skeleton calls for Privacy in the
  consistent primary header, within a maximum of four navigation links.
- **Concrete fix:** use one header on every route with `Demo · Review files ·
  Upgrade · Privacy`; keep Terms in the shared footer and verify the 390 px
  layout and 44 px targets.

## Complete copy audit

Counts treat hyphenated compounds, URLs, paths, and product names as one word.
The landing table includes headings, labels, controls, and conditional update
copy because those units are also subject to the supplied plain-words rules. No
unit exceeds 22 words and none contains a supplied banned marketing word.

### Live landing page

| Exact copy unit | Words | Audit |
| --- | ---: | --- |
| Skip to main content | 4 | OK |
| Triagebox | 1 | Brand |
| Demo | 1 | OK |
| Workbench | 1 | F-3-13 |
| Upgrade | 1 | OK |
| Organize files locally · No uploads | 5 | `real-file-locality` |
| Survey the folder. | 3 | F-3-8 |
| Approve every move. | 3 | `approval-required` |
| For people cleaning a messy folder, Triagebox shows where each file will go before it moves. | 16 | OK |
| Try it with sample data | 5 | OK action; F-3-1 after activation |
| See five proposed destinations. | 4 | OK |
| Nothing is saved. | 3 | `demo-sandbox` |
| File details | 2 | OK label |
| Stay in this browser | 4 | `real-file-locality` |
| Method | 1 | OK label |
| Copy · verify · remove | 3 | `reversible-move` |
| Receipt | 1 | OK label |
| JSON + CSV | 2 | `receipt-json`; `receipt-csv` |
| See every proposed destination before moving a file. | 8 | `approval-required` |
| Ready. | 1 | F-3-9 |
| No folder permission requested yet. | 5 | `permission-on-action` |
| 51.000° LOCAL / FILE DETAILS STAY HERE | 6 | F-3-10 |
| 02 / CHOOSE AND REVIEW A FOLDER | 6 | F-3-10 |
| Open one folder. | 3 | OK |
| Nothing moves yet. | 3 | `approval-required` |
| After you choose a folder, Triagebox suggests a destination from each file’s type and year. | 15 | `permission-on-action`; `deterministic-routes` |
| Choose a folder | 3 | OK action |
| Preview a folder | 3 | OK action |
| Undo from receipt | 3 | OK action |
| Try the five-file sample | 4 | OK action |
| How review-before-move works | 3 | OK heading |
| Survey | 1 | F-3-8 |
| Choose one local folder. | 4 | OK |
| Review | 1 | OK step heading |
| Check each destination you want. | 5 | `approval-required` |
| Move | 1 | OK step heading |
| Copy, verify, then keep a receipt. | 6 | `reversible-move` |
| Optional Pro license | 3 | OK heading |
| Remove the 100-file move limit | 5 | `free-limit` |
| Free includes surveys, editing, exports, undo, and 100 moves per run. | 11 | F-3-8; tested functions |
| A $19 one-time Triagebox Pro license removes the per-run limit. | 10 | `free-limit` |
| Your safety controls stay free. | 5 | F-3-11 |
| Buy Pro on Sociobot/Dodo · $19 | 5 | `checkout-origin` |
| Opens in a new site | 5 | OK disclosure |
| Have a license? | 3 | OK |
| Restore it | 2 | OK in context |
| License token | 2 | OK label |
| Verify license | 2 | OK action |
| Checkout opens on Sociobot/Dodo. | 4 | `checkout-origin` |
| See terms and privacy. | 4 | OK |
| Review file moves before they happen. | 6 | OK footer description |
| Privacy | 1 | OK |
| Terms | 1 | OK |
| View source on GitHub | 4 | OK; external destination is in its accessible name |
| Map artwork generated for Triagebox · 2026 · v1.0.2 · build 7e6790d | 9 | Informative provenance |
| A newer Triagebox version is ready. | 6 | Conditional update notice |
| Refresh to update the app. | 5 | Conditional update instruction |
| Dismiss | 1 | Conditional notice action |
| Triagebox — organize files locally | 4 | Polite route announcement |

### README headings

| Heading | Words | Audit |
| --- | ---: | --- |
| Triagebox | 1 | Repository title |
| Try the sample | 3 | OK |
| Who it is for | 4 | OK |
| Safety model | 2 | Names the section |
| Browser support and privacy | 4 | OK |
| Free and Pro | 3 | OK |
| Develop and verify | 3 | OK |
| Project notes | 2 | F-3-14 |

### README sentences

| Exact sentence or control | Words | Audit |
| --- | ---: | --- |
| Triagebox organizes messy folders after you review every proposed move. | 10 | OK |
| It lists files in nested folders and suggests a destination by type and year. | 14 | `recursive-inventory`; `deterministic-routes` |
| You review each suggestion before moving files. | 7 | `approval-required` |
| Each run can export JSON and CSV receipts and can be undone without overwriting an existing original path. | 18 | `receipt-json`; `receipt-csv`; `reversible-move` |
| Live product: local-file-triage.sociobot.in | 3 | OK link |
| Open /demo or choose Try it with sample data. | 9 | OK instruction |
| The five-file sample is isolated from your saved local survey. | 10 | `demo-sandbox`; F-3-8 terminology |
| Reset demo restores the sample. | 5 | `demo-sandbox` |
| Start for real returns to your separate survey. | 8 | `demo-sandbox`; F-3-8 terminology |
| Details are in .factory/demo.md. | 4 | OK link |
| For people cleaning or migrating folders with 1,000–10,000 files. | 9 | F-3-3 |
| File details stay in your browser, and nothing moves without review. | 11 | `real-file-locality`; `approval-required` |
| Triagebox asks for folder access only after you choose a folder. | 11 | `permission-on-action` |
| File type and modified year choose each proposed destination. | 9 | `deterministic-routes` |
| The editable plan does nothing until you approve a specific run. | 11 | `approval-required` |
| For each move, Triagebox copies bytes, checks the destination size, then removes the source. | 14 | `reversible-move` |
| Name collisions receive (2), (3), and so on. | 8 | `reversible-move` |
| Nothing is overwritten. | 3 | `reversible-move` |
| The receipt records original and destination paths, byte size, original timestamp, outcome, and errors. | 14 | `receipt-json`; `receipt-original-timestamp` |
| Undo uses the same copy, check, and remove sequence in reverse. | 11 | `undo-retry`; `reversible-move` |
| Browser file APIs cannot restore a copied file’s modified date. | 10 | F-3-5 |
| Keep a separate backup during important migrations. | 7 | Advice |
| Desktop folder choice is available in current Chrome or Edge. | 10 | F-3-4 |
| Other browsers and mobile devices can preview a folder and export a plan. | 13 | `browser-capabilities`; F-3-7 leverage |
| Your last survey and receipt use IndexedDB. | 7 | `storage-boundary`; F-3-8 terminology |
| The demo uses demo:latest; real work uses latest. | 8 | `storage-boundary` |
| The optional Pro token and its check result use namespaced localStorage keys. | 12 | `storage-boundary` |
| There are no analytics, third-party scripts, or CDN fonts. | 9 | `no-tracking-runtime` |
| Supporting browsers receive the manifest and service worker needed to install Triagebox. | 12 | `installable` |
| The app reloads offline after your first visit. | 8 | `offline-reload` |
| Read the full privacy policy and terms. | 7 | OK links |
| The free tier includes surveys, per-file review and edits, exports, undo, and 100 file moves per run. | 17 | `free-limit` and feature claims; F-3-8 terminology |
| Triagebox Pro is a $19 one-time license that removes the per-run limit. | 12 | `free-limit` |
| Checkout opens a page hosted by Sociobot/Dodo. | 7 | `checkout-origin` |
| License checks use the Sociobot billing API. | 7 | `checkout-origin` |
| Requires Node.js 22+. | 3 | F-3-6 |
| npm test runs unit tests, builds production output, then runs Chromium desktop and mobile checks. | 15 | Confirmed in this review |
| Playwright 1.58.2 is pinned for the factory image. | 8 | Confirmed in `package.json` |
| The static deployment root is dist/, with dist/index.html at its root. | 11 | Confirmed by build |
| Product and visual decisions: .factory/design.md. | 5 | OK link |
| Observable product claims and regression commands: .factory/claims.json. | 7 | OK link |
| Build handoff: .factory/handoff.md. | 3 | OK link |
| License: MIT. | 2 | Confirmed by `LICENSE` |

## Demo, sandbox, privacy, and offline evidence

- **Presentation: FAIL.** F-3-1 records the offscreen product state.
- **Seed: PASS.** `/demo` contains five realistic records: camera photo,
  contract, voice note, archive, and note, with paths, sizes, years, editable
  names, and destinations.
- **Banner: PASS.** “Demo — sample data, nothing is saved”, **Reset demo**, and
  **Start for real** remain present.
- **Reset: PASS.** After approval, destination, and filename edits, reset
  restored five unchecked rows, `Photos`, and `IMG_4821.jpg`.
- **Isolation: PASS.** During demo, IndexedDB held separate `demo:latest` and
  `latest` records; the seeded `PRIVATE-tax-record.pdf` did not appear. Start
  for real removed `demo:latest` and retained `latest`.
- **Requests: PASS.** The live demo flow loaded only same-origin HTML, JS, CSS,
  icon, and hero art. There were no console or request failures.
- **Offline: PASS.** After service-worker control, live `/demo` reloaded with
  five rows and its banner under `context.setOffline(true)` with no failed
  request or console error.

## Declared claims

A clean clone at `/tmp/triagebox-review3-clean-t0g8Na` was created at the
reviewed commit. After `npm ci` and the required `npm run build` preview-server
prerequisite, every exact command in `.factory/claims.json` passed.

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS |
| `approval-required` | `npm run test:e2e -- --grep @claim:approval-required` | PASS |
| `displayed-bulk-controls` | `npm run test:e2e -- --grep @claim:displayed-bulk-controls` | PASS |
| `review-persistence` | `npm run test:e2e -- --grep @claim:review-persistence` | PASS |
| `imported-receipt-export` | `npm run test:e2e -- --grep @claim:imported-receipt-export` | PASS |
| `undo-retry` | `npm run test:unit -- -t @claim:undo-retry` | PASS |
| `local-only` | `npm run test:e2e -- --grep @claim:local-only` | PASS |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS |
| `deterministic-routes` | `npm run test:unit -- -t @claim:deterministic-routes` | PASS |
| `reversible-move` | `npm run test:unit -- -t @claim:reversible-move` | PASS |
| `receipt-csv` | `npm run test:unit -- -t @claim:receipt-csv` | PASS |
| `receipt-json` | `npm run test:e2e -- --grep @claim:receipt-json` | PASS |
| `real-file-locality` | `npm run test:e2e -- --grep @claim:real-file-locality` | PASS |
| `browser-capabilities` | `npm run test:e2e -- --grep @claim:browser-capabilities` | PASS, but F-3-4 exceeds its scope |
| `storage-boundary` | `npm run test:e2e -- --grep @claim:storage-boundary` | PASS |
| `no-tracking-runtime` | `npm run test:e2e -- --grep @claim:no-tracking-runtime` | PASS |
| `installable` | `npm run test:e2e -- --grep @claim:installable` | PASS |
| `free-limit` | `npm run test:e2e -- --grep @claim:free-limit` | PASS |
| `checkout-origin` | `npm run test:e2e -- --grep @claim:checkout-origin` | PASS |
| `permission-on-action` | `npm run test:e2e -- --grep @claim:permission-on-action` | PASS |
| `receipt-original-timestamp` | `npm run test:unit -- -t @claim:receipt-original-timestamp` | PASS |
| `recursive-inventory` | `npm run test:unit -- -t @claim:recursive-inventory` | PASS |

F-3-3, F-3-5, and F-3-6 are unlisted claims. F-3-4 is broader than its listed
test. Therefore the claims gate is not clean despite every declared command
passing.

## History re-check

Every earlier review, polish report, handoff, and verification report was read.
Each prior review finding was checked against both current source and the live
site.

| Earlier finding | Current result and evidence |
| --- | --- |
| F-1-1 | FIXED — `real-file-locality` passes; live requests are same-origin. |
| F-1-2 | FIXED — feature-present and feature-absent browser tests pass. |
| F-1-3 | FIXED — storage keys remain separate and demo exit deletes `demo:latest`. |
| F-1-4 | FIXED — `no-tracking-runtime` passes; live route requests are same-origin. |
| F-1-5 | FIXED — the 101-file free/Pro test and exact price pass. |
| F-1-6 | FIXED — checkout wording is observable; the link returns 200 through Sociobot to Dodo. |
| F-1-7 | FIXED — the picker remains untouched before the explicit action. |
| F-1-8 | FIXED — receipt JSON/CSV retain the exact original timestamp. |
| F-1-9 | FIXED — nested inventory test passes. |
| F-1-10 | FIXED — `/demo` title, description, canonical, OG, and Twitter metadata are route-specific. |
| F-1-11 | FIXED — Privacy and Terms have complete route-specific metadata. |
| F-1-12 | PARTLY FIXED — true 404 and complete metadata exist, but the header differs; reopened above. |
| F-1-13 | FIXED — demo navigation and browser Back focus the h1 and update the polite route announcement live. |
| F-1-14 | FIXED — checkout and GitHub links have external destinations in their accessible names, including the 404. |
| F-1-15 | FIXED — the PNG IHDR is 180×180 (`0x00b4` by `0x00b4`). |
| F-1-16 | FIXED — package/footer are v1.0.2 and the live build is `7e6790d`. |
| F-1-17 | FIXED — README opening is split and under 22 words. |
| F-1-18 | FIXED for length — the audience sentence is under 22 words; F-3-3 is a new quantitative-claim issue. |
| F-1-19 | FIXED — “Organize files locally” replaced “Private file cartography”. |
| F-1-20 | FIXED — destination terminology replaced user-facing route terminology outside the designed 404. |
| F-1-21 | FIXED for its quoted caption/update copy; new decorative labels are F-3-10/F-3-12. |
| F-1-22 | FIXED — the work section says “Choose and review a folder”; the remaining `02 /` is F-3-10. |
| F-1-23 | FIXED — the explanation names file type, year, and destination. |
| F-1-24 | FIXED — sample actions consistently say sample. |
| F-1-25 | FIXED — “How review-before-move works” names the mechanism. |
| F-1-26 | FIXED — “Optional Pro license” is plain. |
| F-1-27 | FIXED — the upgrade heading names the 100-file result. |
| F-1-28 | FIXED — README avoids unexplained “PWA”. |
| F-1-29 | FIXED at the quoted README opening; the navigation-label issue is new F-3-13. |
| F-1-30 | FIXED — user copy says receipt; manifest remains schema/code terminology. |
| F-2-1 | FIXED — no cold-install notice appears and all mobile facts remain unobstructed. |
| F-1-20 (review 2 regression) | FIXED — the terminology regression test passes. |
| F-2-2 | FIXED — `receipt-json` downloads and parses the completed receipt. |
| F-2-3 | FIXED — `installable` validates the manifest, icons, and controlling worker. |
| F-2-4 | REGRESSED — the audit normalizes and omits exact live text; reopened above. |

| Earlier verification finding | Current result and evidence |
| --- | --- |
| V1-claims / missing claims registry | FIXED — 22 unique registered claims; every exact command passes. |
| V1-demo / missing isolated demo | PARTLY FIXED — entry, seed, banner, reset, exit, and storage isolation pass; first-screen presentation fails as F-3-1. |
| RB-01 | FIXED — new proposals are unchecked; `approval-required` passes. |
| RB-02 | FIXED — displayed bulk controls leave row 101 unchanged. |
| RB-03 | FIXED — approval, bucket, and name edits survive reload. |
| RB-04 | FIXED — imported receipts remain visible and exportable. |
| RB-05 | FIXED — a blocked undo can be retried after removing the blocker. |
| V1-announcements | FIXED for async status announcements; rerender focus remains F-3-15. |
| V1-touch | FIXED — mobile controls and legal links retain tested 44 px targets. |
| V1-security | FIXED — CSP, frame, referrer, permissions, HSTS, and nosniff headers are live. |
| V1-routing | FIXED for deep links, Back, and HTTP status; shared 404 chrome remains F-1-12. |
| V1-cache | FIXED — hashed assets are immutable and manifest MIME is correct. |
| V1-metadata | FIXED — discovery metadata, social image, touch icon, and build label are present. |
| V1-three-steps | FIXED — Survey, Review, and Move remain an ordered list; “Survey” wording is F-3-8. |
| Missing `.factory/brief.json` observation | UNCHANGED, not a current finding: the repository contract says to read it if present, and this review used the injected work-order scope. |
| Modified-date limitation observation | Behavior remains disclosed; its missing claims entry is F-3-5. |
| Full-rerender focus weakness | UNFIXED — reproduced with Reset demo and bulk approval; F-3-15 is blocking. |

The original missing-demo gate is fixed for entry, seed, banner, storage, reset,
and exit, but its first-screen presentation is now recorded precisely as F-3-1.

## Structure, accessibility, crawl, and visual identity

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200. The tested unknown path
  returns a designed HTTP 404.
- Every route has the correct title pattern, plain description, canonical,
  OG/Twitter metadata, social image, SVG favicon, 180 px touch icon, `lang=en`,
  one h1, and one main. Robots and sitemap list all real routes.
- Browser navigation and Back focus the route h1 and announce its title. All
  discovered real links return 200; checkout resolves through Sociobot to a 200
  Dodo session, and GitHub returns 200. The 404 skip link targets its own
  existing `#main`; its HTTP status correctly remains 404.
- Axe reports zero serious/critical WCAG A/AA findings on the checked live
  routes. The stock verifier reports title, language, one h1, main, alt text,
  named buttons, and zero load errors. The full local desktop/mobile suite also
  passes keyboard, focus, reduced-motion, touch-target, and overflow checks.
- The field-paper palette, contour illustration, asymmetric map layout, and
  ledger-like product UI are recognizable and not a generic SaaS template.
  Initial JS is 32.98 kB raw / 11.84 kB gzip; CSS is 16.09 kB raw / 4.46 kB
  gzip.
- F-1-12 and F-3-12 are the remaining 404 structure/copy failures.

## Quality-gate evidence

From the clean clone:

```text
npm ci          PASS — 158 packages, 0 vulnerabilities
npm run lint    PASS
npm run build   PASS — dist/ produced
npm test        PASS — 8/8 Vitest, 48/48 Playwright desktop/mobile
claim matrix    PASS — all 22 exact registered commands
verify-url.sh   PASS — title/lang/h1/main/alt/buttons/console
```

## Missed leverage

F-3-7 is the missed leverage finding: plan export lacks the matching local plan
import/resume path. AI classification is not warranted because file type/year
routing is deterministic, reviewable, offline, and privacy-sensitive. Sync
would add an account/network boundary not implied by the local-first job. No AI
provider key or decorative AI feature is present.

## What would make this perfect

Make `/demo` open directly on the seeded workbench; unify the 404 shell; rebuild
the exact copy audit; show privacy, offline, and price facts in the hero; remove
or test every unlisted quantitative/compatibility statement; add local plan
import; and apply all seven plain-copy rewrites. Then rerun a clean build, all
22 exact claim commands, the full suite, cold 390 px/desktop reads, the
first-viewport demo assertion, storage isolation/reset/exit, offline reload,
request logging, route/link crawl, Back/focus checks, and axe. Only a result
with zero findings and no unlisted claim merits PASS.
