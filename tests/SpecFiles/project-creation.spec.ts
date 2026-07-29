import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
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

test('TC_001 - View list of available projects @ProjectCreation', async ({ page }) => {
  await test.step('Open Projects list', async () => {
    await projectCreationDef.openProjectsList({ page });
  });

  await test.step('Assert project list is visible', async () => {
    await projectCreationDef.assertProjectsListVisible({ page });
  });
});

test('TC_002 - Create project, edit details, and initiate deletion @ProjectCreation', async ({ page }) => {
  test.setTimeout(360_000);
  const editedDescription = 'description is edited';

  await test.step('Open Projects list', async () => {
    await projectCreationDef.openProjectsList({ page });
  });

  await test.step('Click Create Project', async () => {
    await projectCreationDef.clickCreateProject({ page });
  });

  await test.step('Assert Create Project UI is opened', async () => {
    await projectCreationDef.assertCreateProjectOpened({ page });
  });

  await test.step('Enter project details', async () => {
    await projectCreationDef.enterProjectDetails({
      page,
      projectName: projectSeed.name,
      projectDescription: projectSeed.description,
    });
  });

  await test.step('Assert created project is listed', async () => {
    await projectCreationDef.assertProjectStillPresent({ page, projectName: projectSeed.name });
  });

  await test.step('Open created project for edit', async () => {
    await projectCreationDef.openProjectForEdit({ page, projectName: projectSeed.name });
  });

  await test.step('Update project description', async () => {
    await projectCreationDef.updateProjectDescription({ page, updatedDescription: editedDescription });
  });

  await test.step('Assert project update success', async () => {
    await projectCreationDef.assertProjectUpdated({ page, expectedDescription: editedDescription });
  });

  await test.step('Close edit project dialog', async () => {
    await projectCreationDef.clickCloseProjectDialog({ page });
  });

  await test.step('Select created project, click Delete, and cancel deletion', async () => {
    await projectCreationDef.initiateProjectDeletion({ page, projectName: projectSeed.name });
    await projectCreationDef.cancelProjectDeletion({ page });
  });

  await test.step('Select created project, click Delete, and confirm deletion', async () => {
    await projectCreationDef.initiateProjectDeletion({ page, projectName: projectSeed.name });
    await projectCreationDef.confirmProjectDeletion({ page });
    await projectCreationDef.assertProjectDeleted({ page, projectName: projectSeed.name });
  });
});

test('TC_003 - Duplicate project name should be rejected @ProjectCreation', async ({ page }) => {
  const duplicateSeed = {
    name: `${NAME_PREFIX}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
    description: `${NAME_PREFIX} duplicate ${faker.lorem.words(2)}`,
  };

  await test.step('Open Projects list', async () => {
    await projectCreationDef.openProjectsList({ page });
  });

  await test.step('Open create project dialog', async () => {
    await projectCreationDef.clickCreateProject({ page });
    await projectCreationDef.assertCreateProjectOpened({ page });
  });

  await test.step('Create baseline project for duplicate check', async () => {
    await projectCreationDef.enterProjectDetails({
      page,
      projectName: duplicateSeed.name,
      projectDescription: duplicateSeed.description,
    });
  });

  await test.step('Open create project dialog again', async () => {
    await projectCreationDef.clickCreateProject({ page });
    await projectCreationDef.assertCreateProjectOpened({ page });
  });

  await test.step('Attempt duplicate project creation with same details', async () => {
    await projectCreationDef.enterProjectDetails({
      page,
      projectName: duplicateSeed.name,
      projectDescription: duplicateSeed.description,
    });
  });

  await test.step('Assert duplicate project is rejected', async () => {
    await projectCreationDef.assertDuplicateProjectRejected({ page });
  });

  await test.step('Close create project dialog', async () => {
    await projectCreationDef.clickCloseProjectDialog({ page });
  });
});
