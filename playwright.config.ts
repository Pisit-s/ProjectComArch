import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results/artifacts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'pixel7', use: { ...devices['Pixel 7'] }, testIgnore: /shots\.spec/ },
    { name: 'iphone13', use: { ...devices['iPhone 13'] }, testIgnore: /shots\.spec/ },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /shots\.spec/ },
    { name: 'shots', use: { ...devices['Desktop Chrome'] }, testMatch: /shots\.spec/ },
  ],
  webServer: {
    // E2E_DEV=1 uses the dev server (faster iteration); default is the production build
    command: process.env.E2E_DEV
      ? `npx next dev -p ${PORT}`
      : `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
