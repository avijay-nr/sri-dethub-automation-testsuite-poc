import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as flowCreationDef from '../definitionFiles/flowCreation/flowCreationdef';
import * as loginDef from '../definitionFiles/loginTest/logindef';
import * as projectCreationDef from '../definitionFiles/projectCreation/projectCreationdef';
const NAME_PREFIX = 'QA_SRI_generic';
const projectSeed = {
  name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
  description: `${NAME_PREFIX} automation ${faker.lorem.words(2)}`,
};
test.describe.serial('@FlowCreation dependent tests', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Login to NR portal', async () => {
      await loginDef.loginToPortal(page);
      await loginDef.assertLoginSuccess(page);
    });
  });

  test('TC_001 - Login and open Projects list @FC_TC001', async ({ page }) => {
    await test.step('Click on Projects', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
  });

  test('TC_002 - Click Create Flow and create flow @FC_TC002', async ({ page }) => {
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

  test('TC_003 - Open project details and click +Create Flow @FC_TC003', async ({ page }) => {
  const project = {
    name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
    description: `${NAME_PREFIX} automation ${faker.lorem.words(2)}`,
  };
  const flow = {
    name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
    description: `${NAME_PREFIX} tc003 flow ${faker.lorem.words(2)}`,
  };
  await test.step('Open Projects list', async () => {
    await projectCreationDef.openProjectsList({ page });
    await projectCreationDef.assertProjectsListVisible({ page });
  });
  await test.step('Create project', async () => {
    await flowCreationDef.startFlowCreation({ page });
    await flowCreationDef.createFlow({
      page,
      flowName: project.name,
      flowDescription: project.description,
    });
  });
  await test.step('Open Project Details', async () => {
    await flowCreationDef.clickFlowProjectDetails({
      page,
      flowName: project.name,
    });
  });
  await test.step('Open Flows tab', async () => {
    await flowCreationDef.openFlowsTabInProject({ page });
  });
  await test.step('Create Transaction Monitoring Flow', async () => {
    await flowCreationDef.createFlowInsideProject({
      page,
      flowName: flow.name,
      flowDescription: flow.description,
    });
  });
  await test.step('Click Save button', async () => {
    const saveButton = page.getByRole('button', { name: /save|create|confirm/i }).first();
    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click().catch(() => {});
    }
  });
});

  test('TC_004 - Duplicate flow name should be rejected @FC_TC004', async ({ page }) => {
    const projectSeedForDuplicateFlow = {
      name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `${NAME_PREFIX} duplicate container ${faker.lorem.words(2)}`,
    };
    const flowSeed = {
      name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `${NAME_PREFIX} duplicate ${faker.lorem.words(2)}`,
    };
    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await test.step('Create project', async () => {
      await flowCreationDef.startFlowCreation({ page });
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeedForDuplicateFlow.name,
        flowDescription: projectSeedForDuplicateFlow.description,
      });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
    });
    await test.step('Open Project Details', async () => {
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForDuplicateFlow.name });
    });
    await test.step('Open Flows tab', async () => {
      await flowCreationDef.openFlowsTabInProject({ page });
    });
    await test.step('Create first Transaction Monitoring flow', async () => {
      await flowCreationDef.createFlowInsideProject({
        page,
        flowName: flowSeed.name,
        flowDescription: flowSeed.description,
      });
    });
    await test.step('Attempt duplicate flow creation with same name and description', async () => {
      await flowCreationDef.createFlowInsideProject({
        page,
        flowName: flowSeed.name,
        flowDescription: flowSeed.description,
      }).catch(() => {
        // Expected to fail since flow with same name already exists
      });
    });
    await test.step('Verify duplicate flow creation is rejected', async () => {
      await flowCreationDef.assertDuplicateFlowRejected({ page, flowName: flowSeed.name });
    });
    await test.step('Assert only one flow is visible in Flows tab', async () => {
      await flowCreationDef.assertSingleFlowVisibleInsideProject({ page, flowName: flowSeed.name });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
    });
  });

  test('TC_005 - Edit flow name and description @FC_TC005', async ({ page }) => {
    const projectSeedForFlowEdit = {
      name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `${NAME_PREFIX} project for flow edit ${faker.lorem.words(2)}`,
    };
    const flowSeed = {
      name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `flow description ${faker.lorem.words(2)}`,
    };
    const editedFlow = {
      name: `${flowSeed.name}_upd`,
      description: `edited flow ${faker.lorem.words(3)}`,
    };
    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await test.step('Create project and open project details', async () => {
      await flowCreationDef.startFlowCreation({ page });
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeedForFlowEdit.name,
        flowDescription: projectSeedForFlowEdit.description,
      });
      await projectCreationDef.clickCloseProjectDialog({ page });
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowEdit.name });
    });
    await test.step('Open Flows tab', async () => {
      await flowCreationDef.openFlowsTabInProject({ page });
    });
    await test.step('Create flow inside project', async () => {
      await flowCreationDef.createFlowInsideProject({
        page,
        flowName: flowSeed.name,
        flowDescription: flowSeed.description,
      });
    });
    await test.step('Open flow edit mode inside project', async () => {
      await flowCreationDef.openFlowForEditInsideProject({ page, flowName: flowSeed.name });
    });
    await test.step('Edit flow name and description inside project', async () => {
      await flowCreationDef.updateFlowNameAndDescriptionInsideProject({
        page,
        updatedFlowName: editedFlow.name,
        updatedFlowDescription: editedFlow.description,
      });
    });
    await test.step('Verify edited flow name appears in project flows list', async () => {
      await flowCreationDef.assertFlowVisibleInsideProject({ page, flowName: editedFlow.name });
    });
    await test.step('Open edited flow dialog and verify edited name and description', async () => {
      await flowCreationDef.openFlowForEditInsideProject({ page, flowName: editedFlow.name });
      await flowCreationDef.assertFlowDetailsInEditDialog({
        page,
        updatedFlowName: editedFlow.name,
        updatedFlowDescription: editedFlow.description,
      });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
    });
  });

  test('TC_006 - Deploy the created flow @FC_TC006', async ({ page }) => {
    const projectSeedForFlowDeploy = {
      name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `${NAME_PREFIX} deploy project ${faker.lorem.words(2)}`,
    };
    const flowSeed = {
      name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `deploy flow ${faker.lorem.words(2)}`,
    };
    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await test.step('Create project and open project details', async () => {
      await flowCreationDef.startFlowCreation({ page });
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeedForFlowDeploy.name,
        flowDescription: projectSeedForFlowDeploy.description,
      });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowDeploy.name });
    });
    await test.step('Open Flows tab', async () => {
      await flowCreationDef.openFlowsTabInProject({ page });
    });
    await test.step('Create flow inside project', async () => {
      await flowCreationDef.createFlowInsideProject({
        page,
        flowName: flowSeed.name,
        flowDescription: flowSeed.description,
      });
    });
    await test.step('Deploy created flow', async () => {
      await flowCreationDef.deployFlowInsideProject({ page, flowName: flowSeed.name });
    });
    await test.step('Verify deployed flow is visible in Flows section', async () => {
      await flowCreationDef.assertFlowVisibleInsideProject({ page, flowName: flowSeed.name });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
    });
  });

  test('TC_007 - Export the created flow @FC_TC007', async ({ page }) => {
    const projectSeedForFlowExport = {
      name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `${NAME_PREFIX} export project ${faker.lorem.words(2)}`,
    };
    const flowSeed = {
      name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `export flow ${faker.lorem.words(2)}`,
    };
    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await test.step('Create project and open project details', async () => {
      await flowCreationDef.startFlowCreation({ page });
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeedForFlowExport.name,
        flowDescription: projectSeedForFlowExport.description,
      });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowExport.name });
    });
    await test.step('Open Flows tab', async () => {
      await flowCreationDef.openFlowsTabInProject({ page });
    });
    await test.step('Create flow inside project', async () => {
      await flowCreationDef.createFlowInsideProject({
        page,
        flowName: flowSeed.name,
        flowDescription: flowSeed.description,
      });
    });
    await test.step('Export created flow', async () => {
      await flowCreationDef.exportFlowInsideProject({ page, flowName: flowSeed.name });
    });
    await test.step('Verify exported flow is still visible in Flows section', async () => {
      await flowCreationDef.assertFlowVisibleInsideProject({ page, flowName: flowSeed.name });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
    });
  });

  test('TC_008 - Create flow in overview and deploy from flow screen @FC_TC008', async ({ page }) => {
    const projectSeedForOverviewFlowDeploy = {
      name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `${NAME_PREFIX} overview deploy ${faker.lorem.words(2)}`,
    };
    const flowSeed = {
      name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `overview flow deploy ${faker.lorem.words(2)}`,
    };
    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await test.step('Create project and open project details', async () => {
      await flowCreationDef.startFlowCreation({ page });
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeedForOverviewFlowDeploy.name,
        flowDescription: projectSeedForOverviewFlowDeploy.description,
      });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForOverviewFlowDeploy.name });
    });
    await test.step('Open Overview section', async () => {
      await flowCreationDef.openOverviewTabInProject({ page });
    });
    await test.step('Create flow from Overview section', async () => {
      await flowCreationDef.createFlowFromOverviewSectionInsideProject({
        page,
        flowName: flowSeed.name,
        flowDescription: flowSeed.description,
      });
    });
    await test.step('Open flow screen and deploy flow', async () => {
      await flowCreationDef.deployFlowFromFlowScreenInsideProject({ page, flowName: flowSeed.name });
    });
    await test.step('Verify deployed flow is visible in Deployments tab', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForOverviewFlowDeploy.name });
      await flowCreationDef.assertFlowVisibleInDeploymentsTab({ page, flowName: flowSeed.name });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
    });
  });

  test('TC_009 - Delete the created flow @FC_TC009', async ({ page }) => {
    const projectSeedForFlowDelete = {
      name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `${NAME_PREFIX} delete flow project ${faker.lorem.words(2)}`,
    };
    const flowSeed = {
      name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `delete flow ${faker.lorem.words(2)}`,
    };
    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await test.step('Create project and open project details', async () => {
      await flowCreationDef.startFlowCreation({ page });
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeedForFlowDelete.name,
        flowDescription: projectSeedForFlowDelete.description,
      });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowDelete.name });
    });
    await test.step('Create flow inside project', async () => {
      await flowCreationDef.createFlowInsideProject({
        page,
        flowName: flowSeed.name,
        flowDescription: flowSeed.description,
      });
    });
    await test.step('Delete created flow', async () => {
      await flowCreationDef.deleteFlowInsideProject({ page, flowName: flowSeed.name });
    });
    await test.step('Verify deleted flow is not visible in Flows section', async () => {
      await flowCreationDef.assertFlowNotVisibleInsideProject({ page, flowName: flowSeed.name });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
    });
  });

  test('TC_010 - Check version of the flow @FC_TC010', async ({ page }) => {
    const projectSeedForFlowVersion = {
      name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `${NAME_PREFIX} version project ${faker.lorem.words(2)}`,
    };
    const flowSeed = {
      name: `flow_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
      description: `version flow ${faker.lorem.words(2)}`,
    };
    await test.step('Open Projects list', async () => {
      await projectCreationDef.openProjectsList({ page });
      await projectCreationDef.assertProjectsListVisible({ page });
    });
    await test.step('Create project and open project details', async () => {
      await flowCreationDef.startFlowCreation({ page });
      await flowCreationDef.createFlow({
        page,
        flowName: projectSeedForFlowVersion.name,
        flowDescription: projectSeedForFlowVersion.description,
      });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
      await flowCreationDef.clickFlowProjectDetails({ page, flowName: projectSeedForFlowVersion.name });
    });
    await test.step('Create flow inside project', async () => {
      await flowCreationDef.createFlowInsideProject({
        page,
        flowName: flowSeed.name,
        flowDescription: flowSeed.description,
      });
    });
    await test.step('Check flow version on flow screen', async () => {
      await flowCreationDef.assertFlowVersionVisibleInFlowScreen({ page, flowName: flowSeed.name });
      await projectCreationDef.clickCloseProjectDialog({ page }).catch(() => {});
    });
  });
});
