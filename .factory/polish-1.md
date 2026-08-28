# Polish round 1 — Triagebox

Base reviewed: `83aaf1e8b257aeb58193ce5c154f9bdd5b0841df`.

All review findings are fixed in this round. Local evidence is `npm test` (8 unit
tests, 40 Chromium desktop/mobile Playwright tests), the exact claim commands in
[`claims.json`](claims.json), and the screenshots in `evidence/`.

Live recheck: <https://local-file-triage.sociobot.in/?cold=809c6ee> was opened in
a fresh Chromium context after direct production deployment of commit `809c6ee`.
The cold home had the corrected title and first screen; `/demo` had canonical
`/demo`, the persistent banner, five rows, and a working reset; `/privacy/` had
its route OG title; `/does-not-exist` returned HTTP 404 with header and footer.
No console errors occurred during the rerun. Live screenshots are
`evidence/live-home-390.png`, `evidence/live-demo-390.png`, and
`evidence/live-404-desktop.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added real selected-file privacy coverage through preview, move, receipt export, and undo. | `@claim:real-file-locality` |
| F-1-2 | Tested feature-present folder choice and feature-absent preview/plan export. | `@claim:browser-capabilities` |
| F-1-3 | Documented and enumerated demo/real IndexedDB and license localStorage keys. | `@claim:storage-boundary` |
| F-1-4 | Added all-route same-origin runtime request coverage. | `@claim:no-tracking-runtime` |
| F-1-5 | Executed a 101-file free run (100 moved, one queued) and a fixture-verified 101-file Pro run; retained exact $19 copy. | `@claim:free-limit` |
| F-1-6 | Replaced refund promise with observable Sociobot/Dodo checkout wording and tested link/verify origin. | `@claim:checkout-origin` |
| F-1-7 | Added picker spy coverage; chooser remains explicit-action only. | `@claim:permission-on-action` |
| F-1-8 | Added exact source timestamp coverage in receipt data and CSV. | `@claim:receipt-original-timestamp` |
| F-1-9 | Added nested directory traversal fixture coverage. | `@claim:recursive-inventory` |
| F-1-10 | Demo boot now updates canonical, description, OG, and Twitter metadata. | `demo metadata, route focus…` |
| F-1-11 | Added route-specific OG and Twitter metadata to both legal documents. | `demo metadata, route focus…` |
| F-1-12 | Rebuilt the static 404 with header, skip link, footer/legal links, metadata, icons, and build label. | `evidence/not-found-desktop.png` |
| F-1-13 | Destination h1 elements are focusable; boot focuses and announces their route title, including Back. | `browser Back restores…` |
| F-1-14 | Named GitHub and Sociobot/Dodo destinations as external in visible and accessible text. | Playwright accessibility/crawl coverage |
| F-1-15 | Generated and linked a real 180×180 `apple-touch-icon.png`. | HTML metadata test; asset inspection |
| F-1-16 | Unified package/footer version at 1.0.1 and inject the short Git commit at build time. | `npm run build`; footer screenshot |
| F-1-17 | Rewrote the README opening into short plain sentences. | `copy-audit.md` |
| F-1-18 | Rewrote the README audience statement into two plain sentences. | `copy-audit.md` |
| F-1-19 | Changed “Private file cartography” to “Organize files locally”. | `evidence/home-390.png` |
| F-1-20 | Replaced “local route” with “where each file will go”. | `evidence/home-390.png` |
| F-1-21 | Replaced terrain-dependent figure and update text with concrete wording. | `evidence/home-390.png`; `npm test` |
| F-1-22 | Changed both workbench labels to “Choose and review a folder” / “Review this folder”. | home workflow test |
| F-1-23 | Rewrote the plan explanation in terms of type and year destinations. | `copy-audit.md` |
| F-1-24 | Made both sample controls use “Try … sample” language. | home workflow test |
| F-1-25 | Renamed the explanation heading to “How review-before-move works”. | `copy-audit.md` |
| F-1-26 | Changed the upgrade eyebrow to “Optional Pro license”. | `evidence/home-390.png` |
| F-1-27 | Changed the upgrade heading to “Remove the 100-file move limit”. | `@claim:free-limit` |
| F-1-28 | Rewrote the install/offline README sentence without the PWA acronym. | `copy-audit.md` |
| F-1-29 | Rewrote the README opening without “workbench”. | `copy-audit.md` |
| F-1-30 | Replaced user-facing “manifest” with “receipt”; schema naming remains code-only. | `copy-audit.md` |

Mobile screenshots: [`home-390.png`](evidence/home-390.png) and
[`demo-390.png`](evidence/demo-390.png). The visual system remains the existing
topographic field-paper identity from `design.md`; no template replacement was
introduced.
