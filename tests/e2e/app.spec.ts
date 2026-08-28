import { test, expect } from '@playwright/test';
import axe from 'axe-core';

test('home explains safety and offers a useful preview workflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Survey the folder/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('img')).toHaveAttribute('alt', /topographic map/);
  await page.getByRole('button', { name: 'Try the five-file sample' }).click();
  await expect(page.locator('.legend > div').first()).toContainText('5files mapped');
  await expect(page.locator('.file-row')).toHaveCount(5);
  await page.getByLabel('Destination bucket for IMG_4821.jpg').selectOption('Documents');
  await expect(page.getByLabel('Destination bucket for IMG_4821.jpg')).toHaveValue('Documents');
  expect(errors).toEqual([]);
});

test('@claim:demo-sandbox the /demo route is one-click, seeded, resettable, and isolated', async ({ page }) => {
  await page.goto('/');
  // Seed an intentionally private real record. The demo must never read it.
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('triagebox-local', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('surveys', 'readwrite');
      tx.objectStore('surveys').put({ rootName: 'Private', savedAt: new Date().toISOString(), items: [{ id: 'private', name: 'PRIVATE-tax-record.pdf', type: 'application/pdf', size: 1, lastModified: 1, relativePath: 'PRIVATE-tax-record.pdf', bucket: 'Documents', year: '1970', destinationName: 'PRIVATE-tax-record.pdf', reason: 'PDF', approved: true, status: 'proposed' }] }, 'latest');
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Triagebox');
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.locator('.file-row')).toHaveCount(5);
  await expect(page.getByText('PRIVATE-tax-record.pdf')).toHaveCount(0);
  await page.getByLabel('Approve IMG_4821.jpg').check();
  await page.getByLabel('Destination bucket for IMG_4821.jpg').selectOption('Archives');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#activity')).toHaveText('Demo reset. The five sample routes are back.');
  await expect(page.locator('.file-row')).toHaveCount(5);
  await expect(page.locator('.approve input:checked')).toHaveCount(0);
  await expect(page.getByLabel('Destination bucket for IMG_4821.jpg')).toHaveValue('Photos');
});

test('@claim:approval-required new routes require an explicit check before they are approved', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('0 routes approved')).toBeVisible();
  await expect(page.locator('.approve input:checked')).toHaveCount(0);
  await page.getByLabel('Approve IMG_4821.jpg').check();
  await expect(page.getByText('1 route approved')).toBeVisible();
});

test('@claim:displayed-bulk-controls bulk approval never changes an undisplayed row', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const transfer = new DataTransfer();
    for (let index = 0; index < 101; index += 1) transfer.items.add(new File([String(index)], `scan-${index}.txt`, { type: 'text/plain' }));
    const input = document.querySelector<HTMLInputElement>('#folder-input')!;
    Object.defineProperty(input, 'files', { configurable: true, value: transfer.files });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('.file-row')).toHaveCount(100);
  await page.getByRole('button', { name: 'Approve displayed (100)' }).click();
  await expect(page.getByText('100 routes approved')).toBeVisible();
  await page.getByRole('button', { name: /Show 100 more/ }).click();
  await expect(page.locator('.file-row')).toHaveCount(101);
  await expect(page.getByLabel('Approve scan-100.txt')).not.toBeChecked();
});

test('@claim:review-persistence approvals and destination edits survive a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try the five-file sample' }).click();
  await page.getByLabel('Approve IMG_4821.jpg').check();
  await page.getByLabel('Destination bucket for IMG_4821.jpg').selectOption('Archives');
  await page.getByLabel('Destination name for IMG_4821.jpg').fill('revised.jpg');
  await expect(page.getByLabel('Destination name for IMG_4821.jpg')).toHaveValue('revised.jpg');
  await page.waitForTimeout(100);
  await page.reload();
  await expect(page.getByLabel('Approve IMG_4821.jpg')).toBeChecked();
  await expect(page.getByLabel('Destination bucket for IMG_4821.jpg')).toHaveValue('Archives');
  await expect(page.getByLabel('Destination name for IMG_4821.jpg')).toHaveValue('revised.jpg');
});

