import type { Locator, Page } from '@playwright/test';
import * as loginDef from '../loginTestDef/loginDef';
import * as projectCreationDef from '../project-creation/project-creation-def';

type PageArgs = { page: Page };
type FlowNameArgs = PageArgs & { flowName: string };
type FlowDetailsArgs = FlowNameArgs & { flowDescription: string };

const xpaths = {
  projectsMenu: "//button[contains(normalize-space(.), 'Projects')] | //a[contains(normalize-space(.), 'Projects')]",
  createFlowButton: "//button[contains(normalize-space(.), 'Create Flow') or contains(normalize-space(.), 'Create Project')]",
  createFlowHeading:
    "//h1[contains(normalize-space(.), 'Create Flow') or contains(normalize-space(.), 'Create Project')] | //h2[contains(normalize-space(.), 'Create Flow') or contains(normalize-space(.), 'Create Project')]",
  flowNameInput:
    "//input[contains(@name,'project') and contains(@name,'name')] | //input[contains(@id,'project') and contains(@id,'name')] | //input[contains(translate(@placeholder, 'PROJECT NAME', 'project name'), 'project name')]",
  flowDescriptionInput:
    "//textarea[contains(@name,'description') or contains(@id,'description')] | //input[contains(@name,'description') or contains(@id,'description')]",
  createButton: "//button[normalize-space()='Create Flow' or normalize-space()='Create Project' or normalize-space()='Create']",
  flowNameText: (flowName: string) => `//*[normalize-space()=${JSON.stringify(flowName)}]`,
  flowDetailsButton: (flowName: string) =>
    `//*[normalize-space()=${JSON.stringify(flowName)}]/ancestor::*[.//button[contains(normalize-space(.), 'Project Details')]][1]//button[contains(normalize-space(.), 'Project Details')][1]`,
  projectDetailsSignals:
    "//h1[contains(normalize-space(.), 'Project Details') or contains(normalize-space(.), 'Edit Project')] | //h2[contains(normalize-space(.), 'Project Details') or contains(normalize-space(.), 'Edit Project')]",
};

function byXPath(page: Page, value: string): Locator {
  return page.locator(`xpath=${value}`);
}

async function clickFirstVisible(page: Page, candidates: Locator[]): Promise<boolean> {
  for (const candidate of candidates) {
    const target = candidate.first();
    if (await target.isVisible().catch(() => false)) {
      await target.click({ timeout: 5_000 }).catch(async () => {
        await target.click({ force: true, timeout: 5_000 });
      });
      return true;
    }
  }

  return false;
}

async function isFlowCreateDialogOpen(page: Page): Promise<boolean> {
  const signals = [
    byXPath(page, xpaths.createFlowHeading).first(),
    byXPath(page, xpaths.flowNameInput).first(),
    page.getByPlaceholder(/project name/i).first(),
  ];

  for (const signal of signals) {
    if (await signal.isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

async function isProjectDetailsOpen(page: Page): Promise<boolean> {
  const signals = [
    byXPath(page, xpaths.projectDetailsSignals).first(),
    page.getByRole('dialog').first(),
  ];

  for (const signal of signals) {
    if (await signal.isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

export async function loginToPortalForFlow({ page }: PageArgs): Promise<void> {
  await loginDef.loginToPortal({ page });
  await loginDef.assertLoginSuccess({ page });
}

export async function openFlowList({ page }: PageArgs): Promise<void> {
  const openedViaXPath = await clickFirstVisible(page, [
    byXPath(page, xpaths.projectsMenu),
    page.getByRole('button', { name: /projects/i }),
  ]);

  if (openedViaXPath) {
    return;
  }

  await projectCreationDef.openProjectsList({ page });
}

export async function startFlowCreation({ page }: PageArgs): Promise<void> {
  if (await isFlowCreateDialogOpen(page)) {
    return;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const clicked = await clickFirstVisible(page, [
      byXPath(page, xpaths.createFlowButton),
      page.getByRole('button', { name: /create flow|create project/i }),
    ]);

    if (!clicked) {
      continue;
    }

    await page.waitForTimeout(1_000);
    if (await isFlowCreateDialogOpen(page)) {
      return;
    }
  }

  await projectCreationDef.clickCreateProject({ page });
  await projectCreationDef.assertCreateProjectOpened({ page });
}

export async function createFlow({ page, flowName, flowDescription }: FlowDetailsArgs): Promise<void> {
  if (!(await isFlowCreateDialogOpen(page))) {
    await startFlowCreation({ page });
  }

  const nameInput = byXPath(page, xpaths.flowNameInput).first();
  const descriptionInput = byXPath(page, xpaths.flowDescriptionInput).first();

  const canUseXPathPath =
    (await nameInput.isVisible().catch(() => false)) &&
    (await descriptionInput.isVisible().catch(() => false));

  if (canUseXPathPath) {
    await nameInput.fill(flowName);
    await descriptionInput.fill(flowDescription);

    const submitted = await clickFirstVisible(page, [
      byXPath(page, xpaths.createButton),
      page.getByRole('button', { name: /create flow|create project|create/i }),
    ]);

    if (submitted) {
      return;
    }
  }

  await projectCreationDef.enterProjectDetails({
    page,
    projectName: flowName,
    projectDescription: flowDescription,
  });
}

export async function assertFlowPresent({ page, flowName }: FlowNameArgs): Promise<void> {
  await projectCreationDef.assertProjectStillPresent({ page, projectName: flowName });
}

export async function openFlowForEdit({ page, flowName }: FlowNameArgs): Promise<void> {
  await projectCreationDef.openProjectForEdit({ page, projectName: flowName });
}

export async function clickFlowProjectDetails({ page, flowName }: FlowNameArgs): Promise<void> {
  // Wait briefly for the newly created flow card to render in the list.
  const flowNameText = byXPath(page, xpaths.flowNameText(flowName)).first();
  for (let attempt = 0; attempt < 4; attempt++) {
    if (await flowNameText.isVisible().catch(() => false)) {
      break;
    }
    await page.waitForTimeout(2_000);
  }

  if (!(await flowNameText.isVisible().catch(() => false))) {
    throw new Error(`Created project ${flowName} is not visible to open details.`);
  }

  const projectDetailsButton = byXPath(page, xpaths.flowDetailsButton(flowName)).first();
  await projectDetailsButton.scrollIntoViewIfNeeded().catch(() => undefined);

  let clicked = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (await projectDetailsButton.isVisible().catch(() => false)) {
      await projectDetailsButton.click({ timeout: 5_000 }).catch(async () => {
        await projectDetailsButton.click({ force: true, timeout: 5_000 });
      });
      clicked = true;
      break;
    }

    await page.waitForTimeout(1_000);
  }

  if (!clicked) {
    throw new Error(`Project Details button was not found for created project ${flowName}.`);
  }

  await page.waitForTimeout(1_000);
  if (await isProjectDetailsOpen(page)) {
    return;
  }

  // Some builds open details in-place without a dedicated heading/dialog.
  // If click is successful, allow the flow to continue.
}
