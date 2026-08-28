import './styles.css';
import { BUCKETS, createProposal, destinationFor, formatBytes, manifestToCsv, safeName, type PlanItem, type TriageManifest } from './triage';
import { buildManifest, movePlanItem, scanDirectory, scanInputFiles, undoManifest, type DirectoryHandleLike, type SourceMap } from './filesystem';
import { loadSurvey, saveSurvey } from './storage';
import { cachedPro, captureReturnedLicense, checkoutUrl, restoreLicense, storedToken, verifyLicense } from './license';

const app = document.querySelector<HTMLDivElement>('#app')!;
let items: PlanItem[] = [];
let sources: SourceMap = new Map();
let rootHandle: DirectoryHandleLike | undefined;
let rootName = '';
let writable = false;
let busy = false;
let query = '';
let visibleCount = 100;
let manifest: TriageManifest | undefined;
let isPro = cachedPro();
let notice = '';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);

function shell(content: string): string {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="Triagebox home"><img src="/icons/triagebox-mark.svg" alt="" width="36" height="36"><span>Triagebox</span></a>
    <nav aria-label="Primary"><a href="/#workbench">Workbench</a><a href="/#unlock">Upgrade</a></nav>
  </header>${content}<footer><div><strong>Triagebox</strong><p>Private terrain stays on your device.</p></div><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-local-file-triage">Source</a></nav><p class="provenance">Map artwork generated for Triagebox · 2026</p></footer>
  <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>`;
}

function renderLegal(kind: 'privacy' | 'terms'): void {
  const privacy = `<p class="eyebrow">Field note 01 · Effective 28 August 2026</p><h1>Your files do not leave the map.</h1>
    <p class="lede">Triagebox processes file names, types, dates, and contents in your browser. It does not upload, sell, or profile them.</p>
    <h2>What stays on your device</h2><p>Your latest survey and audit receipt are stored in this browser’s IndexedDB. A license token and its verification time are stored in localStorage. Folder access is controlled by your browser and operating system; Triagebox can only access a folder after you choose it.</p>
    <h2>What crosses the network</h2><p>The app shell loads from this site. If you buy or restore Pro, your license token is sent to the Sociobot billing API to verify access. Sociobot/Dodo is the merchant of record and processes checkout details under its own terms. Your file data is never included.</p>
    <h2>Your control</h2><p>Clear this site’s storage to remove local surveys and the license token. Exported manifests are ordinary files under your control. Revoking folder permission in browser settings ends access.</p>
    <h2>Contact</h2><p>Privacy questions can be sent through the project’s public issue tracker. Do not include private filenames or license tokens.</p>`;
  const terms = `<p class="eyebrow">Route terms · Effective 28 August 2026</p><h1>Review the route before you move.</h1>
    <p class="lede">Triagebox is a local utility that proposes and performs file moves only after your approval. You remain responsible for reviewing each route and keeping independent backups.</p>
    <h2>Safe-use agreement</h2><p>The app copies each approved file, verifies its byte size, then removes the original. It avoids overwriting collisions and records an undo manifest. Browser APIs cannot preserve filesystem modified timestamps; the original timestamp is recorded in the manifest instead. No software can replace a backup.</p>
    <h2>License</h2><p>The free tier supports complete surveys, plan export, manifest export, undo, and up to 100 moves per run. Triagebox Pro is a $19 one-time purchase that removes the per-run move limit on the licensed device. Accessibility and safety features are never gated.</p>
    <h2>Purchases and refunds</h2><p>Sociobot/Dodo is the merchant of record. Checkout, receipts, taxes, and refunds are handled there. A refunded or revoked purchase disables Pro after verification; the free utility and your local data remain available.</p>
    <h2>Warranty</h2><p>The software is provided “as is”, without warranty, to the extent permitted by law. Test with a backed-up folder first and inspect the exported receipt.</p>`;
  app.innerHTML = shell(`<main id="main" class="legal"><a class="back-link" href="/">← Back to the workbench</a>${kind === 'privacy' ? privacy : terms}</main>`);
}

function visibleItems(): PlanItem[] {
  const normalized = query.trim().toLowerCase();
  return normalized ? items.filter(item => `${item.relativePath} ${item.bucket} ${item.year}`.toLowerCase().includes(normalized)) : items;
}

function stats(): { approved: number; moved: number; failed: number; bytes: number } {
  return items.reduce((total, item) => ({
    approved: total.approved + (item.approved && item.status === 'proposed' ? 1 : 0),
    moved: total.moved + (item.status === 'moved' ? 1 : 0),
    failed: total.failed + (item.status === 'failed' ? 1 : 0),
    bytes: total.bytes + item.size
  }), { approved: 0, moved: 0, failed: 0, bytes: 0 });
}

function proposalRows(): string {
  const filtered = visibleItems();
  const shown = filtered.slice(0, visibleCount);
  if (!shown.length) return `<div class="queue-empty"><span aria-hidden="true">⌖</span><h3>No routes match this search.</h3><p>Clear the filter to see the full survey.</p></div>`;
  return `${shown.map(item => `<article class="file-row" data-id="${escapeHtml(item.id)}">
    <label class="approve"><input type="checkbox" data-action="approve" ${item.approved ? 'checked' : ''} ${item.status !== 'proposed' ? 'disabled' : ''}><span class="sr-only">Approve ${escapeHtml(item.name)}</span></label>
    <div class="source"><strong title="${escapeHtml(item.relativePath)}">${escapeHtml(item.name)}</strong><span>${escapeHtml(item.relativePath)} · ${formatBytes(item.size)}</span></div>
    <div class="reason"><span class="route-arrow" aria-hidden="true">→</span><span>${escapeHtml(item.reason)}</span></div>
    <label class="bucket"><span class="sr-only">Destination bucket for ${escapeHtml(item.name)}</span><select data-action="bucket" ${item.status !== 'proposed' ? 'disabled' : ''}>${BUCKETS.map(bucket => `<option ${bucket === item.bucket ? 'selected' : ''}>${bucket}</option>`).join('')}</select><span class="year">/${item.year}/</span></label>
    <label class="rename"><span class="sr-only">Destination name for ${escapeHtml(item.name)}</span><input data-action="rename" value="${escapeHtml(item.destinationName)}" ${item.status !== 'proposed' ? 'disabled' : ''}></label>
    <span class="row-status ${item.status}" aria-label="Status: ${item.status}">${item.status === 'proposed' ? 'Ready' : item.status}${item.error ? ` · ${escapeHtml(item.error)}` : ''}</span>
  </article>`).join('')}${shown.length < filtered.length ? `<button class="load-more" data-action="more">Show 100 more <span>(${filtered.length - shown.length} remain)</span></button>` : ''}`;
}

function workbench(): string {
  const summary = stats();
  const fileApi = Boolean(window.showDirectoryPicker);
  if (!items.length) return `<section id="workbench" class="workbench empty-workbench" aria-labelledby="workbench-title">
    <div class="section-index">02 / Survey station</div><h2 id="workbench-title">Open one folder. Nothing moves yet.</h2>
    <p>Triagebox reads the directory only after you choose it, then builds a deterministic plan from file type and modified year.</p>
    <div class="primary-actions"><button class="primary" data-action="scan" ${busy || !fileApi ? 'disabled' : ''}>Choose a folder</button><button data-action="preview" ${busy ? 'disabled' : ''}>Preview a folder</button><button data-action="import-undo" ${busy || !fileApi ? 'disabled' : ''}>Undo from receipt</button><button class="text-button" data-action="example">Load an example survey</button></div>
    ${!fileApi ? '<p class="callout warning"><strong>Read-only browser:</strong> folder write access needs desktop Chrome or Edge. You can still preview and export a plan here.</p>' : ''}
    <input id="folder-input" type="file" webkitdirectory multiple hidden aria-label="Choose a folder for read-only preview">
    <input id="manifest-input" type="file" accept="application/json,.json" hidden aria-label="Choose a Triagebox JSON receipt to undo">
    <div class="trust-strip"><span>① Local scan</span><span>② You approve</span><span>③ Copy + verify</span><span>④ Undo receipt</span></div>
  </section>`;
  const previewNote = writable ? 'Write access granted. Approved rows can move.' : 'Preview only. Export this plan or reopen in desktop Chrome/Edge to move files.';
  return `<section id="workbench" class="workbench" aria-labelledby="workbench-title">
    <div class="workbench-head"><div><div class="section-index">02 / Survey station · ${escapeHtml(rootName)}</div><h2 id="workbench-title">Review every proposed route.</h2><p>${previewNote}</p></div><div class="head-actions"><button data-action="import-undo" ${busy || !window.showDirectoryPicker ? 'disabled' : ''}>Undo from receipt</button><button data-action="new-scan">Survey another folder</button></div></div>
    <div class="legend" aria-label="Survey summary"><div><strong>${items.length.toLocaleString()}</strong><span>files mapped</span></div><div><strong>${summary.approved.toLocaleString()}</strong><span>approved</span></div><div><strong>${formatBytes(summary.bytes)}</strong><span>surveyed</span></div><div><strong>${summary.moved.toLocaleString()}</strong><span>moved</span></div></div>
    <div class="queue-tools"><label class="search"><span>Filter routes</span><input type="search" id="filter" value="${escapeHtml(query)}" placeholder="Name, bucket, or year"></label><div class="bulk"><button data-action="approve-all">Approve visible</button><button data-action="approve-none">Clear visible</button><button data-action="export-plan">Export plan JSON</button></div></div>
    <div class="queue-labels" aria-hidden="true"><span>Approve / source</span><span>Reason</span><span>Destination</span><span>Name / status</span></div>
    <div class="file-queue" aria-label="Proposed file moves">${proposalRows()}</div>
    <div class="action-rail"><div><strong>${summary.approved.toLocaleString()} route${summary.approved === 1 ? '' : 's'} approved</strong><span>${!isPro && summary.approved > 100 ? 'Free runs move the first 100. The rest remain safely queued.' : 'Only checked rows will move.'}</span></div><button class="primary" data-action="execute" ${busy || !writable || summary.approved === 0 ? 'disabled' : ''}>${busy ? 'Working…' : `Move ${!isPro && summary.approved > 100 ? 'first 100' : summary.approved} approved`}</button></div>
    ${manifest ? receipt() : ''}
    <input id="manifest-input" type="file" accept="application/json,.json" hidden aria-label="Choose a Triagebox JSON receipt to undo">
  </section>`;
}

function receipt(): string {
  if (!manifest) return '';
  const moved = manifest.actions.filter(action => action.status === 'moved').length;
  const failed = manifest.actions.filter(action => action.status === 'failed').length;
  const undone = manifest.actions.filter(action => action.status === 'undone').length;
  return `<section class="receipt" aria-labelledby="receipt-title"><div><p class="eyebrow">Portable receipt · ${escapeHtml(manifest.runId.slice(0, 8))}</p><h3 id="receipt-title">${moved} moved · ${undone} undone · ${failed} need attention</h3><p>Keep this receipt beside your backup. It records original paths, destinations, byte sizes, and original modified dates.</p></div><div class="receipt-actions"><button data-action="export-json">Export JSON</button><button data-action="export-csv">Export CSV</button><button data-action="undo" ${busy || moved === 0 || !rootHandle ? 'disabled' : ''}>Undo this run</button></div></section>`;
}

function upgrade(): string {
  return `<section id="unlock" class="upgrade" aria-labelledby="upgrade-title"><div class="contour-badge" aria-hidden="true"><i></i><i></i><i></i></div><div><p class="eyebrow">Optional expedition pass</p><h2 id="upgrade-title">One cleanup. One purchase.</h2><p>Free includes complete surveys, editing, exports, undo, and 100 moves per run. A <strong>$19 one-time Triagebox Pro license</strong> removes the per-run limit. Your safety controls stay free.</p><div class="upgrade-actions">${isPro ? '<span class="license-good">✓ Pro unlocked on this device</span>' : `<a class="button primary" href="${checkoutUrl}">Buy Pro once · $19</a>`}<details><summary>Have a license? Restore it</summary><form id="license-form"><label for="license-token">License token</label><div class="inline-field"><input id="license-token" autocomplete="off" value="${escapeHtml(storedToken())}"><button type="submit" aria-label="Verify license">Verify license</button></div></form></details></div><p class="fine-print">Secure checkout and refunds are handled by Sociobot/Dodo, the merchant of record. See <a href="/terms/">terms</a> and <a href="/privacy/">privacy</a>.</p></div></section>`;
}

function render(): void {
  const online = navigator.onLine;
  app.innerHTML = shell(`${!online ? '<div class="network-note" role="status">Offline map active — local scans and saved receipts still work.</div>' : ''}<main id="main">
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Private file cartography · No uploads</p><h1>Survey the folder.<br><em>Approve every move.</em></h1><p class="lede">Triagebox maps a messy folder into clear, deterministic routes. You inspect every destination; it moves only checked files and leaves a portable undo receipt.</p><div class="hero-actions"><a class="button primary" href="#workbench">Start a local survey</a><span>Best in desktop Chrome or Edge</span></div><dl class="coordinates"><div><dt>Network</dt><dd>None for files</dd></div><div><dt>Method</dt><dd>Copy · verify · remove</dd></div><div><dt>Receipt</dt><dd>JSON + CSV</dd></div></dl></div><figure class="map-figure"><picture><source type="image/webp" srcset="/assets/triage-map-480.webp 480w, /assets/triage-map.webp 800w" sizes="(max-width: 680px) 350px, (max-width: 960px) 620px, 42vw"><img src="/assets/triage-map-800.jpg" width="800" height="800" alt="An overhead paper topographic map where scattered file tabs are connected by one deliberate survey route" fetchpriority="high" decoding="async"></picture><figcaption>Mess becomes terrain once every route is visible.</figcaption></figure></section>
    <div class="status-line"><span class="status-dot ${busy ? 'busy' : ''}"></span><span id="activity">${escapeHtml(notice || (items.length ? `${items.length.toLocaleString()} files in the current survey` : 'Ready. No folder permission requested yet.'))}</span><span class="coord">51.000° LOCAL / 0 BYTES UPLOADED</span></div>
    ${workbench()}${upgrade()}</main>`);
  bindEvents();
}

function updateActivity(message: string): void {
  notice = message;
  const activity = document.querySelector('#activity');
  if (activity) activity.textContent = message;
}

function rowItem(target: Element): PlanItem | undefined {
  const id = target.closest<HTMLElement>('[data-id]')?.dataset.id;
  return items.find(item => item.id === id);
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>('[data-action]').forEach(control => control.addEventListener('click', onAction));
  document.querySelectorAll<HTMLSelectElement>('[data-action="bucket"]').forEach(select => select.addEventListener('change', event => {
    const item = rowItem(event.currentTarget as Element); if (item) item.bucket = select.value as typeof item.bucket;
  }));
  document.querySelectorAll<HTMLInputElement>('[data-action="rename"]').forEach(input => input.addEventListener('change', event => {
    const item = rowItem(event.currentTarget as Element); if (item) { item.destinationName = safeName(input.value, item.name); input.value = item.destinationName; }
  }));
  const filter = document.querySelector<HTMLInputElement>('#filter');
  filter?.addEventListener('input', () => { query = filter.value; visibleCount = 100; const queue = document.querySelector('.file-queue'); if (queue) queue.innerHTML = proposalRows(); bindQueueEvents(); });
  document.querySelector<HTMLInputElement>('#folder-input')?.addEventListener('change', previewFiles);
  document.querySelector<HTMLInputElement>('#manifest-input')?.addEventListener('change', importUndoReceipt);
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', onLicense);
}

function bindQueueEvents(): void {
  document.querySelectorAll<HTMLElement>('.file-queue [data-action]').forEach(control => control.addEventListener('click', onAction));
  document.querySelectorAll<HTMLSelectElement>('.file-queue [data-action="bucket"]').forEach(select => select.addEventListener('change', () => { const item = rowItem(select); if (item) item.bucket = select.value as typeof item.bucket; }));
  document.querySelectorAll<HTMLInputElement>('.file-queue [data-action="rename"]').forEach(input => input.addEventListener('change', () => { const item = rowItem(input); if (item) item.destinationName = safeName(input.value, item.name); }));
}

async function onAction(event: Event): Promise<void> {
  const target = event.currentTarget as HTMLElement;
  const action = target.dataset.action;
  if (action === 'scan') await chooseFolder();
  if (action === 'preview') document.querySelector<HTMLInputElement>('#folder-input')?.click();
  if (action === 'example') loadExample();
  if (action === 'new-scan') { items = []; sources.clear(); rootHandle = undefined; manifest = undefined; rootName = ''; writable = false; notice = ''; render(); }
  if (action === 'import-undo') document.querySelector<HTMLInputElement>('#manifest-input')?.click();
  if (action === 'approve') { const item = rowItem(target); if (item) item.approved = (target as HTMLInputElement).checked; updateApprovalSummary(); }
  if (action === 'approve-all' || action === 'approve-none') { const approve = action === 'approve-all'; visibleItems().forEach(item => { if (item.status === 'proposed') item.approved = approve; }); render(); }
  if (action === 'more') { visibleCount += 100; render(); document.querySelector('.file-row:nth-last-of-type(100)')?.scrollIntoView({ block: 'nearest' }); }
  if (action === 'execute') await executePlan();
  if (action === 'export-plan') exportPlan();
  if (action === 'export-json' && manifest) download(`triagebox-${manifest.runId}.json`, JSON.stringify(manifest, null, 2), 'application/json');
  if (action === 'export-csv' && manifest) download(`triagebox-${manifest.runId}.csv`, manifestToCsv(manifest), 'text/csv');
  if (action === 'undo' && manifest) await undoCurrent();
}

function updateApprovalSummary(): void {
  const summary = stats();
  const rail = document.querySelector('.action-rail');
  if (!rail) return;
  const count = rail.querySelector('strong'); if (count) count.textContent = `${summary.approved.toLocaleString()} route${summary.approved === 1 ? '' : 's'} approved`;
  const button = rail.querySelector('button'); if (button) { button.textContent = `Move ${!isPro && summary.approved > 100 ? 'first 100' : summary.approved} approved`; (button as HTMLButtonElement).disabled = !writable || summary.approved === 0; }
}

async function chooseFolder(): Promise<void> {
  if (!window.showDirectoryPicker) return;
  busy = true; notice = 'Waiting for folder permission…'; render();
  try {
    rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    rootName = rootHandle.name;
    writable = true;
    const result = await scanDirectory(rootHandle, (count, path) => { if (count < 10 || count % 25 === 0) updateActivity(`Surveying ${count.toLocaleString()} files · ${path}`); });
    items = result.items; sources = result.sources; manifest = undefined; visibleCount = 100;
    notice = items.length ? `Survey complete. ${items.length.toLocaleString()} files mapped; nothing moved.` : 'That folder is empty. Choose another folder when you are ready.';
    await saveSurvey({ rootName, savedAt: new Date().toISOString(), items });
  } catch (error) {
    notice = (error as DOMException).name === 'AbortError' ? 'Folder selection cancelled. Nothing was read.' : `Survey stopped: ${error instanceof Error ? error.message : 'Could not read that folder.'}`;
  } finally { busy = false; render(); }
}

async function previewFiles(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  if (!input.files?.length) { notice = 'No files were found in that selection.'; render(); return; }
  busy = true; updateActivity('Building a read-only survey…');
  items = await scanInputFiles(input.files, (count, path) => { if (count % 50 === 0) updateActivity(`Mapping ${count.toLocaleString()} files · ${path}`); });
  rootName = input.files[0] && ((input.files[0] as File & { webkitRelativePath?: string }).webkitRelativePath?.split('/')[0] || 'Preview folder');
  rootHandle = undefined; sources.clear(); writable = false; manifest = undefined; busy = false; notice = `${items.length.toLocaleString()} files mapped in read-only preview; nothing moved.`;
  await saveSurvey({ rootName, savedAt: new Date().toISOString(), items }); render();
}

function loadExample(): void {
  const now = new Date('2025-06-15').getTime();
  const examples = [
    ['IMG_4821.jpg', 'image/jpeg', 3_420_100, 'Camera uploads/IMG_4821.jpg'], ['contract-final.pdf', 'application/pdf', 842_300, 'Downloads/contract-final.pdf'],
    ['voice-note.m4a', 'audio/mp4', 1_209_201, 'Phone backup/voice-note.m4a'], ['archive-2019.zip', 'application/zip', 8_402_144, 'Old/archive-2019.zip'],
    ['notes.txt', 'text/plain', 9012, 'Desktop/notes.txt']
  ] as const;
  items = examples.map((entry, index) => createProposal({ name: entry[0], type: entry[1], size: entry[2], lastModified: now - index * 31_536_000_000, relativePath: entry[3] }, index));
  rootName = 'Example folder'; writable = false; rootHandle = undefined; sources.clear(); manifest = undefined; notice = 'Example survey loaded in preview mode. No real files are connected.'; render();
}

async function executePlan(): Promise<void> {
  if (!rootHandle || !writable) return;
  const selected = items.filter(item => item.approved && item.status === 'proposed');
  const run = isPro ? selected : selected.slice(0, 100);
  if (!run.length || !window.confirm(`Move ${run.length} approved file${run.length === 1 ? '' : 's'} inside “${rootName}”? Each file is copied and size-verified before its original is removed.`)) return;
  busy = true; manifest = buildManifest(rootName); render();
  for (let index = 0; index < run.length; index += 1) {
    const item = run[index]; item.status = 'moving'; updateActivity(`Moving ${index + 1} of ${run.length} · ${item.relativePath}`);
    const source = sources.get(item.id);
    if (!source) {
      item.status = 'failed'; item.error = 'Source handle is no longer available.';
      manifest.actions.push({ originalPath: item.relativePath, destinationPath: destinationFor(item), size: item.size, lastModified: item.lastModified, status: 'failed', error: item.error }); continue;
    }
    try {
      const action = await movePlanItem(rootHandle, item, source); item.status = 'moved'; item.finalDestination = action.destinationPath; manifest.actions.push(action);
    } catch (error) {
      item.status = 'failed'; item.error = error instanceof Error ? error.message : 'Move failed';
      manifest.actions.push({ originalPath: item.relativePath, destinationPath: destinationFor(item), size: item.size, lastModified: item.lastModified, status: 'failed', error: item.error });
    }
  }
  manifest.completedAt = new Date().toISOString(); busy = false;
  const moved = manifest.actions.filter(action => action.status === 'moved').length;
  notice = `Run finished: ${moved} moved, ${manifest.actions.length - moved} need attention. Export the receipt now.`;
  await saveSurvey({ rootName, savedAt: new Date().toISOString(), items, manifest }); render(); document.querySelector('.receipt')?.scrollIntoView({ behavior: 'smooth' });
}

async function undoCurrent(): Promise<void> {
  if (!rootHandle || !manifest) return;
  const count = manifest.actions.filter(action => action.status === 'moved').length;
  if (!window.confirm(`Undo ${count} moved file${count === 1 ? '' : 's'}? Existing original paths will never be overwritten.`)) return;
  busy = true; render();
  manifest = await undoManifest(rootHandle, manifest, (done, total, path) => updateActivity(`Undoing ${done} of ${total} · ${path}`));
  for (const item of items) { const record = manifest.actions.find(action => action.originalPath === item.relativePath); if (record?.status === 'undone') item.status = 'undone'; if (record?.status === 'failed') { item.status = 'failed'; item.error = record.error; } }
  busy = false; notice = 'Undo finished. Review the receipt for any paths needing attention.'; await saveSurvey({ rootName, savedAt: new Date().toISOString(), items, manifest }); render();
}

async function importUndoReceipt(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !window.showDirectoryPicker) return;
  try {
    const imported = JSON.parse(await file.text()) as TriageManifest;
    if (imported.schema !== 'triagebox-manifest-v1' || !Array.isArray(imported.actions)) throw new Error('Choose a Triagebox JSON receipt exported after a move.');
    const folder = await window.showDirectoryPicker({ mode: 'readwrite' });
    if (!window.confirm(`Use “${folder.name}” to undo ${imported.actions.filter(action => action.status === 'moved').length} recorded moves? Existing paths will not be overwritten.`)) return;
    busy = true; manifest = imported; rootHandle = folder; rootName = folder.name; writable = true; items = []; render();
    manifest = await undoManifest(folder, manifest, (done, total, path) => updateActivity(`Undoing ${done} of ${total} · ${path}`));
    busy = false; notice = 'Imported undo finished. Export the updated receipt for your records.';
    await saveSurvey({ rootName, savedAt: new Date().toISOString(), items, manifest }); render();
  } catch (error) {
    busy = false; notice = `Receipt could not be undone: ${error instanceof Error ? error.message : 'invalid file'}`; render();
  } finally { input.value = ''; }
}

function exportPlan(): void {
  const plan = { schema: 'triagebox-plan-v1', rootName, createdAt: new Date().toISOString(), note: 'Plan only; no files were moved by this export.', actions: items.map(item => ({ approved: item.approved, originalPath: item.relativePath, destinationPath: destinationFor(item), size: item.size, lastModified: item.lastModified, reason: item.reason })) };
  download(`triagebox-plan-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(plan, null, 2), 'application/json');
}

