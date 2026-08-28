# Independent verification — FAIL

Date: 2026-08-28 UTC
Work order: `local-file-triage-verify-1`
Candidate: `a9750ba92270ef4b31182bdbc419cef3c5e76d44`
Live URL: <https://local-file-triage.sociobot.in>
Artifact: offline PWA
Verdict: **FAIL — do not release this candidate**

The live core assets exactly match the candidate and the clean repository test
suite passes. The release nevertheless fails two explicit automatic acceptance
gates: `.factory/claims.json` is missing, and the first screen has no one-click
“Try it with sample data” demo. Independent testing also found unsafe approval
semantics and broken persistence/recovery paths in the actual product workflow.

## Mandatory gate results

### Claims gate — FAIL

This was checked before any other product test, as required.

- `.factory/claims.json` does not exist at the candidate commit.
- There were consequently no listed claim commands to run.
- `rg "@claim:"` finds no claim-tagged tests anywhere in the repository.
- `.factory/demo.md` and `.factory/copy-audit.md` are also absent.
- The landing page and README make many unlisted claims, including no uploads,
  deterministic routing, checked-files-only moves, copy/verify/remove, JSON and
  CSV receipts, undo without overwrite, offline reload, local persistence, no
  analytics, and the paid/free limits. With no claims registry, none has the
  required one-to-one sandbox claim test.

Per the supplied claims contract, a missing claims file is independently
release-blocking even where manual verification below confirms an individual
claim.

### Cold first-read and demo gate — FAIL

Cold desktop (1440×900) and mobile (390×844) reads produced this answer:

- What it does: surveys a messy folder, proposes deterministic destinations,
  and moves checked files while leaving an undo receipt.
- For whom: a person with a messy folder using desktop Chrome or Edge; the
  privacy-conscious 1,000–10,000-file audience is only implicit.
- What to click first: **Start a local survey**.

The first-screen sample requirement is not met:

- The only sample control is **Load an example survey**, below the first
  viewport at y=1218.7 on desktop and y=1872.1 on mobile.
- The required **Try it with sample data** action is absent.
- `/demo` returns the ordinary home application, with the home title and no
  preloaded sample.
- There is no persistent “Demo — sample data, nothing is saved” banner, Reset
  demo, or Start for real control.
- There is no separate demo storage namespace. After saving a survey containing
  `PRIVATE-tax-record.pdf`, opening `/demo` restored and displayed that filename
  from the normal IndexedDB `latest` record. This is the opposite of the
  required demo isolation boundary.

## Release-blocking product findings

### RB-01 — Rows are approved by the product, not explicitly by the user

Every proposal is created with `approved: true`. A fresh two-file scan therefore
immediately displayed “2 routes approved” before the user reviewed either row.
The user can execute all proposed moves with one confirmation. That conflicts
with the product’s central “you approve / approve every move” safety promise for
an opaque-tool-averse audience.

### RB-02 — “Visible” bulk actions modify rows that are not visible

With 101 files, only 100 rows were rendered. **Clear visible** changed the total
from 101 approved to 0; **Approve visible** changed it back to 101. The hidden
101st row was modified both times. The button label and the actual scope differ,
which is unsafe in the core review-before-move workflow.

### RB-03 — Review edits do not survive reload

After a scan, one row was unchecked, another was changed from Documents to
Archives, and its destination was renamed to `revised.txt`. Reload restored the
last survey but reset the three values to checked, Documents, and `notes.txt`.
Row edits and approvals are never saved when changed. This violates the PWA
state-survival contract and can silently discard a large review.

### RB-04 — Imported undo hides the updated receipt

A valid imported manifest was undone successfully using a selected filesystem.
The app then said “Imported undo finished. Export the updated receipt for your
records,” but rendered zero receipt sections and zero Export JSON buttons because
the imported flow has no plan rows. The updated audit receipt cannot be reviewed
or exported from the UI.

### RB-05 — A blocked undo cannot be retried

