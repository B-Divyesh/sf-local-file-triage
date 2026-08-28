# Adversarial first-read review 1 — Triagebox

Date: 2026-08-28 UTC

Live URL: <https://local-file-triage.sociobot.in>

Candidate: `97118147616739fdbc90eaf4cf0ba97235c60be0`

## Verdict: FAIL

The first screen and demo pass, and every declared claim test passes. The product
still has 30 findings: nine live/README promises have no adequate claims entry,
seven route/metadata defects remain, and fourteen copy flags remain. Under this
review's zero-finding rule, release does not pass.

No failing declared claim test was found. No prior release-blocking defect has
regressed. The failure is based on untested claims and newly checked contract
requirements, not on the demo boundary or core move logic.

## Cold first read

Fresh Chromium contexts were opened without prior storage at 390×844 and
1440×900, before scrolling.

| Question | 390 px answer | Desktop answer | Result |
| --- | --- | --- | --- |
| What does it do? | It surveys a messy local folder and requires approval before file moves. | Same. | PASS |
| For whom? | “For people cleaning a messy folder.” | Same. | PASS |
| What should I click first? | **Try it with sample data**; the adjacent text says five routes will appear and nothing is saved. | Same. | PASS |

The exact first-screen copy was “Survey the folder. Approve every move.” and
“For people cleaning a messy folder, Triagebox shows each local route before any
checked file moves.” The primary action was visible at y=504 px on phone and
y=644 px on desktop. There were no console errors or horizontal overflow.

## Findings

### Major — unlisted or inadequately scoped claims

#### F-1-1 — The general no-upload promise is tested only for demo sample data

- Quote/location: landing “No uploads”, “0 BYTES UPLOADED”, and “Private terrain
  stays on your device”; README “Files and file metadata never leave the
  browser.”
- Why: `local-only` claims only “Sample file details stay in your browser” and
  its test exercises `/demo`. The broader promise covers real selected files.
- Fix: either narrow every occurrence to sample/demo data or register a
  real-preview privacy claim whose Playwright request log covers folder preview,
  editing, plan export, move, receipt export, and undo with only documented
  origins allowed.

#### F-1-2 — Browser capability promises are unlisted

- Quote/location: README “Writable directory access requires a current desktop
  Chromium browser (Chrome or Edge). Other browsers and mobile devices can use
  read-only folder preview and plan export.”
- Why: no claim entry checks the desktop write path or the mobile/unsupported
  read-only fallback and export.
- Fix: add a `browser-capabilities` entry and tests for feature-present and
  feature-absent contexts, including a downloaded plan in the fallback path.

#### F-1-3 — Browser-storage promises are unlisted

- Quote/location: README “IndexedDB stores the last local survey/receipt;
  localStorage stores only the optional license and cached verification result.”
- Why: `review-persistence` verifies some survey fields but not the complete
  storage inventory or the “only” restriction.
- Fix: add a storage-boundary claim that enumerates IndexedDB/localStorage keys
  after real, demo, and license flows, or remove “only”.

#### F-1-4 — The no-analytics/no-third-party-runtime promise is unlisted

- Quote/location: README “There are no analytics, third-party scripts, or CDN
  fonts.”
- Why: `local-only` records demo requests but does not register or assert this
  broader shell/dependency claim.
- Fix: add a `no-tracking-runtime` claim and inspect all loaded script, font, and
  request origins on `/`, `/demo`, `/privacy/`, and `/terms/`.

#### F-1-5 — Free and Pro limits are unlisted

- Quote/location: landing “Free includes complete surveys, editing, exports,
  undo, and 100 moves per run” and “A $19 one-time Triagebox Pro license removes
  the per-run limit”; the README repeats both promises.
- Why: no claim entry proves the complete free feature list, the 100-move limit,
  the price, or the licensed unlimited path.
- Fix: split this into tagged free-limit and Pro-unlock claims. Assert a 101-file
  free run, the remaining queued row, a fixture-verified license, and the price
  shown by the product catalog.

#### F-1-6 — Checkout and refund handling are unlisted

- Quote/location: landing “Secure checkout and refunds are handled by
  Sociobot/Dodo, the merchant of record”; README “Checkout and verification use
  only the Sociobot billing API; no payment provider is embedded in this
  repository.”
