# Repair handoff — Triagebox

Date: 2026-09-06 UTC

Work order: `local-file-triage-repair-2`

Live product: <https://local-file-triage.sociobot.in>

Reviewed base: `facddbf65f902f37f9696b668317eab240854dad`

Deployed implementation: `23f9d6b2ee5b474752da3da27f9f470600531758`

## Done

- Fixed F-5-1/F-3-1 at its layout cause. On phones up to 760 px tall, repeated
  demo guidance leaves the visual flow while remaining available to assistive
  technology. The demo keeps its label, reset and exit actions, heading, status,
  folder summary, filter, first filename, and first approval control in the
  initial 393×727 viewport.
- Kept the move action in normal document flow on short viewports so it cannot
  cover the last queue control.
- Tightened only the short-phone landing rhythm. The job, audience, first action,
  and privacy, offline, and price facts now all fit at 393×727.
- Added outcome-based browser checks for the short Pixel 5 home and demo states.
  They measure rendered element positions at `scrollY=0`; they do not assert CSS
  source strings.
- Updated the product version to 1.1.1 and the visible build ID to `repair2`.
- Preserved the five-file demo, separate `demo:latest` storage, real folder review,
  exports, undo, plan import, offline shell, and the paid 100-file-limit removal.

Implementation commits are `49515d5`, `8a4280a`, and `23f9d6b`. The final
documentation/evidence commit follows the deployed implementation; its exact SHA
is copied to `/work/.evidence/documentation-sha.txt` after the commit.

## Cold browser evidence

Fresh 393×727 and 1440×900 Chromium contexts loaded the live product with no
saved state, no console errors, no horizontal overflow, and no third-party
runtime requests.

Before scrolling, both sizes state:

- Job: “Organize a folder. Review every move.”
- Audience: “For people cleaning a messy folder…”
- First action: “Try it with sample data,” followed by what it loads and saves.

At 393×727, the first action ends at y=447 and the three facts end at y=654.
One click loads the demo without scrolling. The first sample row begins at
y=623.7, leaving 103 px visible; `IMG_4821.jpg` and its approval control are
visible. The persistent demo label and both demo actions remain above it.

After approving the first sample, **Reset demo** restored five rows, zero
approvals, and `IMG_4821.jpg`. The `demo-sandbox` claim separately seeds a real
folder review, enters and exits demo, and proves that reset/exit never read,
change, or delete that real record.

Evidence:

- `evidence/repair2-live-home-pixel5.png`
- `evidence/repair2-live-demo-pixel5.png`
- `evidence/repair2-live-home-desktop.png`
- `evidence/repair2-live-demo-desktop.png`
- `evidence/repair2-live-home-verify/`
- `evidence/repair2-live-demo-verify/`

## Verification

Final clean clone: `/tmp/triagebox-repair2-final-clean-C7t8Di` at
`23f9d6b2ee5b474752da3da27f9f470600531758`.

```text
npm ci                                          PASS — 158 packages, 0 vulnerabilities
npm run lint                                    PASS
npm test                                        PASS — 10 unit, 54 browser
npm run build                                   PASS — dist/index.html produced
23 exact .factory/claims.json commands          PASS — 23/23
TRIAGEBOX_TEST_BASE_URL=… npm run test:e2e      PASS — 54/54 live
verify-url.sh / and /demo                       PASS — no console errors
Playwright axe integration, five live routes    PASS — 0 serious/critical violations
```

The accessibility run covers `/`, `/demo`, `/privacy/`, `/terms/`, and the
designed 404 in desktop and mobile projects. It also checks mobile touch targets,
overflow, live regions, keyboard focus after rerenders, and route focus. The
offline claim uses its own browser context and reloads after service-worker
control.

The final build is 39.35 kB JavaScript raw / 13.31 kB gzip and 18.39 kB CSS raw /
4.89 kB gzip. Lighthouse wrote
`evidence/lighthouse-repair2-live.json` with Performance 100, Accessibility 100,
Best Practices 100, SEO 100, LCP 1.4 s, TBT 60 ms, and CLS 0. The CLI then reported
a browser-tab crash while closing; the completed report is valid and the separate
live browser and URL-verifier runs passed.

Live route results are 200 for `/`, `/demo`, `/privacy/`, `/terms/`,
`/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest`. The designed unknown
route returns HTTP 404. Live HTML, JavaScript, and CSS SHA-256 values match the
local `dist/` files. Security headers include CSP with `frame-ancestors`,
`nosniff`, HSTS, referrer policy, frame denial, and permissions policy.

## Earlier findings

- F-5-1 and the presentation part of F-3-1: fixed by the short-phone demo layout
  and direct rendered-position regression test.
- F-1-1 through F-1-30, F-2-1 through F-2-4, and F-3-2 through F-3-16: remain
  fixed. The full copy audit, route shell, metadata, storage, import/export,
  keyboard, and browser tests pass.
- RB-01 through RB-05: remain fixed by dedicated tests for unchecked defaults,
  displayed-row bulk scope, review persistence, imported-receipt export, and
  retryable blocked undo.
- V1 claims, demo isolation, announcements, touch targets, security, routing,
  caching, metadata, three-step explanation, and FINAL-MOBILE: all remain passing.

## Deployment

The static artifact was deployed to the existing `sf-local-file-triage` Static
Web App. Deployment `14a3870a-630f-4573-b7a7-0a35949bc5e1` reached `Succeeded`;
the existing custom domain remained Ready and returned HTTPS 200. No backend,
database, shared service, secret, DNS record, or billing registration was changed.

## Known limits and next steps

- `.factory/brief.json` is absent. This repair used the researched brief supplied
  with the work order.
- Writable folder moves depend on browser folder-access support. Other browsers
  retain local preview and plan export.
- Pro remains a $19 one-time license through the existing Sociobot billing link.
  Public offer metadata is in `/work/.evidence/billing-offer.json`; no payment
  provider credential is present in this repository.
- This static product has no backend, tenant store, process restart, health
  endpoint, or product-owned request allowance, so those checks do not apply.

No current or earlier review finding remains unresolved.
