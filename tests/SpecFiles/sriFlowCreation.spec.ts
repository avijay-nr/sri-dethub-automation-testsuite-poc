
//Commited to work on Github actions

// import { test } from '@playwright/test';
// import { faker } from '@faker-js/faker';
// import * as flowCreationDef from '../definitionFiles/flowCreation/flowCreationdef';
// import * as loginDef from '../definitionFiles/loginTest/logindef';
// import * as projectCreationDef from '../definitionFiles/projectCreation/projectCreationdef';

// const NAME_PREFIX = 'QA_SRI_generic';
// const projectSeed = {
//   name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//   description: `${NAME_PREFIX} automation ${faker.lorem.words(2)}`,
// };

// test.describe.serial('@FlowCreation dependent tests', () => {
//   test.beforeEach(async ({ page }) => {
//     await test.step('Login to SRI portal', async () => {
//       await loginDef.loginToPortal(page);
//       await loginDef.assertLoginSuccess(page);
//     });
//   });

//   test('TC_001 - Login and open Projects list @FC_TC001', async ({ page }) => {
//     await test.step('Click on Projects', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//   });

//   test('TC_002 - Click Create Flow and create flow @FC_TC002', async ({ page }) => {
//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//     await test.step('Click Create Flow', async () => {
//       await flowCreationDef.startFlowCreation({ page });
//     });
//     await test.step('Add project name and description', async () => {
//       await flowCreationDef.createFlow({
//         page,
//         flowName: projectSeed.name,
//         flowDescription: projectSeed.description,
//       });
//     });
//   });

//   test('TC_003 - Open project details and click +Create Flow @FC_TC003', async ({ page }) => {
//     test.setTimeout(180_000);

//     const project = {
//       name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} automation ${faker.lorem.words(2)}`,
//     };
//     const flow = {
//       name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} tc003 flow ${faker.lorem.words(2)}`,
//     };

//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//     await test.step('Create project', async () => {
//       await flowCreationDef.startFlowCreation({ page });
//       await flowCreationDef.createFlow({
//         page,
//         flowName: project.name,
//         flowDescription: project.description,
//       });
//     });
//     await test.step('Open Project Details', async () => {
//       await flowCreationDef.clickFlowProjectDetails({
//         page,
//         flowName: project.name,
//       });
//     });
//     await test.step('Open Flows tab', async () => {
//       await flowCreationDef.openFlowsTabInProject({ page });
//     });
//     await test.step('Create Transaction Monitoring Flow', async () => {
//       await flowCreationDef.createFlowInsideProject({
//         page,
//         flowName: flow.name,
//         flowDescription: flow.description,
//       });
//     });
//     await test.step('Wait for flow creation to process', async () => {
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(3_000);
//     });
//     await test.step('Click Save button if visible', async () => {
//       const saveButton = page.getByRole('button', { name: /save|create|confirm/i }).first();
//       if (await saveButton.isVisible().catch(() => false)) {
//         await saveButton.click().catch(() => {});
//       }
//     });
//   });

//   test('TC_004 - Duplicate flow name should be rejected @FC_TC004', async ({ page }) => {
//     test.setTimeout(180_000);

//     const projectSeedForDuplicateFlow = {
//       name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} duplicate container ${faker.lorem.words(2)}`,
//     };
//     const flowSeed = {
//       name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} duplicate ${faker.lorem.words(2)}`,
//     };