- Why: no registry entry checks the link destination, verification origin, or
  embedded-provider assertion. Refund handling cannot be established by the
  current sandbox.
- Fix: replace the refund sentence with the observable “Checkout opens a page
  hosted by Sociobot/Dodo,” then register a test for the checkout redirect and
  verification request origin. Remove any untestable refund promise.

#### F-1-7 — Permission timing is unlisted

- Quote/location: landing “Triagebox reads the directory only after you choose
  it”; README “Folder access begins only after an explicit browser permission
  prompt.”
- Why: no claim entry asserts that the picker/handle is untouched before the
  explicit action.
- Fix: add a `permission-on-action` test with a picker spy, then assert zero calls
  on load and one call after **Choose a folder**.

#### F-1-8 — Timestamp-recording behavior is unlisted

- Quote/location: README “Triagebox records the original timestamp in every
  manifest rather than claiming to preserve it.”
- Why: `reversible-move` checks bytes, collision behavior, removal, and undo but
  does not state or assert this timestamp promise.
- Fix: add a `receipt-original-timestamp` claim and assert the exact source
  timestamp in JSON and CSV receipts.

#### F-1-9 — Recursive inventory is unlisted

- Quote/location: README “It recursively inventories a folder on the user’s
  device”.
- Why: `deterministic-routes` begins with supplied file facts; it does not prove
  nested traversal.
- Fix: add a nested in-memory directory claim and assert files at multiple depths
  appear once with correct relative paths.

### Major — route and document structure

#### F-1-10 — `/demo` publishes home-page canonical and social metadata

- Location/evidence: `/demo` has title `Demo — Triagebox`, but canonical is `/`
  and OG/Twitter title is `Triagebox — local, reversible file triage`.
- Why: shared metadata tells crawlers and link previews that the demo is the home
  route, despite the real demo URL and route-specific title requirement.
- Fix: set canonical `/demo`, `Demo — Triagebox` social titles, a demo-specific
  description, and the product social image when booting `/demo`.

#### F-1-11 — Privacy and Terms omit Open Graph and Twitter metadata

- Location/evidence: `/privacy/` and `/terms/` have route titles, descriptions,
  and canonicals, but no `og:*` fields or Twitter card.
- Why: the required metadata set is incomplete per route.
- Fix: add route-specific OG title/description/image and Twitter card metadata to
  both entry documents.

#### F-1-12 — The designed 404 does not use the standard site shell

- Location/evidence: `/does-not-exist` correctly returns HTTP 404, but has no
  header, skip link, footer, meta description, canonical, OG/Twitter metadata,
  favicon, or build ID.
- Why: it is visually related but loses the consistent navigation, legal links,
  accessibility affordance, and provenance required on every route.
- Fix: build the 404 with the shared header/footer and complete route metadata;
  retain HTTP 404 and the current useful return action.

#### F-1-13 — Route changes do not focus or announce the new h1

- Location/evidence: after activating **Try it with sample data**, the active
  element on `/demo` is `BODY`, not the h1. The same is true on direct legal
  navigation and browser Back. There is no route-title live region.
- Why: URLs and Back work, but keyboard and screen-reader users do not receive the
  required focus/announcement on route change.
- Fix: make the destination h1 programmatically focusable, focus it after route
  activation/back restoration, and announce the route title in a polite live
  region. Add a keyboard Back/Forward regression test.

#### F-1-14 — External links are not identified as external

- Location: footer **Source** and **Buy Pro once · $19**.
- Why: both leave the site, but neither label or accessible name says so.
- Fix: use “View source on GitHub (opens in a new site)” and “Buy Pro on
  Sociobot/Dodo · $19”, with equivalent accessible names.

#### F-1-15 — The apple-touch icon is 192 px, not the required 180 px

- Location/evidence: `link[rel=apple-touch-icon]` points to a 192×192 PNG.
- Why: the site-structure contract requests a 180 px apple-touch asset.
- Fix: generate a real 180×180 icon and reference it from every HTML entry.

#### F-1-16 — The displayed build ID conflicts with the package version

- Location/evidence: every shared footer says `build 1.0.1`; `package.json` says
  `version: 1.0.0` and neither value identifies commit `9711814`.
- Why: the handoff calls this a version/build ID, but the two visible sources
  disagree and cannot identify the deployed artifact.
- Fix: inject one release version plus a short commit/build identifier at build
  time and use the same version in package metadata and the footer.

