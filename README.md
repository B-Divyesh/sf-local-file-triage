# Triagebox

Triagebox organizes messy folders after you review every proposed move.

It lists files in nested folders and suggests a destination by type and year.
You review each suggestion before moving files.
Each run can export JSON and CSV receipts and can be undone without overwriting an existing original path.

Live product: <https://local-file-triage.sociobot.in>

## Try the sample

Open <https://local-file-triage.sociobot.in/?demo=1> or choose **Try it with sample data**.
The five-file sample is isolated from your saved folder review.
Reset demo restores the sample. Start for real returns to your separate folder review.
Details are in [`.factory/demo.md`](.factory/demo.md).

## Who it is for

For people cleaning or migrating folders.
File details stay in your browser, and nothing moves without review.

## Safety model

Triagebox asks for folder access only after you choose a folder.
File type and modified year choose each proposed destination.
The editable plan does nothing until you approve a specific run.
For each move, Triagebox copies bytes, checks the destination size, then removes the source.
Name collisions receive `(2)`, `(3)`, and so on. Nothing is overwritten.
The receipt records original and destination paths, byte size, original timestamp, outcome, and errors.
Undo uses the same copy, check, and remove sequence in reverse.
Triagebox records the original date in the receipt.
It does not promise to preserve the copied file’s modified date.
Keep a separate backup during important migrations.

Exported plan JSON can be imported after choosing the matching folder.
Exact path, size, and date matches regain their edits and approvals.
Changed or missing files stay unapproved and are reported.

## Browser support and privacy

Writable folder choice appears when your browser supports it.
Other browsers and mobile devices can preview a folder and export a plan.
Your last folder review and receipt use IndexedDB. The demo uses `demo:latest`; real work uses `latest`.
The optional Pro token and its check result use namespaced localStorage keys.
There are no analytics, third-party scripts, or CDN fonts.
Supporting browsers receive the manifest and service worker needed to install Triagebox.
The app reloads offline after your first visit.
Read the full [privacy policy](https://local-file-triage.sociobot.in/privacy/) and [terms](https://local-file-triage.sociobot.in/terms/).

## Free and Pro

The free tier includes folder scans, per-file review and edits, exports, undo, and 100 file moves per run.
Triagebox Pro is a $19 one-time license that removes the per-run limit.
Checkout opens a page hosted by Sociobot/Dodo. License checks use the Sociobot billing API.

## Develop and verify

Development is verified with Node.js 22.

```bash
npm ci
npm test
npm run build
npm run preview
```

`npm test` runs unit, copy, build, and Chromium desktop and mobile checks.
Playwright 1.58.2 is pinned for the factory image.
The static deployment root is `dist/`, with `dist/index.html` at its root.

## Product documentation

Product and visual decisions: [`.factory/design.md`](.factory/design.md).
Observable product claims and regression commands: [`.factory/claims.json`](.factory/claims.json).
Build handoff: [`.factory/handoff.md`](.factory/handoff.md).

License: MIT.
