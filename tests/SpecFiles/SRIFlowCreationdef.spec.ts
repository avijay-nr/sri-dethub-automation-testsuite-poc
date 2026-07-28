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

const STEP_DELAY_MS = 10_000;

test.describe.serial('@FlowCreation dependent tests', () => {
  let tc001Completed = false;
  let tc002Completed = false;

  test.beforeEach(async ({ page }) => {
    await test.step('Login to NR portal', async () => {
      await loginDef.loginToPortal(page);
      await loginDef.assertLoginSuccess(page);
    });
  });

  test('TC_001 - Login and open Projects list @FlowCreation', async ({ page }) => {
    test.setTimeout(240_000);
    const waitAfterStep = async (): Promise<void> => {
      await page.waitForTimeout(STEP_DELAY_MS);
    };

    await test.step('Click on Projects', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await waitAfterStep();

    tc001Completed = true;
  });

  test('TC_002 - Dependent on TC_001: click Create Flow and create flow @FlowCreation', async ({ page }) => {
    test.skip(!tc001Completed, 'TC_002 depends on successful completion of TC_001.');
    test.setTimeout(240_000);
    const waitAfterStep = async (): Promise<void> => {
      await page.waitForTimeout(STEP_DELAY_MS);
    };

    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await waitAfterStep();

    await test.step('Click Create Flow', async () => {
      await flowCreationDef.startFlowCreation({ page });
    });
    await waitAfterStep();

    await test.step('Add project name and description', async () => {
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeed.name,
        flowDescription: projectSeed.description,
      });
    });
    await waitAfterStep();

    tc002Completed = true;
  });

  test('TC_003 - Dependent on TC_002: open project details and click +Create Flow @FlowCreation', async ({ page }) => {
    test.skip(!tc002Completed, 'TC_003 depends on successful completion of TC_002.');
    test.setTimeout(240_000);
    const waitAfterStep = async (): Promise<void> => {
      await page.waitForTimeout(STEP_DELAY_MS);
    };

    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await waitAfterStep();

    await test.step('Click on project details', async () => {
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeed.name });
    });
    await waitAfterStep();

    await test.step('Click +Create Flow', async () => {
      await flowCreationDef.startFlowCreation({ page });
    });
    await waitAfterStep();
  });
});