test('@claim:imported-receipt-export an imported receipt remains visible and exportable after undo', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('triagebox-local', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('surveys', 'readwrite');
      tx.objectStore('surveys').put({ rootName: 'Imported', savedAt: new Date().toISOString(), items: [], manifest: { schema: 'triagebox-manifest-v1', runId: 'imported-receipt', rootName: 'Imported', createdAt: new Date().toISOString(), note: '', actions: [{ originalPath: 'in/a.txt', destinationPath: 'Triagebox/Documents/2026/a.txt', size: 1, lastModified: 1, status: 'undone' }] } }, 'latest');
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: /0 moved · 1 undone/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
});

test('@claim:local-only demo interactions make no third-party network requests', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/demo');
  await page.getByLabel('Approve IMG_4821.jpg').check();
  await page.getByLabel('Destination bucket for IMG_4821.jpg').selectOption('Documents');
  expect(external).toEqual([]);
});

test('@claim:real-file-locality selected file details stay local through preview, move, receipt export, and undo', async ({ page }) => {
  await page.addInitScript(() => {
    let bytes = new Uint8Array([7, 8, 9]);
    const directory = (name: string): Record<string, unknown> => {
      const entries = new Map<string, unknown>();
      return {
        kind: 'directory', name, entriesMap: entries,
        async *entries() { yield* entries.entries() as IterableIterator<[string, unknown]>; },
        async getDirectoryHandle(child: string, options?: { create?: boolean }) { const found = entries.get(child); if (found) return found; if (!options?.create) throw new DOMException('Missing', 'NotFoundError'); const created = directory(child); entries.set(child, created); return created; },
        async getFileHandle(child: string, options?: { create?: boolean }) { const found = entries.get(child); if (found) return found; if (!options?.create) throw new DOMException('Missing', 'NotFoundError'); const created = file(child); entries.set(child, created); return created; },
        async removeEntry(child: string) { if (!entries.delete(child)) throw new DOMException('Missing', 'NotFoundError'); }
      };
    };
    const file = (name: string): Record<string, unknown> => ({
      kind: 'file', name,
      async getFile() { return new File([bytes], name, { type: 'text/plain', lastModified: 1_700_000_000_000 }); },
      async createWritable() { return { async write(data: ArrayBuffer) { bytes = new Uint8Array(data); }, async close() {} }; }
    });
    const root = directory('Private folder');
    (root.entriesMap as Map<string, unknown>).set('private-notes.txt', file('private-notes.txt'));
    Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: async () => root });
  });
  const external: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Choose a folder' }).click();
  await expect(page.getByText('private-notes.txt', { exact: true })).toBeVisible();
  await page.getByLabel('Approve private-notes.txt').check();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Move 1 approved' }).click();
  await expect(page.getByRole('heading', { name: /1 moved/ })).toBeVisible();
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await page.getByRole('button', { name: 'Export CSV' }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Undo this run' }).click();
  await expect(page.getByRole('heading', { name: /0 moved · 1 undone/ })).toBeVisible();
  expect(external).toEqual([]);
});

test('@claim:browser-capabilities desktop folder choice is available and read-only preview can export a plan', async ({ page, context }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: async () => ({}) }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Choose a folder' })).toBeEnabled();
  const fallback = await context.newPage();
  await fallback.addInitScript(() => Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: undefined }));
  await fallback.goto('/');
  await expect(fallback.getByText('Read-only browser:')).toBeVisible();
  await fallback.evaluate(() => {
    const transfer = new DataTransfer(); transfer.items.add(new File(['plan'], 'read-only.txt', { type: 'text/plain' }));
    const input = document.querySelector<HTMLInputElement>('#folder-input')!;
    Object.defineProperty(input, 'files', { configurable: true, value: transfer.files }); input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(fallback.getByText('read-only.txt', { exact: true })).toBeVisible();
  const download = fallback.waitForEvent('download');
  await fallback.getByRole('button', { name: 'Export plan JSON' }).click();
  expect((await download).suggestedFilename()).toMatch(/triagebox-plan-.*\.json/);
  await fallback.close();
});

