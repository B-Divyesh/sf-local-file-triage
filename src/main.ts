import './styles.css';
import { BUCKETS, createProposal, destinationFor, formatBytes, manifestToCsv, safeName, type PlanItem, type TriageManifest } from './triage';
import { buildManifest, movePlanItem, scanDirectory, scanInputFiles, undoManifest, type DirectoryHandleLike, type SourceMap } from './filesystem';
import { clearSurvey, loadSurvey, saveSurvey, type StorageNamespace } from './storage';
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
let demoMode = false;
let persistQueue: Promise<void> = Promise.resolve();
const releaseVersion = '1.0.2';
const buildId = import.meta.env.VITE_BUILD_ID || 'development';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);

function shell(content: string): string {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="Triagebox home"><img src="/icons/triagebox-mark.svg" alt="" width="36" height="36"><span>Triagebox</span></a>
    <nav aria-label="Primary"><a href="/demo">Demo</a><a href="/#workbench">Workbench</a><a href="/#unlock">Upgrade</a></nav>
  </header><div id="update-notice" class="update-notice" role="status" aria-live="polite" hidden><span></span><button type="button" data-action="dismiss-update" aria-label="Dismiss update notice">Dismiss</button></div>${content}<footer><div><strong>Triagebox</strong><p>Review file moves before they happen.</p></div><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-local-file-triage" aria-label="View source on GitHub (opens in a new site)">View source on GitHub <span class="sr-only">(opens in a new site)</span></a></nav><p class="provenance">Map artwork generated for Triagebox · 2026 · v${releaseVersion} · build ${escapeHtml(buildId)}</p></footer>
  <div id="route-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>`;
}

function setRouteMetadata(title: string, description: string, canonicalPath: string): void {
  document.title = title;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = `https://local-file-triage.sociobot.in${canonicalPath}`;
  const values: Record<string, string> = {
    'meta[name="description"]': description,
    'meta[property="og:title"]': title,
    'meta[property="og:description"]': description,
    'meta[name="twitter:title"]': title,
    'meta[name="twitter:description"]': description
  };
  for (const [selector, value] of Object.entries(values)) {
    const element = document.querySelector<HTMLMetaElement>(selector);
    if (element) element.content = value;
  }
}

function announceRoute(title: string): void {
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('main h1');
    heading?.focus({ preventScroll: true });
    const announcer = document.querySelector<HTMLElement>('#route-announcer');
    if (announcer) announcer.textContent = title;
  });
}

const storageNamespace = (): StorageNamespace => demoMode ? 'demo' : 'real';

async function persistSurvey(): Promise<void> {
  if (!items.length && !manifest) return;
  // Input events can arrive faster than IndexedDB transactions. Serialising
  // immutable snapshots prevents an older edit from committing after a newer one.
  const snapshot = { rootName, savedAt: new Date().toISOString(), items: structuredClone(items), manifest: manifest && structuredClone(manifest) };
  persistQueue = persistQueue.catch(() => undefined).then(() => saveSurvey(snapshot, storageNamespace()));
  await persistQueue;
}

