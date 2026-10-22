// E2E tests drive the real page served by the local PHP dev server.
// Start it from the repo root, or let Playwright start it:
//   php -S localhost:8899 -t . dev-server-router.php
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 300_000,
  fullyParallel: false,
  workers: 2,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://localhost:8899', trace: 'off', screenshot: 'only-on-failure' },
  webServer: {
    command: `php -S localhost:8899 -t "${repoRoot}" "${repoRoot}/dev-server-router.php"`,
    url: 'http://localhost:8899/salary-calculator-philippines/',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobile/ },
    // Cross-browser: UI behaviour + mandatory fixtures (the heavy numeric suites run once, in Chromium).
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grep: /@xbrowser/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, grep: /@xbrowser/ },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'webkit' }, grep: /@mobile/ },
  ],
});