test('@claim:storage-boundary demo, real survey, and license storage use the documented separate keys', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/local-file-triage/verify?license=fixture-license', route => route.fulfill({ json: { valid: true } }));
  await page.goto('/demo');
  await page.getByLabel('Approve IMG_4821.jpg').check();
  await page.goto('/');
  await page.getByRole('button', { name: 'Try the five-file sample' }).click();
  await page.getByText('Example survey loaded in preview mode.').waitFor();
  await page.getByText('Have a license?').click();
  await page.getByLabel('License token').fill('fixture-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Pro unlocked on this device')).toBeVisible();
  const storage = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('triagebox-local', 1); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const keys = await new Promise<IDBValidKey[]>((resolve, reject) => { const request = db.transaction('surveys').objectStore('surveys').getAllKeys(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); db.close();
    return { indexedDb: keys.sort(), local: Object.keys(localStorage).filter(key => key.startsWith('sb_license:')).sort() };
  });
  expect(storage).toEqual({ indexedDb: ['demo:latest', 'latest'], local: ['sb_license:local-file-triage', 'sb_license:local-file-triage:verdict'] });
});

test('@claim:no-tracking-runtime every product route loads only same-origin runtime resources', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  for (const path of ['/', '/demo', '/privacy/', '/terms/']) { await page.goto(path); await expect(page.locator('main')).toHaveCount(1); }
  expect(external).toEqual([]);
});

test('@claim:free-limit free runs show a 100-file limit and a fixture license removes it', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/local-file-triage/verify?license=fixture-pro', route => route.fulfill({ json: { valid: true } }));
  await page.addInitScript(() => {
    const directory = (name: string): Record<string, unknown> => {
      const entries = new Map<string, unknown>();
      return {
        kind: 'directory', name, entriesMap: entries,
        async *entries() { yield* entries.entries() as IterableIterator<[string, unknown]>; },
        async getDirectoryHandle(child: string, options?: { create?: boolean }) { const found = entries.get(child); if (found) return found; if (!options?.create) throw new DOMException('Missing', 'NotFoundError'); const created = directory(child); entries.set(child, created); return created; },
        async getFileHandle(child: string, options?: { create?: boolean }) { const found = entries.get(child); if (found) return found; if (!options?.create) throw new DOMException('Missing', 'NotFoundError'); const created = file(child); entries.set(child, created); return created; },
        async removeEntry(child: string) { if (!entries.delete(child)) throw new DOMException('Missing', 'NotFoundError'); }
      };
    };
    const file = (name: string): Record<string, unknown> => {
      let bytes = new Uint8Array([1]);
      return { kind: 'file', name, async getFile() { return new File([bytes], name, { type: 'text/plain', lastModified: 1_700_000_000_000 }); }, async createWritable() { return { async write(data: ArrayBuffer) { bytes = new Uint8Array(data); }, async close() {} }; } };
    };
    const root = directory('Limit folder');
    for (let index = 0; index < 101; index += 1) (root.entriesMap as Map<string, unknown>).set(`limit-${index}.txt`, file(`limit-${index}.txt`));
    Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: async () => root });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Choose a folder' }).click();
  await page.getByRole('button', { name: 'Approve displayed (100)' }).click();
  await page.getByRole('button', { name: /Show 100 more/ }).click();
  await page.getByLabel('Approve limit-100.txt').evaluate((input: HTMLInputElement) => input.click());
  await expect(page.getByRole('button', { name: 'Move first 100 approved' })).toBeVisible();
  await expect(page.getByText('Free runs move the first 100.')).toHaveText(/The rest remain safely queued/);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Move first 100 approved' }).click();
  await expect(page.getByRole('heading', { name: /100 moved · 0 undone/ })).toBeVisible();
  await expect(page.locator('.row-status.proposed')).toHaveCount(1);
  await page.getByText('Have a license?').click(); await page.getByLabel('License token').fill('fixture-pro'); await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Pro unlocked on this device')).toBeVisible();
  await expect(page.getByText('$19 one-time Triagebox Pro license')).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', { name: 'Survey another folder' }).click();
  await page.getByRole('button', { name: 'Choose a folder' }).click();
  await page.getByRole('button', { name: 'Approve displayed (100)' }).click();
  await page.getByRole('button', { name: /Show 100 more/ }).click();
  await page.getByLabel('Approve limit-100.txt').evaluate((input: HTMLInputElement) => input.click());
  await expect(page.getByRole('button', { name: 'Move 101 approved' })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Move 101 approved' }).click();
  await expect(page.getByRole('heading', { name: /101 moved · 0 undone/ })).toBeVisible();
});

