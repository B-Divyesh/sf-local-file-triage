# Repair handoff — Triagebox polish round 2

Date: 2026-08-28 UTC

Work order: `local-file-triage-polish-2`

Live product: <https://local-file-triage.sociobot.in>

Reviewed candidate: `7e276d8d7dee135fd616321ca7eea8cb675de116`

Verified implementation: `ffb093befa3eace943cbe3e87c69ba5bf7dcdda6`

## Done

- Closed every finding in both adversarial reviews and all prior verification
  findings. The complete mapping is in [`polish-2.md`](polish-2.md).
- Removed the first-install update overlay. Genuine updates now use a
  dismissible, in-flow notice.
- Replaced user-facing “route” terminology with “proposed destination” or “file
  move,” backed by a copy regression test.
- Made both sample actions enter the isolated demo. Direct `/demo` and
  `?demo=1` seed five records in `demo:latest`; reset restores them; Start for
  real deletes that demo record before returning to the separate real survey.
- Added observable `receipt-json` and `installable` claims and tests. The claims
  registry now has 22 unique IDs.
- Preserved route titles, metadata, focus/announcement, the shared legal shell,
  a true 404, offline behavior, privacy boundaries, and the field-paper visual
  identity.
- Updated the product to v1.0.2, the complete copy audit, demo docs, catalog
  description, and release evidence.

## Exact verification

Clean clone: `/tmp/triagebox-polish-2-clean-ipOzbo` at
`ffb093befa3eace943cbe3e87c69ba5bf7dcdda6`.

```text
npm ci          PASS — 158 packages installed; 0 vulnerabilities
npm run lint    PASS
npm run build   PASS — dist/index.html produced
npm test        PASS — 8/8 Vitest; 48/48 Playwright desktop/mobile
claim matrix    PASS — all 22 exact commands from .factory/claims.json
```

The Playwright suite includes keyboard/focus, 390×844 layout, axe, demo
isolation/reset/exit, real mocked filesystem moves, JSON and CSV exports,
privacy request tracing, metadata, Back navigation, installability, and offline
reload.

Production checks after deployment:

```text
/                         200 text/html
/demo                     200 text/html
/privacy/                 200 text/html
/terms/                   200 text/html
/manifest.webmanifest     200 application/manifest+json
/robots.txt               200 text/plain
/sitemap.xml              200 text/xml
/does-not-exist-polish-2  404 text/html
```

The pinned-browser live audit reported zero normal-route console errors, zero
third-party requests, zero serious/critical axe issues, one h1/main per checked
route, all three mobile hero facts ending at y=760, no first-install notice,
five demo rows, working reset, correct demo canonical/OG title, complete legal
links, and a successful offline demo reload. The stock `verify-url.sh` also
passed with title, `lang=en`, one h1, main, alt text, named buttons, and no
console errors.

Performance evidence:

```text
Initial JS   32.98 kB raw / 11.84 kB gzip
CSS          16.09 kB raw / 4.46 kB gzip
Lighthouse   99 performance / 100 accessibility / 100 best practices / 100 SEO
LCP          1.9 s
CLS          0
```

Evidence files are under `.factory/evidence/`, including
`live-polish-2-report.json`, the three `live-polish-2-*.png` screenshots,
`live-verify-stock/verify.json`, and `lighthouse-local.json`.

## Run and deploy

```bash
npm ci
npm test
npm run lint
npm run build
/opt/fleet/lib/deploy-static.sh local-file-triage dist
```

## Known gaps and next steps

None. All cumulative review findings and required acceptance checks are closed.