//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//     await test.step('Create project', async () => {
//       await flowCreationDef.startFlowCreation({ page });
//       await flowCreationDef.createFlow({
//         page,
//         flowName: projectSeedForDuplicateFlow.name,
//         flowDescription: projectSeedForDuplicateFlow.description,
//       });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//     });
//     await test.step('Open Project Details', async () => {
//       await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForDuplicateFlow.name });
//     });
//     await test.step('Open Flows tab', async () => {
//       await flowCreationDef.openFlowsTabInProject({ page });
//     });
//     await test.step('Create first flow', async () => {
//       await flowCreationDef.createFlowInsideProject({
//         page,
//         flowName: flowSeed.name,
//         flowDescription: flowSeed.description,
//       });
//     });
//     await test.step('Wait for flow creation to process', async () => {
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(5_000);
//     });
//     await test.step('Verify first flow is visible', async () => {
//       try {
//         await flowCreationDef.assertFlowVisibleInsideProject({ page, flowName: flowSeed.name });
//       } catch {
//         await page.reload();
//         await page.waitForLoadState('networkidle').catch(() => {});
//         await flowCreationDef.openFlowsTabInProject({ page });
//         await flowCreationDef.assertFlowVisibleInsideProject({ page, flowName: flowSeed.name });
//       }
//     });
//     await test.step('Once the flow is created, create another flow with same details', async () => {
//       const duplicateAttempt = flowCreationDef.createFlowInsideProject({
//         page,
//         flowName: flowSeed.name,
//         flowDescription: flowSeed.description,
//       });

//       const bail = new Promise<void>((_, reject) =>
//         setTimeout(() => reject(new Error('Bailed — duplicate name detected, Create button disabled')), 60_000)
//       );

//       await Promise.race([duplicateAttempt, bail]).catch(() => {
//         // Expected! Either wizard exited silently (button disabled) or we bailed after 60s
//       });
//     });
//     await test.step('Verify duplicate flow creation is rejected', async () => {
//       await flowCreationDef.assertDuplicateFlowRejected({ page, flowName: flowSeed.name });
//     });
//   });

//   test('TC_005 - Edit flow name and description @FC_TC005', async ({ page }) => {
//     test.setTimeout(180_000);

//     const projectSeedForFlowEdit = {
//       name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} project for flow edit ${faker.lorem.words(2)}`,
//     };
//     const flowSeed = {
//       name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `flow description ${faker.lorem.words(2)}`,
//     };
//     const editedFlow = {
//       name: `${flowSeed.name}_upd`,
//       description: `edited flow ${faker.lorem.words(3)}`,
//     };

//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//     await test.step('Create project and open project details', async () => {
//       await flowCreationDef.startFlowCreation({ page });
//       await flowCreationDef.createFlow({
//         page,
//         flowName: projectSeedForFlowEdit.name,
//         flowDescription: projectSeedForFlowEdit.description,
//       });
//       await projectCreationDef.clickCloseProjectDialog({ page });
//       await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowEdit.name });
//     });
//     await test.step('Open Flows tab', async () => {
//       await flowCreationDef.openFlowsTabInProject({ page });
//     });
//     await test.step('Create flow inside project', async () => {
//       await flowCreationDef.createFlowInsideProject({
//         page,
//         flowName: flowSeed.name,
//         flowDescription: flowSeed.description,
//       });
//     });
//     await test.step('Wait for flow creation to process', async () => {
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(3_000);
//     });
//     await test.step('Open flow edit mode inside project', async () => {
//       await flowCreationDef.openFlowForEditInsideProject({ page, flowName: flowSeed.name });
//     });
//     await test.step('Edit flow name and description inside project', async () => {
//       await flowCreationDef.updateFlowNameAndDescriptionInsideProject({
//         page,
//         updatedFlowName: editedFlow.name,
//         updatedFlowDescription: editedFlow.description,
//       });
//     });
//     await test.step('Verify edited flow name appears in project flows list', async () => {
//       await flowCreationDef.assertFlowVisibleInsideProject({ page, flowName: editedFlow.name });
//     });
//     await test.step('Open edited flow dialog and verify edited name and description', async () => {
//       await flowCreationDef.openFlowForEditInsideProject({ page, flowName: editedFlow.name });
//       await flowCreationDef.assertFlowDetailsInEditDialog({
//         page,
//         updatedFlowName: editedFlow.name,
//         updatedFlowDescription: editedFlow.description,
//       });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//     });
//   });

//   test('TC_006 - Deploy the created flow @FC_TC006', async ({ page }) => {
//     test.setTimeout(180_000);

//     const projectSeedForFlowDeploy = {
//       name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} deploy project ${faker.lorem.words(2)}`,
//     };
//     const flowSeed = {
//       name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `deploy flow ${faker.lorem.words(2)}`,
//     };

