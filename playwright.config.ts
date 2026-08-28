import { defineConfig, devices } from '@playwright/test';

const remoteBaseUrl = process.env.TRIAGEBOX_TEST_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'line',
  use: {
    baseURL: remoteBaseUrl ?? 'http://127.0.0.1:4173',
    bypassCSP: Boolean(remoteBaseUrl),
    trace: 'retain-on-failure'
  },
  webServer: remoteBaseUrl ? undefined : { command: 'npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } }
  ]
});
