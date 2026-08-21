// import { test } from '@playwright/test';
// import * as loginDef from '../definitionFiles/loginTest/logindef';
// import * as projectCreationDef from '../definitionFiles/projectCreation/projectCreationdef';

// const NAME_PREFIX = 'QA_SRI_generic';

// test('Cleanup - Delete all QA_SRI_generic projects @cleanup', async ({ page }) => {
//   test.setTimeout(300_000);

//   await loginDef.loginToPortal(page);
//   await loginDef.assertLoginSuccess(page);
//   await projectCreationDef.openProjectsList({ page });
//   await page.waitForLoadState('networkidle').catch(() => {});
//   await page.waitForTimeout(2_000);

//   let deletedCount = 0;

//   for (let i = 0; i < 100; i++) {
//     // ✅ FIX: Match ANY project containing 'QA_SRI_generic' — with or without underscore
//     const project = page
//       .locator(`xpath=//*[contains(normalize-space(.), '${NAME_PREFIX}')]`)
//       .first();

//     if (!(await project.isVisible().catch(() => false))) {
//       console.log(`✅ Cleanup done — ${deletedCount} projects deleted`);
//       break;
//     }

//     try {
//       // Get the project name text — take first non-empty line
//       const rawText = await project.innerText().catch(() => '');
//       const projectName = rawText
//         .split('\n')
//         .map(l => l.trim())
//         .find(l => l.includes(NAME_PREFIX)) ?? '';

//       if (!projectName) {
//         console.log(`⚠️ Could not extract project name, reloading...`);
//         await page.reload();
//         await page.waitForLoadState('networkidle').catch(() => {});
//         await projectCreationDef.openProjectsList({ page });
//         await page.waitForTimeout(2_000);
//         continue;
//       }

//       console.log(`🗑️ Deleting: ${projectName}`);
//       await projectCreationDef.initiateProjectDeletion({ page, projectName });
//       await projectCreationDef.confirmProjectDeletion({ page });
//       await page.waitForTimeout(2_000);
//       deletedCount++;

//       // Reload every 5 deletions to refresh the list
//       if (deletedCount % 5 === 0) {
//         await page.reload();
//         await page.waitForLoadState('networkidle').catch(() => {});
//         await projectCreationDef.openProjectsList({ page });
//         await page.waitForTimeout(2_000);
//       }

//     } catch (e) {
//       console.log(`⚠️ Error during deletion, reloading... ${e}`);
//       await page.reload();
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await projectCreationDef.openProjectsList({ page });
//       await page.waitForTimeout(2_000);
//     }
//   }

//   console.log(`✅ Final cleanup done — ${deletedCount} projects deleted`);
// });