function renderLegal(kind: 'privacy' | 'terms'): void {
  const privacy = `<p class="eyebrow">Field note 01 · Effective 28 August 2026</p><h1 tabindex="-1">Keep your file details on this device.</h1>
    <p class="lede">Triagebox handles selected file details in this browser. File details are not sent to another service.</p>
    <h2>What stays on your device</h2><p>Your last survey and receipt use this browser’s IndexedDB. The sample uses its own demo record. A Pro license token and its check result use localStorage. Triagebox asks the browser for folder access only after you choose a folder.</p>
    <h2>What crosses the network</h2><p>The app loads from this site. Pro license checks use the Sociobot billing API. Your selected file details are not part of that request.</p>
    <h2>Your control</h2><p>Clear this site’s storage to remove saved surveys and the license token. Exported receipts are files you control. Remove folder permission in browser settings when you are finished.</p>
    <h2>Contact</h2><p>Privacy questions can be sent through the project’s public issue tracker. Do not include private filenames or license tokens.</p>`;
  const terms = `<p class="eyebrow">File move terms · Effective 28 August 2026</p><h1 tabindex="-1">Review each destination before moving a file.</h1>
    <p class="lede">Triagebox proposes and performs file moves only after your approval. You must review each destination and keep independent backups.</p>
    <h2>Safe-use agreement</h2><p>The app copies each approved file, checks its byte size, then removes the original. It avoids overwriting collisions and records an undo receipt. Browser APIs cannot restore a copied file’s modified date. The receipt records the original timestamp. Keep a backup for important work.</p>
    <h2>License</h2><p>The free tier includes surveys, edits, exports, undo, and 100 moves per run. Triagebox Pro costs $19 once and removes that limit on the licensed device. Safety and accessibility controls stay free.</p>
    <h2>Purchases</h2><p>The purchase link opens a checkout page hosted by Sociobot/Dodo. That page provides its own purchase terms. A revoked license returns the app to its free move limit. Your local data remains available.</p>
    <h2>Warranty</h2><p>The software is provided “as is”, without warranty, to the extent permitted by law. Test with a backed-up folder first and inspect the exported receipt.</p>`;
  app.innerHTML = shell(`<main id="main" class="legal"><a class="back-link" href="/">← Back to Triagebox</a>${kind === 'privacy' ? privacy : terms}</main>`);
  announceRoute(kind === 'privacy' ? 'Privacy — Triagebox' : 'Terms — Triagebox');
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
  if (!shown.length) return `<div class="queue-empty"><span aria-hidden="true">⌖</span><h3>No proposed destinations match this search.</h3><p>Clear the filter to see the full survey.</p></div>`;
  return `${shown.map(item => `<article class="file-row" data-id="${escapeHtml(item.id)}">
    <label class="approve"><input type="checkbox" data-action="approve" ${item.approved ? 'checked' : ''} ${item.status !== 'proposed' ? 'disabled' : ''}><span class="sr-only">Approve ${escapeHtml(item.name)}</span></label>
    <div class="source"><strong title="${escapeHtml(item.relativePath)}">${escapeHtml(item.name)}</strong><span>${escapeHtml(item.relativePath)} · ${formatBytes(item.size)}</span></div>
    <div class="reason"><span class="route-arrow" aria-hidden="true">→</span><span>${escapeHtml(item.reason)}</span></div>
    <label class="bucket"><span class="sr-only">Destination bucket for ${escapeHtml(item.name)}</span><select data-action="bucket" ${item.status !== 'proposed' ? 'disabled' : ''}>${BUCKETS.map(bucket => `<option ${bucket === item.bucket ? 'selected' : ''}>${bucket}</option>`).join('')}</select><span class="year">/${item.year}/</span></label>
    <label class="rename"><span class="sr-only">Destination name for ${escapeHtml(item.name)}</span><input data-action="rename" value="${escapeHtml(item.destinationName)}" ${item.status !== 'proposed' ? 'disabled' : ''}></label>
    <span class="row-status ${item.status}" aria-label="Status: ${item.status}">${item.status === 'proposed' ? 'Ready' : item.status}${item.error ? ` · ${escapeHtml(item.error)}` : ''}</span>
  </article>`).join('')}${shown.length < filtered.length ? `<button class="load-more" data-action="more">Show 100 more <span>(${filtered.length - shown.length} remain)</span></button>` : ''}`;
}

function displayedItems(): PlanItem[] {
  return visibleItems().slice(0, visibleCount);
}