test('@claim:checkout-origin the purchase link and license verification use Sociobot', async ({ page }) => {
  const calls: string[] = [];
  await page.route('https://api.sociobot.in/api/v1/products/local-file-triage/verify?license=fixture-checkout', route => { calls.push(route.request().url()); return route.fulfill({ json: { valid: true } }); });
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Buy Pro on Sociobot\/Dodo/ })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/local-file-triage/checkout');
  await page.getByText('Have a license?').click(); await page.getByLabel('License token').fill('fixture-checkout'); await page.getByRole('button', { name: 'Verify license' }).click();
  expect(calls).toEqual(['https://api.sociobot.in/api/v1/products/local-file-triage/verify?license=fixture-checkout']);
});

test('@claim:permission-on-action folder permission is requested only when Choose a folder is activated', async ({ page }) => {
  await page.addInitScript(() => { (window as unknown as { pickerCalls: number }).pickerCalls = 0; Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: async () => { (window as unknown as { pickerCalls: number }).pickerCalls += 1; return { name: 'Empty', kind: 'directory', async *entries() {}, async getDirectoryHandle() { throw new DOMException('Missing'); }, async getFileHandle() { throw new DOMException('Missing'); }, async removeEntry() {} }; } }); });
  await page.goto('/');
  expect(await page.evaluate(() => (window as unknown as { pickerCalls: number }).pickerCalls)).toBe(0);
  await page.getByRole('button', { name: 'Choose a folder' }).click();
  expect(await page.evaluate(() => (window as unknown as { pickerCalls: number }).pickerCalls)).toBe(1);
});

test('has no serious accessibility violations', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Try the five-file sample' }).click();
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => await (window as unknown as { axe: { run(options: { runOnly: string[] }): Promise<{ violations: Array<{ impact: string | null }> }> } }).axe.run({ runOnly: ['wcag2a', 'wcag2aa'] }));
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator('#activity')).toHaveAttribute('aria-live', 'polite');
  if (testInfo.project.name === 'mobile') {
    const box = await page.locator('.approve').first().boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('keyboard reaches the demo, edits a route, and keeps a visible focus ring', async ({ page }) => {
  await page.goto('/');
  const demo = page.getByRole('link', { name: 'Try it with sample data' });
  await demo.focus();
  await expect(demo).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/);
  const approval = page.getByLabel('Approve IMG_4821.jpg');
  await approval.focus();
  await page.keyboard.press('Space');
  await expect(approval).toBeChecked();
  const outline = await approval.evaluate(element => getComputedStyle(element).outlineWidth || getComputedStyle(element.parentElement!).outlineWidth);
  expect(outline).not.toBe('0px');
});

test('demo metadata, route focus, legal metadata, and designed 404 use complete route shells', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Triagebox');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://local-file-triage.sociobot.in/demo');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Demo — Triagebox');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goto('/privacy/');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Privacy — Triagebox');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goto('/does-not-exist');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Triagebox');
});

test('browser Back restores a route heading focus and announces its route title', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-announcer')).toContainText('Triagebox');
});

test('legal routes have one h1 and clear product terms', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/File details are not sent to another service/)).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/Triagebox Pro costs \$19 once/)).toBeVisible();
});

test('@claim:offline-reload app shell reloads offline after installation', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Survey the folder|Offline, with your files still local/);
});
