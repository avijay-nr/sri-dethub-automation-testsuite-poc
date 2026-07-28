/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Discover only Playwright-style test files, including those under testData.
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  // Skip config files and binary attachment payloads.
  testIgnore: ['**/configFiles/**', '**/testData/attachments/**'],
  timeout: 120_000,
  expect: {
    timeout: 120_000,
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests once */
  //retries: 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  /* Configure projects */
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: !!process.env.CI,
      },
    },
  ],

});