### Minor — copy and terminology

#### F-1-17 — README opening sentence exceeds 22 words and uses internal terms

- Quote (26 words): “It recursively inventories a folder on the user’s device,
  proposes deterministic type/year destinations, lets the user approve or revise
  every row, and moves only approved files.”
- Fix: “Triagebox lists every file and suggests a folder based on type and year.
  You review each suggestion before moving files.”

#### F-1-18 — README audience sentence exceeds 22 words

- Quote (28 words): “People cleaning up or migrating a 1,000–10,000-file folder
  who do not want to upload it, hand ownership to a photo server, or trust opaque
  automatic moves.”
- Fix: “For people cleaning or migrating folders with 1,000–10,000 files. Your
  files stay local, and nothing moves without review.”

#### F-1-19 — “Private file cartography” is jargon

- Location: landing eyebrow, “Private file cartography · No uploads”.
- Why: “cartography” describes the visual metaphor, not the job.
- Fix: “Organize files locally · No uploads”.

#### F-1-20 — “Local route” obscures the concrete outcome

- Location: first-screen sentence, “Triagebox shows each local route before any
  checked file moves.”
- Fix: “For people cleaning a messy folder, Triagebox shows where each file will
  go before it moves.”

#### F-1-21 — The figure caption relies on the terrain metaphor

- Quote: “Mess becomes terrain once every route is visible.”
- Fix: “See every proposed destination before moving a file.”

#### F-1-22 — “02 / Survey station” does not make sense out of context

- Location: workbench section label.
- Fix: “Choose and review a folder”.

#### F-1-23 — “Deterministic plan” is implementation jargon

- Quote: “Triagebox reads the directory only after you choose it, then builds a
  deterministic plan from file type and modified year.”
- Fix: “After you choose a folder, Triagebox suggests a destination from each
  file’s type and year.”

#### F-1-24 — The second sample action uses different terms

- Location: hero **Try it with sample data** versus workbench **Load an example
  survey**.
- Why: “sample”, “example”, “data”, and “survey” name the same try-out.
- Fix: label both actions **Try the five-file sample** or reserve the secondary
  action for a clearly different outcome.

#### F-1-25 — “How a safe cleanup works” makes an unqualified safety claim

- Location: landing h3.
- Fix: “How review-before-move works”. This names the mechanism and aligns with
  the approval claim.

#### F-1-26 — “Optional expedition pass” is decorative jargon

- Location: upgrade eyebrow.
- Fix: “Optional Pro license”.

#### F-1-27 — “One cleanup. One purchase.” is not an out-of-context heading

- Location: upgrade h2.
- Fix: “Remove the 100-file move limit”.

#### F-1-28 — “PWA” is unexplained in user-facing README copy

- Quote: “The PWA installs with a versioned offline shell.”
- Fix: “You can install the app, and it reloads offline after your first visit.”

#### F-1-29 — “Workbench” is an avoidable abstract product term

- Quote: “Triagebox is a private, review-before-move workbench for messy folders.”
- Fix: “Triagebox organizes messy folders after you review every proposed move.”

#### F-1-30 — “Manifest” conflicts with the UI term “receipt”

- Locations: README “every manifest”, “manifest export”, and “original timestamp
  in every manifest”; the UI and terminology table call this a receipt.
- Fix: use “receipt” in user copy. Reserve `triagebox-manifest-v1` for schema and
  developer references only.

## Complete copy audit

Word counts treat hyphenated compounds, paths, URLs, and version numbers as one
word. Navigation labels are included where they behave as headings or controls.

### Live landing page

