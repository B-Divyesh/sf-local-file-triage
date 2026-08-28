import { test, expect } from '@playwright/test';
import axe from 'axe-core';

test('home explains safety and offers a useful preview workflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Survey the folder/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('img')).toHaveAttribute('alt', /topographic map/);
  await page.getByRole('button', { name: 'Load an example survey' }).click();
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
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.file-row')).toHaveCount(5);
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
  await page.getByRole('button', { name: 'Load an example survey' }).click();
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

test('has no serious accessibility violations', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Load an example survey' }).click();
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

test('legal routes have one h1 and clear product terms', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/does not upload, sell, or profile/)).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/Triagebox Pro is a \$19 one-time purchase/)).toBeVisible();
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