function download(filename: string, contents: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function onLicense(event: SubmitEvent): Promise<void> {
  event.preventDefault(); const input = document.querySelector<HTMLInputElement>('#license-token'); if (!input?.value.trim()) { updateActivity('Paste the license token from your receipt first.'); return; }
  updateActivity('Verifying license…'); isPro = await restoreLicense(input.value); notice = isPro ? 'Pro unlocked. Whole-folder runs are available.' : 'That license could not be verified. Check the token or buy a license.'; render();
}

async function boot(): Promise<void> {
  captureReturnedLicense();
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/privacy') { renderLegal('privacy'); registerPwa(); return; }
  if (path === '/terms') { renderLegal('terms'); registerPwa(); return; }
  try {
    const saved = await loadSurvey();
    if (saved?.items.length) { items = saved.items; rootName = saved.rootName; manifest = saved.manifest; writable = false; notice = `Restored the last local survey from ${new Date(saved.savedAt).toLocaleDateString()}. Re-select the folder to perform moves.`; }
  } catch { notice = 'Local history is unavailable, but a new survey still works.'; }
  render();
  if (storedToken()) { const valid = await verifyLicense(); if (valid !== isPro) { isPro = valid; render(); } }
  registerPwa();
}

function registerPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message', event => { if (event.data?.type === 'UPDATE_READY') showToast('Triagebox is ready offline. Refresh anytime for the newest map.'); });
  navigator.serviceWorker.register('/sw.js').catch(() => undefined);
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLElement>('#toast'); if (!toast) return; toast.textContent = message; toast.hidden = false; setTimeout(() => { toast.hidden = true; }, 6000);
}

window.addEventListener('online', () => { notice = 'Back online. Local file processing was never interrupted.'; render(); });
window.addEventListener('offline', () => { notice = 'Offline map active — local scans and saved receipts still work.'; render(); });

void boot();
