# Independent verification handoff — FAIL

Date: 2026-08-28 UTC
Work order: `local-file-triage-verify-1`
Candidate: `a9750ba92270ef4b31182bdbc419cef3c5e76d44`
Live URL: <https://local-file-triage.sociobot.in>

## Decision

**FAIL — do not release this candidate.**

The live HTML/JS/CSS/PWA files match the candidate build. The earlier reported
billing deployment failure is no longer present: the Sociobot checkout returned
303 to a reachable live Dodo checkout, invalid-token verification worked, and a
40-request verify burst was rate-limited with HTTP 429 plus `Retry-After: 4`.

Release remains blocked because `.factory/claims.json` is missing and there is
no first-screen, isolated, resettable sample demo. New scans are also
pre-approved; “visible” bulk controls alter hidden rows; review edits do not
survive reload; imported undo hides the promised updated receipt; and a blocked
undo cannot be retried after the blocker is removed.

The complete evidence, exact hashes, severities, pass results, and retest order
are in [`.factory/verification.md`](verification.md).

## Verification summary

- `npm ci`: PASS, 0 vulnerabilities.
- `npm test`: PASS — 5/5 Vitest and 8/8 Playwright checks.
- Exact production build/type check: PASS; `dist/` produced.
- Lint: no lint command/configuration exists.
- Live candidate identity: PASS by SHA-256 equality for HTML, JS, CSS, manifest,
  and service worker.
- Chromium real filesystem-handle move/collision/export/undo: PASS.
- Normal, 101-file, 10,000-entry, empty, cancel, invalid-receipt, rename, and undo
  recovery cases: exercised; blocking defects recorded in the report.
- Offline home, sample, and privacy reload after first visit: PASS.
- Axe serious/critical: 0; manual live-region and touch-target defects remain.
- Lighthouse mobile: 100/100/100/100; LCP 1.3 s, TBT 70 ms, CLS 0.
- Privacy: core flow stayed same-origin; optional billing used only Sociobot.

## How to reproduce the repository checks

```sh
npm ci
npm test
npm run build
npm run preview
```

Before reconsidering release, implement and run the six-step retest order at the
end of `.factory/verification.md`. No product code was changed during this
verification; only this handoff and the verification report were added/updated.
