import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  use: { ...devices['iPhone 13'], browserName: 'chromium', launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {}, baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: process.env.PREVIEW_URL ? undefined : { command: 'node scripts/serve.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 15_000 },
});
