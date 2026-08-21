const dethubUsername = process.env.DETHUB_USERNAME;
const dethubPassword = process.env.DETHUB_PASSWORD;

// ✅ Map TEST_ENV to correct URL
const ENV_URLS: Record<string, string> = {
  'qa-test': 'https://det-sri-test-core-api.symphonyai.dev/smc2/login',
  'qa-dev':  '', // ⏳ not available yet — will be updated in future
  'custom':  process.env.CUSTOM_URL || '',
};

const testEnv = (process.env.TEST_ENV || 'qa-test').toLowerCase(); // ✅ handles QA-TEST, qa-test, Qa-Test!
const dethubUrl = ENV_URLS[testEnv] || ENV_URLS['qa-test']; // ✅ falls back to qa-test if blank!

export const config = {
  // Project Name
  projectName: 'SRI_Generic_Test',

  // Login details
  url: dethubUrl,
  username: dethubUsername || 'admin',
  password: dethubPassword || 'password',
  titleText: 'SymphonyAI: SRI',
  invalidLoginAlertText: "Login authentication failed",
};