# Review handoff — Triagebox adversarial review 3

Date: 2026-08-28 UTC

Work order: `local-file-triage-review-3`

Reviewed commit: `7e6790d0571fe2e6ccd4b8f3fec61dc43c419e78`

Live product: <https://local-file-triage.sociobot.in>

## Done

- Wrote [`review-3.md`](review-3.md) with a **FAIL** verdict, 18 findings, a
  complete landing/README copy audit, all claim results, and a finding-by-finding
  history recheck.
- Opened the live site cold at 390×844 and 1440×900, then tested demo entry,
  reset, real/demo IndexedDB separation, exit cleanup, request locality, and
  offline reload.
- Checked route titles, metadata, one-h1/main structure, Back/focus behavior,
  live links, the true 404, accessibility, console output, and visual identity.
- Read every earlier review, polish report, handoff, and verification report.
- Did not modify product code.

## Verification

Clean clone: `/tmp/triagebox-review3-clean-t0g8Na` at the reviewed commit.

```text
npm ci          PASS — 158 packages, 0 vulnerabilities
npm run lint    PASS
npm run build   PASS — dist/ produced
npm test        PASS — 8/8 Vitest, 48/48 Playwright
claims          PASS — all 22 exact .factory/claims.json commands
verify-url.sh   PASS
live axe        PASS — zero serious/critical findings on checked routes
live requests   PASS — demo flow and offline reload used same-origin assets only
```

Temporary evidence is under `/tmp/review3-*`; it is not part of the repository.

## Known gaps and next steps

The product does not pass review. The primary blocker is that `/demo` repeats
the marketing hero and places its first sample row around y=2397 on a 390×844
phone. F-1-12 and F-2-4 are also reopened as blocking because the 404 header is
not shared and the committed copy audit is not exact. Keyboard actions that
rerender the workbench also drop focus to `BODY` (F-3-15). The remaining claim,
copy, first-screen-fact, and plan-import findings are specified with concrete
fixes in `review-3.md`.
