# SRI-TestAutomationSuite-poc

Playwright + TypeScript automation framework for SRI projects.

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm
- Network/VPN access to the DETHUB environment

## Setup

1. Install dependencies:

	 npm install

2. Create local environment file from template:

	 Copy `.env.example` to `.env`

3. Update `.env` with valid values:

	 - `DETHUB_USERNAME`
	 - `DETHUB_PASSWORD`
	 - Optional: `DETHUB_QA_URL_NEW`
	 - Optional: `TEST_CONFIG` (`config_SRIGenericTest` or `config_SRIGenericTest_Backup`)

## Run Tests

- Run all tests:

	npm test

- Run headed:

	npm run test:headed

- Run debug mode:

	npm run test:debug

- Run UI mode:

	npm run test:ui

- Run report viewer:

	npm run report

## Current Test Scope

- Single valid-login testcase in `tests/login.spec.ts`.

## Notes

- Credentials are loaded from environment variables only.
- If login URL is unreachable:
	- Local runs fail with a clear error.
	- CI runs skip by design.