| # | Text | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Private file cartography · No uploads | 5 | F-1-1, F-1-19 |
| 2 | Survey the folder. | 3 | OK |
| 3 | Approve every move. | 3 | OK; `approval-required` |
| 4 | For people cleaning a messy folder, Triagebox shows each local route before any checked file moves. | 16 | F-1-20 |
| 5 | Try it with sample data | 5 | OK |
| 6 | See five routes. | 3 | OK |
| 7 | Nothing is saved. | 3 | OK in the required demo-sandbox meaning |
| 8 | Network: None for files | 4 | F-1-1 |
| 9 | Method: Copy · verify · remove | 4 | OK; `reversible-move` |
| 10 | Receipt: JSON + CSV | 3 | OK; `receipt-csv` |
| 11 | Mess becomes terrain once every route is visible. | 8 | F-1-21 |
| 12 | Ready. | 1 | OK |
| 13 | No folder permission requested yet. | 5 | F-1-7 |
| 14 | 51.000° LOCAL / 0 BYTES UPLOADED | 5 | F-1-1 |
| 15 | 02 / Survey station | 3 | F-1-22 |
| 16 | Open one folder. | 3 | OK |
| 17 | Nothing moves yet. | 3 | OK; `approval-required` |
| 18 | Triagebox reads the directory only after you choose it, then builds a deterministic plan from file type and modified year. | 20 | F-1-7, F-1-23 |
| 19 | Choose a folder | 3 | OK; result-naming first step |
| 20 | Preview a folder | 3 | OK |
| 21 | Undo from receipt | 3 | OK |
| 22 | Load an example survey | 4 | F-1-24 |
| 23 | How a safe cleanup works | 5 | F-1-25 |
| 24 | Survey: Choose one local folder. | 5 | OK |
| 25 | Review: Check each route you want. | 6 | OK |
| 26 | Move: Copy, verify, then keep a receipt. | 7 | OK |
| 27 | Optional expedition pass | 3 | F-1-26 |
| 28 | One cleanup. | 2 | F-1-27 |
| 29 | One purchase. | 2 | F-1-27 |
| 30 | Free includes complete surveys, editing, exports, undo, and 100 moves per run. | 12 | F-1-5 |
| 31 | A $19 one-time Triagebox Pro license removes the per-run limit. | 10 | F-1-5 |
| 32 | Your safety controls stay free. | 5 | F-1-5 |
| 33 | Buy Pro once · $19 | 4 | OK as action; F-1-14 for external destination |
| 34 | Have a license? | 3 | OK |
| 35 | Restore it | 2 | OK in the disclosure control context |
| 36 | License token | 2 | OK |
| 37 | Verify license | 2 | OK |
| 38 | Secure checkout and refunds are handled by Sociobot/Dodo, the merchant of record. | 12 | F-1-6 |
| 39 | See terms and privacy. | 4 | OK |
| 40 | Private terrain stays on your device. | 6 | F-1-1, F-1-21 |
| 41 | Map artwork generated for Triagebox · 2026 · build 1.0.1 | 8 | F-1-16 |
| 42 | Triagebox is ready offline. | 5 | OK; `offline-reload` |
| 43 | Refresh anytime for the newest map. | 6 | F-1-21; use “Refresh to update the app.” |

The other navigation labels—Triagebox, Demo, Workbench, Upgrade, Privacy,
Terms, and Source—are short link names rather than sentences. **Source** also
has the external-link defect in F-1-14.

### README

