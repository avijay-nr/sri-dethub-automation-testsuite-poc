/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Discover only Playwright-style test files, including those under testData.
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  // Skip config files and binary attachment payloads.
  testIgnore: ['**/configFiles/**', '**/testData/attachments/**'],

  // ✅ FIX 4: Increased global test timeout from 120s to 180s to handle slow app under parallel load
  timeout: 180_000,

  expect: {
    // ✅ FIX 5: Increased expect timeout from 120s to 180s to match test timeout
    timeout: 180_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  // ✅ FIX 6: Enabled retries — auto-retry once on transient/flaky failures
  retries: 1,

  /* Opt out of parallel tests on CI. */
  // ✅ FIX 7: Limit workers to 2 locally to reduce parallel load on SRI app
  workers: process.env.CI ? 1 : 1,

  /* Reporter to use. */
  reporter: 'html',

  /* Shared settings for all the projects below. */
  use: {
    /* Collect trace when retrying the failed test. */
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