function workbench(): string {
  const summary = stats();
  const fileApi = Boolean(window.showDirectoryPicker);
  if (!items.length) return `<section id="workbench" class="workbench empty-workbench" aria-labelledby="workbench-title">
    <div class="section-index">02 / Choose and review a folder</div><h2 id="workbench-title">Open one folder. Nothing moves yet.</h2>
    <p>After you choose a folder, Triagebox suggests a destination from each file’s type and year.</p>
    <div class="primary-actions"><button class="primary" data-action="scan" ${busy || !fileApi ? 'disabled' : ''}>Choose a folder</button><button data-action="preview" ${busy ? 'disabled' : ''}>Preview a folder</button><button data-action="import-undo" ${busy || !fileApi ? 'disabled' : ''}>Undo from receipt</button><a class="button text-button" href="/demo">Try the five-file sample</a></div>
    ${!fileApi ? '<p class="callout warning"><strong>Read-only browser:</strong> folder write access needs desktop Chrome or Edge. You can still preview and export a plan here.</p>' : ''}
    <input id="folder-input" type="file" webkitdirectory multiple hidden aria-label="Choose a folder for read-only preview">
    <input id="manifest-input" type="file" accept="application/json,.json" hidden aria-label="Choose a Triagebox JSON receipt to undo">
    <section class="how-it-works" aria-labelledby="how-it-works-title"><h3 id="how-it-works-title">How review-before-move works</h3><ol class="trust-strip"><li><strong>1. Survey</strong>Choose one local folder.</li><li><strong>2. Review</strong>Check each destination you want.</li><li><strong>3. Move</strong>Copy, verify, then keep a receipt.</li></ol></section>${manifest ? receipt() : ''}
  </section>`;
  const previewNote = writable ? 'Write access granted. Approved rows can move.' : 'Preview only. Export this plan or reopen in desktop Chrome/Edge to move files.';
  return `<section id="workbench" class="workbench" aria-labelledby="workbench-title">
    <div class="workbench-head"><div><div class="section-index">02 / Review this folder · ${escapeHtml(rootName)}</div><h2 id="workbench-title">Review every proposed destination.</h2><p>${previewNote}</p></div><div class="head-actions"><button data-action="import-undo" ${busy || !window.showDirectoryPicker ? 'disabled' : ''}>Undo from receipt</button><button data-action="new-scan">Survey another folder</button></div></div>
    <div class="legend" aria-label="Survey summary"><div><strong>${items.length.toLocaleString()}</strong><span>files mapped</span></div><div><strong>${summary.approved.toLocaleString()}</strong><span>approved</span></div><div><strong>${formatBytes(summary.bytes)}</strong><span>surveyed</span></div><div><strong>${summary.moved.toLocaleString()}</strong><span>moved</span></div></div>
    <div class="queue-tools"><label class="search"><span>Filter proposed destinations</span><input type="search" id="filter" value="${escapeHtml(query)}" placeholder="Name, bucket, or year"></label><div class="bulk"><button data-action="approve-all">Approve displayed (${Math.min(visibleItems().length, visibleCount)})</button><button data-action="approve-none">Clear displayed (${Math.min(visibleItems().length, visibleCount)})</button><button data-action="export-plan">Export plan JSON</button></div></div>
    <div class="queue-labels" aria-hidden="true"><span>Approve / source</span><span>Reason</span><span>Destination</span><span>Name / status</span></div>
    <div class="file-queue" aria-label="Proposed file moves">${proposalRows()}</div>
    <div class="action-rail"><div><strong>${summary.approved.toLocaleString()} file move${summary.approved === 1 ? '' : 's'} approved</strong><span>${!isPro && summary.approved > 100 ? 'Free runs move the first 100. The rest remain safely queued.' : 'Only checked rows will move.'}</span></div><button class="primary" data-action="execute" ${busy || !writable || summary.approved === 0 ? 'disabled' : ''}>${busy ? 'Working…' : `Move ${!isPro && summary.approved > 100 ? 'first 100' : summary.approved} approved`}</button></div>
    ${manifest ? receipt() : ''}
    <input id="manifest-input" type="file" accept="application/json,.json" hidden aria-label="Choose a Triagebox JSON receipt to undo">
  </section>`;
}

