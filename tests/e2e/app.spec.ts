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

test('has no serious accessibility violations', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Load an example survey' }).click();
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => await (window as unknown as { axe: { run(options: { runOnly: string[] }): Promise<{ violations: Array<{ impact: string | null }> }> } }).axe.run({ runOnly: ['wcag2a', 'wcag2aa'] }));
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('legal routes have one h1 and clear product terms', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/does not upload, sell, or profile/)).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText(/Triagebox Pro is a \$19 one-time purchase/)).toBeVisible();
});

test('app shell reloads offline after installation', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Survey the folder|Offline, with your files still local/);
});