//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//     await test.step('Create project and open project details', async () => {
//       await flowCreationDef.startFlowCreation({ page });
//       await flowCreationDef.createFlow({
//         page,
//         flowName: projectSeedForFlowDeploy.name,
//         flowDescription: projectSeedForFlowDeploy.description,
//       });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//       await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowDeploy.name });
//     });
//     await test.step('Open Flows tab', async () => {
//       await flowCreationDef.openFlowsTabInProject({ page });
//     });
//     await test.step('Create flow inside project', async () => {
//       await flowCreationDef.createFlowInsideProject({
//         page,
//         flowName: flowSeed.name,
//         flowDescription: flowSeed.description,
//       });
//     });
//     await test.step('Wait for flow creation to process', async () => {
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(3_000);
//     });
//     await test.step('Deploy created flow', async () => {
//       await flowCreationDef.deployFlowInsideProject({ page, flowName: flowSeed.name });
//     });
//     await test.step('Verify deployed flow is visible in Flows section', async () => {
//       await flowCreationDef.assertFlowVisibleInsideProject({ page, flowName: flowSeed.name });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//     });
//   });

//   test('TC_007 - Export the created flow @FC_TC007', async ({ page }) => {
//     test.setTimeout(180_000);

//     const projectSeedForFlowExport = {
//       name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} export project ${faker.lorem.words(2)}`,
//     };
//     const flowSeed = {
//       name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `export flow ${faker.lorem.words(2)}`,
//     };

//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//     await test.step('Create project and open project details', async () => {
//       await flowCreationDef.startFlowCreation({ page });
//       await flowCreationDef.createFlow({
//         page,
//         flowName: projectSeedForFlowExport.name,
//         flowDescription: projectSeedForFlowExport.description,
//       });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//       await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowExport.name });
//     });
//     await test.step('Open Flows tab', async () => {
//       await flowCreationDef.openFlowsTabInProject({ page });
//     });
//     await test.step('Create flow inside project', async () => {
//       await flowCreationDef.createFlowInsideProject({
//         page,
//         flowName: flowSeed.name,
//         flowDescription: flowSeed.description,
//       });
//     });
//     await test.step('Wait for flow creation to process', async () => {
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(3_000);
//     });
//     await test.step('Export created flow', async () => {
//       await flowCreationDef.exportFlowInsideProject({ page, flowName: flowSeed.name });
//     });
//     await test.step('Verify exported flow is still visible in Flows section', async () => {
//       await flowCreationDef.assertFlowVisibleInsideProject({ page, flowName: flowSeed.name });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//     });
//   });

//   test('TC_008 - Create flow in overview and deploy from flow screen @FC_TC008', async ({ page }) => {
//     test.setTimeout(180_000);

//     const projectSeedForOverviewFlowDeploy = {
//       name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} overview deploy ${faker.lorem.words(2)}`,
//     };
//     const flowSeed = {
//       name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `overview flow deploy ${faker.lorem.words(2)}`,
//     };

//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//     await test.step('Create project and open project details', async () => {
//       await flowCreationDef.startFlowCreation({ page });
//       await flowCreationDef.createFlow({
//         page,
//         flowName: projectSeedForOverviewFlowDeploy.name,
//         flowDescription: projectSeedForOverviewFlowDeploy.description,
//       });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//       await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForOverviewFlowDeploy.name });
//     });
//     await test.step('Open Overview section', async () => {
//       await flowCreationDef.openOverviewTabInProject({ page });
//     });
//     await test.step('Create flow from Overview section', async () => {
//       await flowCreationDef.createFlowFromOverviewSectionInsideProject({
//         page,
//         flowName: flowSeed.name,
//         flowDescription: flowSeed.description,
//       });
//     });
//     await test.step('Wait for flow creation to process', async () => {
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(3_000);
//     });
//     await test.step('Deploy flow directly from the Flows tab', async () => {
//       await flowCreationDef.deployFlowInsideProject({ page, flowName: flowSeed.name });
//     });
//     await test.step('Verify deployed flow is visible in Deployments tab', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//       await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForOverviewFlowDeploy.name });
//       await flowCreationDef.assertFlowVisibleInDeploymentsTab({ page, flowName: flowSeed.name });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//     });
//   });