function receipt(): string {
  if (!manifest) return '';
  const moved = manifest.actions.filter(action => action.status === 'moved').length;
  const failed = manifest.actions.filter(action => action.status === 'failed').length;
  const undone = manifest.actions.filter(action => action.status === 'undone').length;
  const retryable = moved + failed;
  return `<section class="receipt" aria-labelledby="receipt-title"><div><p class="eyebrow">Portable receipt · ${escapeHtml(manifest.runId.slice(0, 8))}</p><h3 id="receipt-title">${moved} moved · ${undone} undone · ${failed} need attention</h3><p>Keep this receipt beside your backup. It records original paths, destinations, byte sizes, and original modified dates.</p></div><div class="receipt-actions"><button data-action="export-json">Export JSON</button><button data-action="export-csv">Export CSV</button><button data-action="undo" ${busy || retryable === 0 || !rootHandle ? 'disabled' : ''}>${failed ? 'Retry undo' : 'Undo this run'}</button></div></section>`;
}

function upgrade(): string {
  return `<section id="unlock" class="upgrade" aria-labelledby="upgrade-title"><div class="contour-badge" aria-hidden="true"><i></i><i></i><i></i></div><div><p class="eyebrow">Optional Pro license</p><h2 id="upgrade-title">Remove the 100-file move limit</h2><p>Free includes surveys, editing, exports, undo, and 100 moves per run. A <strong>$19 one-time Triagebox Pro license</strong> removes the per-run limit. Your safety controls stay free.</p><div class="upgrade-actions">${isPro ? '<span class="license-good">✓ Pro unlocked on this device</span>' : `<a class="button primary" href="${checkoutUrl}" aria-label="Buy Pro on Sociobot/Dodo · $19">Buy Pro on Sociobot/Dodo · $19 <span class="sr-only">(opens in a new site)</span></a>`}<details><summary>Have a license? Restore it</summary><form id="license-form"><label for="license-token">License token</label><div class="inline-field"><input id="license-token" autocomplete="off" value="${escapeHtml(storedToken())}"><button type="submit" aria-label="Verify license">Verify license</button></div></form></details></div><p class="fine-print">Checkout opens on Sociobot/Dodo. See <a href="/terms/">terms</a> and <a href="/privacy/">privacy</a>.</p></div></section>`;
}

