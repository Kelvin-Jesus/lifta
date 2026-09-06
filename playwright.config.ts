import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    ...devices['iPhone 15'],
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