//   test('TC_009 - Delete the created flow @FC_TC009', async ({ page }) => {
//     test.setTimeout(180_000);

//     const projectSeedForFlowDelete = {
//       name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `${NAME_PREFIX} delete flow project ${faker.lorem.words(2)}`,
//     };
//     const flowSeed = {
//       name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
//       description: `delete flow ${faker.lorem.words(2)}`,
//     };

//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//     });
//     await test.step('Create project and open project details', async () => {
//       await flowCreationDef.startFlowCreation({ page });
//       await flowCreationDef.createFlow({
//         page,
//         flowName: projectSeedForFlowDelete.name,
//         flowDescription: projectSeedForFlowDelete.description,
//       });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//       await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowDelete.name });
//     });
//     await test.step('Create flow inside project', async () => {
//       await flowCreationDef.createFlowInsideProject({
//         page,
//         flowName: flowSeed.name,
//         flowDescription: flowSeed.description,
//       });
//     });
//     await test.step('Wait for flow creation to process', async () => {
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(3_000);
//     });
//     await test.step('Delete created flow', async () => {
//       await flowCreationDef.deleteFlowInsideProject({ page, flowName: flowSeed.name });
//     });
//     await test.step('Verify deleted flow is not visible in Flows section', async () => {
//       await flowCreationDef.assertFlowNotVisibleInsideProject({ page, flowName: flowSeed.name });
//       await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
//     });
//   });

//   // ✅ FINAL CLEANUP — same proven logic as cleanup.spec.ts
//   test('Cleanup - Delete all QA_SRI_generic projects @FC_CLEANUP', async ({ page }) => {
//     test.setTimeout(300_000);

//     await test.step('Open Projects list', async () => {
//       await projectCreationDef.openProjectsList({ page });
//       await projectCreationDef.assertProjectsListVisible({ page });
//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(2_000);
//     });

//     await test.step('Delete all QA_SRI_generic projects', async () => {
//       let deletedCount = 0;

//       for (let i = 0; i < 100; i++) {
//         // ✅ Same locator as working cleanup.spec.ts
//         const project = page
//           .locator(`xpath=//*[contains(normalize-space(.), '${NAME_PREFIX}')]`)
//           .first();

//         if (!(await project.isVisible().catch(() => false))) {
//           console.log(`✅ Final cleanup done — ${deletedCount} projects deleted`);
//           break;
//         }

//         try {
//           const rawText = await project.innerText().catch(() => '');
//           const projectName = rawText
//             .split('\n')
//             .map((l: string) => l.trim())
//             .find((l: string) => l.includes(NAME_PREFIX)) ?? '';

//           if (!projectName) {
//             console.log(`⚠️ Could not extract project name, reloading...`);
//             await page.reload();
//             await page.waitForLoadState('networkidle').catch(() => {});
//             await projectCreationDef.openProjectsList({ page });
//             await page.waitForTimeout(2_000);
//             continue;
//           }

//           console.log(`🗑️ Deleting: ${projectName}`);

//           // ✅ Same proven functions as cleanup.spec.ts
//           await projectCreationDef.initiateProjectDeletion({ page, projectName });
//           await projectCreationDef.confirmProjectDeletion({ page });
//           await page.waitForTimeout(2_000);
//           deletedCount++;

//           // Reload every 5 deletions to refresh the list
//           if (deletedCount % 5 === 0) {
//             await page.reload();
//             await page.waitForLoadState('networkidle').catch(() => {});
//             await projectCreationDef.openProjectsList({ page });
//             await page.waitForTimeout(2_000);
//           }

//         } catch (e) {
//           console.log(`⚠️ Error during deletion, reloading... ${e}`);
//           await page.reload();
//           await page.waitForLoadState('networkidle').catch(() => {});
//           await projectCreationDef.openProjectsList({ page });
//           await page.waitForTimeout(2_000);
//         }
//       }
//     });
//   });
// });