function render(): void {
  const online = navigator.onLine;
  const demoBanner = demoMode ? '<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span>Sample destinations stay separate from your local survey.</span><button data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></aside>' : '';
  app.innerHTML = shell(`${!online ? '<div class="network-note" role="status">Offline map active — local scans and saved receipts still work.</div>' : ''}${demoBanner}<main id="main">
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Organize files locally · No uploads</p><h1 tabindex="-1">Survey the folder.<br><em>Approve every move.</em></h1><p class="lede">For people cleaning a messy folder, Triagebox shows where each file will go before it moves.</p><div class="hero-actions"><a class="button primary" href="/demo">Try it with sample data</a><span>See five proposed destinations. Nothing is saved.</span></div><dl class="coordinates"><div><dt>File details</dt><dd>Stay in this browser</dd></div><div><dt>Method</dt><dd>Copy · verify · remove</dd></div><div><dt>Receipt</dt><dd>JSON + CSV</dd></div></dl></div><figure class="map-figure"><picture><source type="image/webp" srcset="/assets/triage-map-480.webp 480w, /assets/triage-map.webp 800w" sizes="(max-width: 680px) 350px, (max-width: 960px) 620px, 42vw"><img src="/assets/triage-map-800.jpg" width="800" height="800" alt="An overhead paper topographic map where scattered file tabs connect to one deliberate destination path" fetchpriority="high" decoding="async"></picture><figcaption>See every proposed destination before moving a file.</figcaption></figure></section>
    <div class="status-line"><span class="status-dot ${busy ? 'busy' : ''}"></span><span id="activity" role="status" aria-live="polite" aria-atomic="true">${escapeHtml(notice || (items.length ? `${items.length.toLocaleString()} files in the current survey` : 'Ready. No folder permission requested yet.'))}</span><span class="coord">51.000° LOCAL / FILE DETAILS STAY HERE</span></div>
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
    const item = rowItem(event.currentTarget as Element); if (item) { item.bucket = select.value as typeof item.bucket; void persistSurvey(); }
  }));
  document.querySelectorAll<HTMLInputElement>('[data-action="rename"]').forEach(input => input.addEventListener('input', event => {
    const item = rowItem(event.currentTarget as Element); if (item) { item.destinationName = safeName(input.value, item.name); input.value = item.destinationName; void persistSurvey(); }
  }));
  const filter = document.querySelector<HTMLInputElement>('#filter');
  filter?.addEventListener('input', () => { query = filter.value; visibleCount = 100; const queue = document.querySelector('.file-queue'); if (queue) queue.innerHTML = proposalRows(); bindQueueEvents(); });
  document.querySelector<HTMLInputElement>('#folder-input')?.addEventListener('change', previewFiles);
  document.querySelector<HTMLInputElement>('#manifest-input')?.addEventListener('change', importUndoReceipt);
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', onLicense);
}

function bindQueueEvents(): void {
  document.querySelectorAll<HTMLElement>('.file-queue [data-action]').forEach(control => control.addEventListener('click', onAction));
  document.querySelectorAll<HTMLSelectElement>('.file-queue [data-action="bucket"]').forEach(select => select.addEventListener('change', () => { const item = rowItem(select); if (item) { item.bucket = select.value as typeof item.bucket; void persistSurvey(); } }));
  document.querySelectorAll<HTMLInputElement>('.file-queue [data-action="rename"]').forEach(input => input.addEventListener('input', () => { const item = rowItem(input); if (item) { item.destinationName = safeName(input.value, item.name); void persistSurvey(); } }));
}

async function onAction(event: Event): Promise<void> {
  const target = event.currentTarget as HTMLElement;
  const action = target.dataset.action;
  if (action === 'scan') await chooseFolder();
  if (action === 'preview') document.querySelector<HTMLInputElement>('#folder-input')?.click();
  if (action === 'start-real' && demoMode) { await clearSurvey('demo'); location.assign('/'); return; }
  if (action === 'dismiss-update') { document.querySelector<HTMLElement>('#update-notice')!.hidden = true; }
  if (action === 'new-scan') { items = []; sources.clear(); rootHandle = undefined; manifest = undefined; rootName = ''; writable = false; notice = ''; render(); }
  if (action === 'reset-demo' && demoMode) { await loadExample(true); }
  if (action === 'import-undo') document.querySelector<HTMLInputElement>('#manifest-input')?.click();
  if (action === 'approve') { const item = rowItem(target); if (item) { item.approved = (target as HTMLInputElement).checked; await persistSurvey(); } updateApprovalSummary(); }
  if (action === 'approve-all' || action === 'approve-none') { const approve = action === 'approve-all'; displayedItems().forEach(item => { if (item.status === 'proposed') item.approved = approve; }); await persistSurvey(); render(); }
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
  const count = rail.querySelector('strong'); if (count) count.textContent = `${summary.approved.toLocaleString()} file move${summary.approved === 1 ? '' : 's'} approved`;
  const detail = rail.querySelector('span'); if (detail) detail.textContent = !isPro && summary.approved > 100 ? 'Free runs move the first 100. The rest remain safely queued.' : 'Only checked rows will move.';
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
    await persistSurvey();
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
  await persistSurvey(); render();
}

async function loadExample(reset = false): Promise<void> {
  const now = new Date('2025-06-15').getTime();
  const examples = [
    ['IMG_4821.jpg', 'image/jpeg', 3_420_100, 'Camera uploads/IMG_4821.jpg'], ['contract-final.pdf', 'application/pdf', 842_300, 'Downloads/contract-final.pdf'],
    ['voice-note.m4a', 'audio/mp4', 1_209_201, 'Phone backup/voice-note.m4a'], ['archive-2019.zip', 'application/zip', 8_402_144, 'Old/archive-2019.zip'],
    ['notes.txt', 'text/plain', 9012, 'Desktop/notes.txt']
  ] as const;
  items = examples.map((entry, index) => createProposal({ name: entry[0], type: entry[1], size: entry[2], lastModified: now - index * 31_536_000_000, relativePath: entry[3] }, index));
  rootName = 'Sample folder'; writable = false; rootHandle = undefined; sources.clear(); manifest = undefined; notice = reset ? 'Demo reset. The five sample destinations are back.' : 'Five sample destinations loaded. No real files are connected.';
  await persistSurvey(); render();
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
  await persistSurvey(); render(); document.querySelector('.receipt')?.scrollIntoView({ behavior: 'smooth' });
}

async function undoCurrent(): Promise<void> {
  if (!rootHandle || !manifest) return;
  const count = manifest.actions.filter(action => action.status !== 'undone').length;
  if (!window.confirm(`Undo or retry ${count} file${count === 1 ? '' : 's'}? Existing original paths will never be overwritten.`)) return;
  busy = true; render();
  manifest = await undoManifest(rootHandle, manifest, (done, total, path) => updateActivity(`Undoing ${done} of ${total} · ${path}`));
  for (const item of items) { const record = manifest.actions.find(action => action.originalPath === item.relativePath); if (record?.status === 'undone') item.status = 'undone'; if (record?.status === 'failed') { item.status = 'failed'; item.error = record.error; } }
  busy = false; notice = 'Undo finished. Review the receipt for any paths needing attention.'; await persistSurvey(); render();
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
    await persistSurvey(); render();
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
  if (path === '/privacy') { setRouteMetadata('Privacy — Triagebox', 'Learn how Triagebox keeps selected file details in this browser.', '/privacy/'); renderLegal('privacy'); registerPwa(); return; }
  if (path === '/terms') { setRouteMetadata('Terms — Triagebox', 'Read the terms for reviewing and moving files with Triagebox.', '/terms/'); renderLegal('terms'); registerPwa(); return; }
  demoMode = path === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
  if (path !== '/' && path !== '/demo') { setRouteMetadata('Page not found — Triagebox', 'This Triagebox route does not exist. Return home or try the five-file sample.', '/404'); renderNotFound(); registerPwa(); return; }
  setRouteMetadata(demoMode ? 'Demo — Triagebox' : 'Triagebox — organize files locally', demoMode ? 'Try five sample file destinations in an isolated Triagebox demo.' : 'Review proposed file destinations before moving local files.', demoMode ? '/demo' : '/');
  try {
    const saved = await loadSurvey(storageNamespace());
    if (saved && (saved.items.length || saved.manifest)) { items = saved.items; rootName = saved.rootName; manifest = saved.manifest; writable = false; notice = demoMode ? 'Demo restored. Sample data remains separate from your local survey.' : `Restored the last local survey from ${new Date(saved.savedAt).toLocaleDateString()}. Re-select the folder to perform moves.`; }
    else if (demoMode) await loadExample();
  } catch { notice = 'Local history is unavailable, but a new survey still works.'; }
  render();
  announceRoute(demoMode ? 'Demo — Triagebox' : 'Triagebox — organize files locally');
  if (storedToken()) { const valid = await verifyLicense(); if (valid !== isPro) { isPro = valid; render(); } }
  registerPwa();
}

function renderNotFound(): void {
  app.innerHTML = shell(`<main id="main" class="legal"><p class="eyebrow">Map edge</p><h1 tabindex="-1">This route is not on the map.</h1><p class="lede">Return to Triagebox to survey a folder or use the sample data.</p><p><a class="button primary" href="/">Open Triagebox</a></p></main>`);
  announceRoute('Page not found — Triagebox');
}

function registerPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message', event => { if (event.data?.type === 'UPDATE_READY') showUpdateNotice('A newer Triagebox version is ready. Refresh to update the app.'); });
  navigator.serviceWorker.register('/sw.js').catch(() => undefined);
}

function showUpdateNotice(message: string): void {
  const notice = document.querySelector<HTMLElement>('#update-notice');
  const text = notice?.querySelector('span');
  if (!notice || !text) return;
  text.textContent = message;
  notice.hidden = false;
}

window.addEventListener('online', () => { notice = 'Back online. Local file processing was never interrupted.'; render(); });
window.addEventListener('offline', () => { notice = 'Offline map active — local scans and saved receipts still work.'; render(); });

void boot();