| # | Text | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Triagebox is a private, review-before-move workbench for messy folders. | 9 | F-1-29 |
| 2 | It recursively inventories a folder on the user’s device, proposes deterministic type/year destinations, lets the user approve or revise every row, and moves only approved files. | 26 | F-1-9, F-1-17 |
| 3 | Every run produces portable JSON and CSV receipts and can be undone without overwriting an existing original path. | 18 | OK; listed claims |
| 4 | Live product: https://local-file-triage.sociobot.in | 3 | OK |
| 5 | Open https://local-file-triage.sociobot.in/demo or choose Try it with sample data on the landing page. | 13 | OK |
| 6 | It opens five realistic sample routes in an isolated demo:latest IndexedDB record. | 12 | Technical but precise demo documentation |
| 7 | Reset demo restores the sample; Start for real returns to the separate real-workbench record. | 14 | OK |
| 8 | Details are in .factory/demo.md. | 4 | OK |
| 9 | People cleaning up or migrating a 1,000–10,000-file folder who do not want to upload it, hand ownership to a photo server, or trust opaque automatic moves. | 28 | F-1-18 |
| 10 | Folder access begins only after an explicit browser permission prompt. | 10 | F-1-7 |
| 11 | Classification is local and deterministic: extension/MIME type chooses a bucket and the modified year chooses a subfolder. | 17 | Listed routing claim; technical detail is defined here |
| 12 | The editable plan is inert until the user approves a specific run. | 12 | OK; `approval-required` |
| 13 | For each action, Triagebox copies the bytes, verifies the destination size, and only then removes the source. | 17 | OK; `reversible-move` |
| 14 | Name collisions receive (2), (3), and so on; nothing is overwritten. | 11 | OK; `reversible-move` |
| 15 | The receipt records original/destination paths, byte size, timestamp, outcome, and errors. | 11 | F-1-8 for timestamp scope |
| 16 | Undo performs the same copy/verify/remove sequence in reverse. | 8 | OK; `reversible-move` |
| 17 | The browser File System Access API cannot set a copied file’s filesystem modified date. | 14 | Necessary platform name; otherwise plain |
| 18 | Triagebox records the original timestamp in every manifest rather than claiming to preserve it. | 14 | F-1-8, F-1-30 |
| 19 | Keep a separate backup during important migrations. | 7 | OK |
| 20 | Writable directory access requires a current desktop Chromium browser (Chrome or Edge). | 12 | F-1-2 |
| 21 | Other browsers and mobile devices can use read-only folder preview and plan export. | 13 | F-1-2 |
| 22 | Files and file metadata never leave the browser. | 8 | F-1-1 |
| 23 | IndexedDB stores the last local survey/receipt; localStorage stores only the optional license and cached verification result. | 16 | F-1-3 |
| 24 | There are no analytics, third-party scripts, or CDN fonts. | 9 | F-1-4 |
| 25 | The PWA installs with a versioned offline shell. | 8 | F-1-28 |
| 26 | /privacy/ and /terms/ contain the complete policies. | 7 | OK |
| 27 | The free tier includes full surveys, per-file review/editing, plan and receipt exports, undo, and 100 file moves per run. | 19 | F-1-5 |
| 28 | Triagebox Pro is a $19 one-time license that removes the per-run limit. | 12 | F-1-5 |
| 29 | Checkout and verification use only the Sociobot billing API; no payment provider is embedded in this repository. | 17 | F-1-6 |
| 30 | Requires Node.js 22+. | 3 | OK |
| 31 | npm test runs deterministic unit/in-memory filesystem tests, builds production output, then runs Chromium desktop/mobile, axe accessibility, legal-route, and explicit offline Playwright tests. | 22 | At cap; developer terminology is appropriate here |
| 32 | Playwright 1.58.2 is pinned as required by the factory image. | 10 | OK |
| 33 | Build exactly as deployed. | 4 | OK |
| 34 | The static deployment root is dist/, with dist/index.html at its root and independent privacy/ and terms/ entries. | 17 | OK |
| 35 | Preview it locally with npm run preview. | 7 | OK |
| 36 | Product/visual decisions: .factory/design.md | 3 | OK |
| 37 | Observable product claims and their exact regression commands: .factory/claims.json | 9 | OK |
| 38 | Build handoff: .factory/handoff.md | 3 | OK |
| 39 | License: MIT | 2 | OK |

README headings—Try the sample, Who it is for, Safety model, Browser support and
privacy, Free and Pro, Develop and verify, and Project notes—make sense out of
context. No banned marketing adjective from the supplied list was present.

## Demo and sandbox evidence

- PASS: the first-screen action enters `/demo` in one click.
- PASS: the first rendered demo state already contains five realistic named
  files, destinations, years, sizes, edit controls, and zero pre-approvals.
- PASS: the persistent banner contains “Demo — sample data, nothing is saved”,
  **Reset demo**, and **Start for real**.
- PASS: after changing approval, destination, and name, Reset restored all three
  and returned five rows.
- PASS: a seeded real `latest` IndexedDB record containing
  `PRIVATE-real-file.pdf` never appeared in demo; leaving demo restored it.
- PASS: the live demo flow and offline reload emitted no third-party request.
- PASS: after service-worker activation, `/demo` reloaded offline with the banner
  and all five rows.

## Declared claims

`npm ci` and `npm run build` were run from the clean requested commit. Each exact
command in `.factory/claims.json` was then run separately.

