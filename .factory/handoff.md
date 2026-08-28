# Review handoff — Triagebox review 2

Date: 2026-08-28 UTC
Work order: `local-file-triage-review-2`

## Done

- Performed an adversarial read-only review of the live site at 390×844 and
  1440×900, demo sandbox, privacy traffic, routing/metadata, link crawl,
  historical findings, and wording.
- Wrote the complete evidence report in [`review-2.md`](review-2.md).
- Did not modify product code or assets.

## Verification

- Fresh local clone: `npm ci`, `npm run build`, and `npm test` passed (8 unit
  tests and 40 desktop/mobile Playwright tests).
- Every exact command in `.factory/claims.json` passed individually (20 IDs).
- Live demo loaded five sample files, showed the demo banner/reset/start-real
  controls, reset correctly, and made only same-origin requests in the reviewed
  flow.
- Link crawl, route metadata checks, normal-route console checks, and the
  project axe suite passed.

## Outcome and remaining work

**FAIL.** The report records five findings: mobile update-toast overlap of a
required hero fact; the re-opened `F-1-20` terminology regression; unlisted JSON
receipt export; unlisted installability; and an incomplete shipped copy-audit
record. Address those findings and repeat the full review checklist.
