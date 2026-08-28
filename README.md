# Triagebox

Triagebox is a private, review-before-move workbench for messy folders. It
recursively inventories a folder on the user’s device, proposes deterministic
type/year destinations, lets the user approve or revise every row, and moves only
approved files. Every run produces portable JSON and CSV receipts and can be
undone without overwriting an existing original path.

Live product: <https://local-file-triage.sociobot.in>

## Try the sample

Open <https://local-file-triage.sociobot.in/demo> or choose **Try it with sample
data** on the landing page. It opens five realistic sample routes in an isolated
`demo:latest` IndexedDB record. **Reset demo** restores the sample; **Start for
real** returns to the separate real-workbench record. Details are in
[`.factory/demo.md`](.factory/demo.md).

## Who it is for

People cleaning up or migrating a 1,000–10,000-file folder who do not want to
upload it, hand ownership to a photo server, or trust opaque automatic moves.

## Safety model

1. Folder access begins only after an explicit browser permission prompt.
2. Classification is local and deterministic: extension/MIME type chooses a
   bucket and the modified year chooses a subfolder.
3. The editable plan is inert until the user approves a specific run.
4. For each action, Triagebox copies the bytes, verifies the destination size,
   and only then removes the source. Name collisions receive ` (2)`, ` (3)`, and
   so on; nothing is overwritten.
5. The receipt records original/destination paths, byte size, timestamp, outcome,
   and errors. Undo performs the same copy/verify/remove sequence in reverse.

The browser File System Access API cannot set a copied file’s filesystem modified
date. Triagebox records the original timestamp in every manifest rather than
claiming to preserve it. Keep a separate backup during important migrations.

## Browser support and privacy

Writable directory access requires a current desktop Chromium browser (Chrome or
Edge). Other browsers and mobile devices can use read-only folder preview and plan
export. Files and file metadata never leave the browser. IndexedDB stores the last
local survey/receipt; localStorage stores only the optional license and cached
verification result. There are no analytics, third-party scripts, or CDN fonts.

The PWA installs with a versioned offline shell. `/privacy/` and `/terms/` contain
the complete policies.

## Free and Pro

The free tier includes full surveys, per-file review/editing, plan and receipt
exports, undo, and 100 file moves per run. Triagebox Pro is a $19 one-time license
that removes the per-run limit. Checkout and verification use only the Sociobot
billing API; no payment provider is embedded in this repository.

## Develop and verify

Requires Node.js 22+.

```sh
npm ci
npm run dev
npm test
```

`npm test` runs deterministic unit/in-memory filesystem tests, builds production
output, then runs Chromium desktop/mobile, axe accessibility, legal-route, and
explicit offline Playwright tests. Playwright 1.58.2 is pinned as required by the
factory image.

Build exactly as deployed:

```sh
npm run build
```

The static deployment root is `dist/`, with `dist/index.html` at its root and
independent `privacy/` and `terms/` entries. Preview it locally with
`npm run preview`.

## Project notes

- Product/visual decisions: [`.factory/design.md`](.factory/design.md)
- Observable product claims and their exact regression commands:
  [`.factory/claims.json`](.factory/claims.json)
- Build handoff: [`.factory/handoff.md`](.factory/handoff.md)
- License: [MIT](LICENSE)
