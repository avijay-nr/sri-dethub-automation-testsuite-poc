import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as flowCreationDef from '../definitionFiles/flow-creation/flow-creation-def';
import * as loginDef from '../definitionFiles/loginTestDef/loginDef';
import * as projectCreationDef from '../definitionFiles/project-creation/project-creation-def';

const NAME_PREFIX = 'QA_SRI_generic';

const projectSeed = {
  name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
  description: `${NAME_PREFIX} automation ${faker.lorem.words(2)}`,
};

test.beforeEach(async ({ page }) => {
  await test.step('Login to SRI portal', async () => {
    await loginDef.loginToPortal(page);
    await loginDef.assertLoginSuccess(page);
  });
});

test('TC_001 - Login and open Projects list @FlowCreation', async ({ page }) => {
  test.setTimeout(240_000);

  await test.step('Click on Projects', async () => {
    await projectCreationDef.openProjectsList({ page });
    await projectCreationDef.assertProjectsListVisible({ page });
  });
});

test('TC_002 - Click Create Flow and create flow @FlowCreation', async ({ page }) => {
  test.setTimeout(240_000);

  await test.step('Open Projects list', async () => {
    await projectCreationDef.openProjectsList({ page });
    await projectCreationDef.assertProjectsListVisible({ page });
  });

  await test.step('Click Create Flow', async () => {
    await flowCreationDef.startFlowCreation({ page });
  });

  await test.step('Add project name and description', async () => {
    await flowCreationDef.createFlow({
      page,
      flowName: projectSeed.name,
      flowDescription: projectSeed.description,
    });
  });
});

test('TC_003 - Open project details and click +Create Flow @FlowCreation', async ({ page }) => {
  test.setTimeout(240_000);

  await test.step('Open Projects list', async () => {
    await projectCreationDef.openProjectsList({ page });
    await projectCreationDef.assertProjectsListVisible({ page });
  });

  await test.step('Click on project details', async () => {
    await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeed.name });
  });

  await test.step('Click +Create Flow', async () => {
    await flowCreationDef.openCreateFlowFromProjectDetails({ page });
  });
});

test('TC_004 - Select Transaction Monitoring in project details @FlowCreation', async ({ page }) => {
  test.setTimeout(180_000);

  await test.step('Open Projects list', async () => {
    await projectCreationDef.openProjectsList({ page });
    await projectCreationDef.assertProjectsListVisible({ page });
  });

  await test.step('Open target flow project details', async () => {
    try {
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeed.name });
    } catch {
      await flowCreationDef.startFlowCreation({ page });
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeed.name,
        flowDescription: projectSeed.description,
      });
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeed.name });
    }
  });

  await test.step('Click +Create Flow', async () => {
    await flowCreationDef.openCreateFlowFromProjectDetails({ page });
  });

  await test.step('Select Transaction Monitoring', async () => {
    await flowCreationDef.selectTransactionMonitoring({ page });
  });

  await test.step('Click Continue', async () => {
    await flowCreationDef.clickContinueAfterUseCaseSelection({ page });
  });

  await test.step('Select Retail Banking - Baseline and click Use', async () => {
    await flowCreationDef.selectRetailBankingBaselineAndUse({ page });
  });

  await test.step('Enter Flow name and description', async () => {
    await flowCreationDef.enterFlowBuilderDetails({
      page,
      flowName: 'QA_Automation test',
      flowDescription: 'TEST_Automation',
    });
  });

  await test.step('Click Create Flow', async () => {
    await flowCreationDef.clickCreateFlowInDetails({ page });
  });
});