When undo found an existing original path, it safely refused to overwrite it and
changed the action from `moved` to `failed`. After the blocking file was removed,
**Undo this run** remained disabled because retry only processes `moved` actions.
The destination copy remained in Triagebox and no supported recovery action was
available.

## Other findings

### Medium

- Async scan, cancellation, empty-folder, receipt, and license errors are written
  to `#activity`, which has no `role=status` or `aria-live`; screen readers are
  not notified of these important results.
- On the 390 px sample view, checkbox label hit areas measured about 30×33 px
  (the checkbox itself was 22×22). Some inline legal links measured only 15 px
  high. These miss the 44×44 touch-target rule.
- The live site has HSTS, `nosniff`, and a strict-origin referrer policy, but no
  Content-Security-Policy, no `frame-ancestors`/X-Frame-Options, and no
  Permissions-Policy. Its HSTS max-age is 10,886,400 seconds despite including
  `preload`, below the usual preload requirement.
- `/not-a-real-route` returns the home page with HTTP 200. There is no real 404
  route. `/demo` similarly falls through to home.
- Hashed JS/CSS assets use `Cache-Control: public, must-revalidate, max-age=30`
  instead of long-lived immutable caching. `manifest.webmanifest` is served as
  `application/octet-stream`.
- Required discovery metadata is absent: canonical URL, Open Graph, Twitter
  card, apple-touch icon, and a product-specific 1200×630 social image. The
  footer has no version/build ID.

### Documentation/contract gaps

- `.factory/brief.json` is absent; this verification used the brief embedded in
  the work order.
- The landing page does not contain the standard explicit three-step “How it
  works” section; it has a four-label trust strip instead.
- The browser cannot preserve filesystem modified timestamps after a copied
  move. This constraint is honestly disclosed in the UI, README, terms, and
  manifest, so it is recorded as a known platform limitation rather than a
  deceptive claim.

## Clean clone and build evidence

Initial state was clean and exactly at the requested commit.

| Check | Result |
| --- | --- |
| `git rev-parse HEAD` | `a9750ba92270ef4b31182bdbc419cef3c5e76d44` |
| `npm ci` | PASS; 59 packages, 0 vulnerabilities |
| `npm test` | PASS |
| Unit/integration | 5/5 PASS across two Vitest files |
| Type check | PASS via `tsc --noEmit` in the exact build |
| Production build | PASS; `dist/` created by Vite 7.3.6 |
| Browser suite | 8/8 PASS across Chromium desktop and Pixel 5 projects |
| Lint | No lint script or lint configuration exists |

Production build sizes:

| Asset | Raw | Gzip reported by Vite |
| --- | ---: | ---: |
| Initial JS | 29.63 KB | 10.81 KB |
| CSS | 15.05 KB | 4.31 KB |
| Mobile hero WebP | 29.63 KB | n/a |
| Desktop hero WebP | 68.52 KB | n/a |

These pass the 200 KB JS, 50 KB CSS, and 300 KB mobile hero budgets.

## Deployment identity

The live deployment matches this build even though the product exposes no build
ID:

| File | Candidate SHA-256 | Live SHA-256 |
| --- | --- | --- |
| `index.html` | `bb5af69f…87cf02b` | same |
| `main-DwXAffve.js` | `68c07ad2…221a75` | same |
| `style-BPgL8TMT.css` | `67c00988…f3996a` | same |
| `manifest.webmanifest` | `6d31a576…367ae` | same |
| `sw.js` | `a85a9125…4efbbf8b` | same |

## Functional evidence

### Successful paths

- The five-file sample loaded, edited, filtered, recovered from an empty filter,
  and exported a five-action plan.
- A Chromium origin-private filesystem end-to-end test used real
  `FileSystemDirectoryHandle`/`FileSystemFileHandle` implementations. A private
  text file moved to `Triagebox/Documents/2026/notes (2).txt` beside an existing
  `notes.txt`; byte contents remained correct; undo restored the original and
  removed only the generated collision copy.
