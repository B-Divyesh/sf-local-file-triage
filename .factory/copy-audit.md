# Copy audit

Reviewed 2026-08-28 after polish round 2. Counts treat hyphenated compounds,
URLs, paths, and product names as one word. The automated Playwright copy test
also rejects user-facing `route` or `routes` outside the designed 404.

No copy unit exceeds 22 words. No banned marketing word is present.

## Cold landing page

| Copy unit | Words | Evidence |
| --- | ---: | --- |
| Skip to main content | 5 | Clear accessibility link |
| Triagebox | 1 | Brand |
| Demo | 1 | Clear navigation label |
| Workbench | 1 | Product section label |
| Upgrade | 1 | Clear navigation label |
| Organize files locally | 3 | Plain job |
| No uploads | 2 | `real-file-locality` |
| Survey the folder. | 3 | Job-first headline |
| Approve every move. | 3 | `approval-required` |
| For people cleaning a messy folder, Triagebox shows where each file will go before it moves. | 16 | Audience and result |
| Try it with sample data | 5 | Primary action |
| See five proposed destinations. | 4 | Concrete action result |
| Nothing is saved. | 3 | `demo-sandbox` |
| File details | 2 | Fact label |
| Stay in this browser | 4 | `real-file-locality` |
| Method | 1 | Fact label |
| Copy · verify · remove | 3 | `reversible-move` |
| Receipt | 1 | Fact label |
| JSON + CSV | 2 | `receipt-json`; `receipt-csv` |
| See every proposed destination before moving a file. | 8 | Concrete caption |
| Ready. | 1 | Status |
| No folder permission requested yet. | 5 | `permission-on-action` |
| Local / file details stay here | 5 | `real-file-locality` |
| Choose and review a folder | 5 | Section label |
| Open one folder. | 3 | Empty state |
| Nothing moves yet. | 3 | `approval-required` |
| After you choose a folder, Triagebox suggests a destination from each file’s type and year. | 15 | `permission-on-action`; `deterministic-routes` |
| Choose a folder | 3 | Action |
| Preview a folder | 3 | Action |
| Undo from receipt | 3 | Action |
| Try the five-file sample | 4 | Isolated demo link |
| How review-before-move works | 4 | Mechanism heading |
| Survey | 1 | Step label |
| Choose one local folder. | 4 | Step |
| Review | 1 | Step label |
| Check each destination you want. | 5 | Step |
| Move | 1 | Step label |
| Copy, verify, then keep a receipt. | 6 | Step |
| Optional Pro license | 3 | Plain label |
| Remove the 100-file move limit | 6 | Concrete upgrade heading |
| Free includes surveys, editing, exports, undo, and 100 moves per run. | 11 | `free-limit` |
| A $19 one-time Triagebox Pro license removes the per-run limit. | 10 | `free-limit` |
| Your safety controls stay free. | 5 | Free-tier statement |
| Buy Pro on Sociobot/Dodo · $19 | 5 | External purchase action |
| Opens in a new site | 5 | External-link disclosure |
| Have a license? | 3 | Restore disclosure |
| Restore it | 2 | Restore action |
| License token | 2 | Form label |
| Verify license | 2 | Form action |
| Checkout opens on Sociobot/Dodo. | 4 | `checkout-origin` |
| See terms and privacy. | 4 | Legal links |
| Review file moves before they happen. | 6 | Footer description |
| Privacy | 1 | Legal link |
| Terms | 1 | Legal link |
| View source on GitHub | 4 | External source link |
| Map artwork generated for Triagebox · 2026 · v1.0.2 · build [commit] | 9 | Provenance and build identity |
| A newer Triagebox version is ready. | 6 | Genuine-update notice only |
| Refresh to update the app. | 5 | Update explanation |
| Dismiss | 1 | Update notice action |

## Demo-specific rendered copy

| Copy unit | Words | Evidence |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | Required persistent banner |
| Sample destinations stay separate from your local survey. | 8 | `demo-sandbox` |
| Reset demo | 2 | `demo-sandbox` |
| Start for real | 3 | Deletes demo record before exit |
| Five sample destinations loaded. | 4 | Demo status |
| No real files are connected. | 5 | Sandbox boundary |
| Review this folder · Sample folder | 6 | Demo section label |
| Review every proposed destination. | 4 | Review heading |
| Preview only. | 2 | Capability state |
| Export this plan or reopen in desktop Chrome/Edge to move files. | 11 | Next step |
| Filter proposed destinations | 3 | Search label |
| No proposed destinations match this search. | 6 | Empty filter state |
| Clear the filter to see the full survey. | 8 | Empty filter next step |
| 0 file moves approved | 4 | Approval status |
| Only checked rows will move. | 5 | `approval-required` |
| Demo reset. | 2 | Reset status |
| The five sample destinations are back. | 6 | Reset result |

## README sentences

| Sentence or control | Words | Evidence |
| --- | ---: | --- |
| Triagebox organizes messy folders after you review every proposed move. | 10 | Plain opening |
| It lists files in nested folders and suggests a destination by type and year. | 14 | `recursive-inventory`; `deterministic-routes` |
| You review each suggestion before moving files. | 7 | `approval-required` |
| Each run can export JSON and CSV receipts and can be undone without overwriting an existing original path. | 18 | `receipt-json`; `receipt-csv`; `reversible-move` |
| Live product: local-file-triage.sociobot.in | 3 | Product link |
| Open /demo or choose Try it with sample data. | 9 | Demo instruction |
| The five-file sample is isolated from your saved local survey. | 10 | `demo-sandbox` |
| Reset demo restores the sample. | 4 | `demo-sandbox` |
| Start for real returns to your separate survey. | 9 | `demo-sandbox` |
| Details are in .factory/demo.md. | 4 | Documentation link |
| For people cleaning or migrating folders with 1,000–10,000 files. | 9 | Audience |
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
| Supporting browsers receive the manifest and service worker needed to install Triagebox. | 12 | `installable` |
| The app reloads offline after your first visit. | 8 | `offline-reload` |
| Read the full privacy policy and terms. | 7 | Legal links |
| The free tier includes surveys, per-file review and edits, exports, undo, and 100 file moves per run. | 17 | `free-limit` |
| Triagebox Pro is a $19 one-time license that removes the per-run limit. | 12 | `free-limit` |
| Checkout opens a page hosted by Sociobot/Dodo. | 7 | `checkout-origin` |
| License checks use the Sociobot billing API. | 7 | `checkout-origin` |
| Requires Node.js 22+. | 3 | Developer prerequisite |
| npm test runs unit tests, builds production output, then runs Chromium desktop and mobile checks. | 15 | Test documentation |
| Playwright 1.58.2 is pinned for the factory image. | 8 | Tooling documentation |
| The static deployment root is dist/, with dist/index.html at its root. | 12 | Deployment documentation |
| Product and visual decisions: .factory/design.md. | 5 | Documentation link |
| Observable product claims and regression commands: .factory/claims.json. | 7 | Documentation link |
| Build handoff: .factory/handoff.md. | 4 | Documentation link |
| License: MIT. | 2 | License statement |

## Terminology

| Concept | Product word |
| --- | --- |
| Local directory | folder |
| Suggested file location | proposed destination |
| User decision | approval |
| Intended operation | file move |
| Portable JSON/CSV record | receipt |
| Isolated sample mode | demo |
