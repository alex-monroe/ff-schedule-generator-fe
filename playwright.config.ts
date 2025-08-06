import { defineConfig } from '@playwright/test';

const baseURL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

const webServer = process.env.PLAYWRIGHT_TEST_BASE_URL
  ? undefined
  : {
      command: 'npm run dev -- --port=3000',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    };

export default defineConfig({
  testDir: './tests',
  ...(webServer ? { webServer } : {}),
  use: {
    baseURL,
    headless: true,
  },
});