| Claim ID | Exact declared command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS, 2/2 |
| `approval-required` | `npm run test:e2e -- --grep @claim:approval-required` | PASS, 2/2 |
| `displayed-bulk-controls` | `npm run test:e2e -- --grep @claim:displayed-bulk-controls` | PASS, 2/2 |
| `review-persistence` | `npm run test:e2e -- --grep @claim:review-persistence` | PASS, 2/2 |
| `imported-receipt-export` | `npm run test:e2e -- --grep @claim:imported-receipt-export` | PASS, 2/2 |
| `undo-retry` | `npm run test:unit -- -t @claim:undo-retry` | PASS, 1 selected |
| `local-only` | `npm run test:e2e -- --grep @claim:local-only` | PASS, 2/2 |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 2/2 |
| `deterministic-routes` | `npm run test:unit -- -t @claim:deterministic-routes` | PASS, 1 selected |
| `reversible-move` | `npm run test:unit -- -t @claim:reversible-move` | PASS, 1 selected |
| `receipt-csv` | `npm run test:unit -- -t @claim:receipt-csv` | PASS, 1 selected |

The registry has 11 entries, not eight; the previous handoff's prose count is
stale even though its later table lists all 11.

## History re-check

No `.factory/review-*.md` or `.factory/polish-*.md` existed before this review.
Both prior verification reports and the handoff were checked anyway.

| Earlier finding/claim | Live and code result |
| --- | --- |
| Missing claims registry and tagged tests | FIXED; 11 entries, all exact commands pass. |
| Missing first-screen isolated demo | FIXED; live one-click seed/banner/reset/exit/storage boundary pass. |
| RB-01 default approval | FIXED; `createProposal` sets `approved: false`; live demo starts at zero. |
| RB-02 bulk scope | FIXED; 101-row claim test passes. |
| RB-03 review persistence | FIXED; approval, bucket, and name survive reload. |
| RB-04 imported receipt hidden | FIXED; tagged export test passes. |
| RB-05 blocked undo not retryable | FIXED; in-memory blocker-removal retry passes. |
| Missing live announcements | FIXED; `#activity` is a polite atomic status region. |
| Mobile approval target below 44 px | FIXED; existing test and live CSS confirm 44 px target. |
| Missing security headers | FIXED live: CSP, frame, referrer, permissions, and nosniff policies present. |
| Unknown paths returned home/200 | FIXED; designed response returns HTTP 404. F-1-12 is a new shell/metadata defect, not a status regression. |
| Weak asset caching/manifest MIME | FIXED live. |
| Missing discovery metadata | FIXED on `/`; F-1-10 and F-1-11 cover newly checked per-route omissions. |
| Missing footer build label | PARTLY SATISFIED; a label exists, but F-1-16 records its version conflict. |
| Missing three-step explanation | FIXED; Survey, Review, Move are present. |
| CSP console error from inline fallback | FIXED; cold loads had no console error. |

Because the earlier footer claim is only partly satisfied, F-1-16 remains a
release finding. The earlier release-blocking product IDs RB-01 through RB-05
are genuinely fixed rather than merely marked fixed.

## Structure, accessibility, and crawl

- Titles, `lang=en`, one h1, one main, heading order, canonical on non-demo routes,
  home OG/Twitter/social image, SVG favicon, robots, sitemap, deep links, browser
  Back, and HTTP 404 status were confirmed.
- Every discovered link resolved: same-origin pages returned 200, GitHub returned
  200, and checkout redirected to a 200 Dodo-hosted session. All in-page targets
  exist.
- Axe 4.10.2 found zero WCAG A/AA violations on `/`, `/demo`, `/privacy/`, and
  `/terms/` at desktop and 390 px. No route overflowed horizontally.
- The topographic paper/map identity is distinct and follows `.factory/design.md`;
  it is not a generic centered-gradient/three-card SaaS surface.
- Initial production JS is 31.24 kB raw / 11.48 kB gzip; CSS is 15.94 kB raw /
  4.44 kB gzip; the 390 px hero is 29.6 kB.

## Missed leverage

No finding. A normal user already gets the implied high-value extensions: plan
export, JSON/CSV receipts, undo import, and offline use. AI classification would
weaken the product's deterministic, explainable, local-first safety model and is
not justified by the available brief. Sync would introduce the same privacy
tradeoff. No provider key or decorative AI feature is present.

## What would make this perfect

Resolve F-1-1 through F-1-9 by narrowing copy or registering observable tests;
complete route metadata, shared 404 chrome, focus management, external-link
labels, icon size, and build identity in F-1-10 through F-1-16; then apply every
plain-word rewrite in F-1-17 through F-1-30. Re-run every declared claim, the
full suite, live offline/request logging, route crawl, axe at both widths, and
the complete copy audit. PASS requires that rerun to produce zero findings.