- An independent compatible-handle browser test exported both receipts. JSON
  contained the correct original/destination, byte size, timestamp, and moved
  status. CSV had the expected header and one action row.
- A 101-file run moved the first 100 and left one proposed row for a second run,
  correctly enforcing the free-tier limit.
- A 10,000-entry synthetic directory scanned and rendered its first paginated
  100 rows without horizontal overflow; the scan completed in about 3.8 seconds
  in this verifier container.
- Picker cancellation, empty folder, malformed receipt, invalid rename
  characters, collision naming, and no-match filter recovery produced safe,
  understandable outcomes. The approval/retry defects above remain.

### Privacy and outbound traffic

- A full scan/move/export/undo test emitted requests only to
  `https://local-file-triage.sociobot.in`.
- No analytics, CDN fonts, or third-party runtime scripts were observed.
- Initial live load requested only same-origin HTML, JS, CSS, icon, and hero art.
- Optional license verification is the disclosed exception and calls only the
  Sociobot billing API. An invalid returned token was saved under
  `sb_license:local-file-triage`, stripped from the address bar, verified as
  invalid, and did not unlock Pro.

### Billing and rate limiting

Fresh evidence shows the earlier deployment-only billing failure is resolved:

- `GET /api/v1/products/local-file-triage/checkout` returned HTTP 303 to a live
  `checkout.dodopayments.com/session/...` URL; that hosted page returned 200.
- Invalid verification returned HTTP 200 with
  `{"expires_at":null,"reason":"invalid","valid":false}` and `no-store`.
- A simultaneous burst of 40 invalid verify requests returned 23×200 and
  17×429. Sampled 429 responses all included `Retry-After: 4`. Thus throttling
  was observed within the 40-request burst, after at most 23 accepted responses
  in this run.
- CORS preflight from the product origin returned the correct
  `Access-Control-Allow-Origin`. Sign-in/Entra checks are not applicable because
  the product has no sign-in.

## Browser, accessibility, and PWA evidence

- Live views checked at 1440×900 and 390×844 in light and dark color schemes.
  Neither had horizontal overflow or console/page errors.
- Axe 4.10.2 found zero WCAG A/AA violations on the tested home/sample states in
  light and dark schemes; specifically, no serious or critical findings.
- The page has `lang=en`, a descriptive title, one h1, main/header/nav/footer
  landmarks, image alt text, a skip link, and a visible 3 px focus outline.
- Keyboard Tab order reached all main actions with no trap and every focused
  control had a visible outline. Full rerenders can drop focus to the body,
  which is a usability weakness but did not block operation.
- Reduced-motion emulation matched and reduced transition/animation durations to
  0.01 ms. No persistent animation or flashing was observed.
- A fresh service worker activated as `/sw.js` with cache
  `triagebox-shell-v2`. After going fully offline, home reloaded, the five-row
  sample opened, and `/privacy/` reloaded with no console/page errors.
- The install manifest has standalone display, versioned start URL, matching
  colors, 192 px and 512 px icons, and a maskable declaration. The incorrect
  response MIME type is noted above.

Lighthouse 12.8.2 mobile defaults against the live URL:

| Category/metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 1.3 s |
| TBT | 70 ms |
| CLS | 0 |

Lighthouse additionally estimated 25 KiB of responsive-image savings and 53 KiB
of image-delivery savings. These do not exceed the supplied hard image budget.

## Retest order

1. Add `.factory/claims.json` and one observable demo-only test per claim; remove
   any unlisted claims.
2. Build a real first-screen `/demo` with isolated `demo:` storage, realistic
   preloaded data, persistent demo banner, reset, and start-for-real controls.
3. Default new proposals to unapproved and make visible-row bulk scope exact and
   explicit.
4. Persist every review edit/approval and verify it survives reload.
5. Keep imported undo receipts visible/exportable and allow safe retry after a
   blocker is removed.
6. Add live-region announcements, 44 px hit targets, real 404 behavior, required
   metadata/security headers, and immutable caching; then rerun all evidence.
