/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

// ✅ Per-environment config
const env = process.env.TEST_ENV || 'QA-Dev';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  testIgnore: ['**/configFiles/**', '**/testData/attachments/**'],

  timeout: 180_000,

  expect: {
    timeout: 180_000,
  },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,

  // ✅ FIXED — 4 reporters to match CI/CD workflow!
  reporter: [
    ['list'],                                                     // ✅ live test names in terminal!
    ['github'],                                                   // ✅ CI annotations in GitHub Actions!
    ['html', { open: 'never' }],                                  // ✅ HTML report — never auto opens!
    ['json', { outputFile: 'playwright-report/results.json' }],   // ✅ results.json for job summary!
  ],

  use: {
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    // ✅ env-driven base URL if needed!
    baseURL: process.env.env_url?.trim(),
  },

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