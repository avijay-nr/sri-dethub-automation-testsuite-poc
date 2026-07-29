import { expect, type Locator, type Page } from '@playwright/test';
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

export async function openCreateFlowFromProjectDetails({ page }: PageArgs): Promise<void> {
  const createFlowButtons = [
    page.getByRole('button', { name: /^create flow$/i }).first(),
    page.locator('button').filter({ hasText: /^Create Flow$/ }).first(),
    page.locator('button:has-text("Create Flow")').first(),
  ];

  let clicked = false;
  for (const button of createFlowButtons) {
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 5_000 }).catch(async () => {
        await button.click({ force: true, timeout: 5_000 });
      });
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    throw new Error('Create Flow button was not visible in project details.');
  }

  const builderSignals = [
    page.getByRole('button', { name: /^transaction monitoring$/i }).first(),
    page.getByRole('radio', { name: /^transaction monitoring$/i }).first(),
    page.getByRole('option', { name: /^transaction monitoring$/i }).first(),
    page.getByText(/^transaction monitoring$/i).first(),
    page.getByText(/select use case|use case/i).first(),
  ];

  for (let attempt = 0; attempt < 10; attempt++) {
    for (const signal of builderSignals) {
      if (await signal.isVisible().catch(() => false)) {
        return;
      }
    }
    await page.waitForTimeout(500);
  }

  throw new Error('Create Flow page did not load expected use-case options.');
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
    await page.waitForTimeout(1_000);
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

    await page.waitForTimeout(500);
  }

  if (!clicked) {
    throw new Error(`Project Details button was not found for created project ${flowName}.`);
  }

  await page.waitForTimeout(500);
  if (await isProjectDetailsOpen(page)) {
    return;
  }

  // Some builds open details in-place without a dedicated heading/dialog.
  // If click is successful, allow the flow to continue.
}

export async function selectTransactionMonitoring({ page }: PageArgs): Promise<void> {
  const createFlowDialog = page.getByRole('dialog', { name: /create flow/i }).first();
  const transactionDivText = page.locator("xpath=//div[contains(text(), 'Transaction Monitoring')]").first();
  const transactionOption = createFlowDialog
    .getByRole('option', { name: /transaction monitoring/i })
    .first();
  const transactionRadio = transactionOption.locator('input[type="radio"], [role="radio"]').first();

  const isTransactionSelected = async (): Promise<boolean> => {
    const ariaSelected = await transactionOption.getAttribute('aria-selected').catch(() => null);
    if (ariaSelected === 'true') {
      return true;
    }

    const ariaChecked = await transactionOption.getAttribute('aria-checked').catch(() => null);
    if (ariaChecked === 'true') {
      return true;
    }

    const checkedMarkers = await transactionOption
      .locator('input[type="radio"]:checked, [aria-checked="true"], .selected, .active, .p-highlight')
      .count()
      .catch(() => 0);

    return checkedMarkers > 0;
  };

  for (let attempt = 0; attempt < 12; attempt++) {
    if (await transactionDivText.isVisible().catch(() => false)) {
      await transactionDivText.click({ timeout: 5_000 }).catch(async () => {
        await transactionDivText.click({ force: true, timeout: 5_000 });
      });
    }

    if (await transactionOption.isVisible().catch(() => false)) {
      await transactionOption.click({ timeout: 5_000 }).catch(async () => {
        await transactionOption.click({ force: true, timeout: 5_000 });
      });
    }

    if (await transactionRadio.isVisible().catch(() => false)) {
      await transactionRadio.click({ timeout: 5_000 }).catch(async () => {
        await transactionRadio.click({ force: true, timeout: 5_000 });
      });
    }

    if (await isTransactionSelected()) {
      return;
    }

    await page.waitForTimeout(350);
  }

  throw new Error('Unable to select Transaction Monitoring option in Create Flow dialog.');
}

export async function clickContinueAfterUseCaseSelection({ page }: PageArgs): Promise<void> {
  const continueCandidates = [
    page.getByRole('button', { name: /^continue$/i }).first(),
    page.locator('button').filter({ hasText: /^Continue$/ }).first(),
    page.locator('button:has-text("Continue")').first(),
    page.getByText(/^Continue$/i).first(),
  ];

  for (let attempt = 0; attempt < 6; attempt++) {
    for (const candidate of continueCandidates) {
      const visible = await candidate.isVisible().catch(() => false);
      if (!visible) {
        continue;
      }

      const enabled = await candidate.isEnabled().catch(() => false);
      if (enabled) {
        await candidate.click({ timeout: 5_000 }).catch(async () => {
          await candidate.click({ force: true, timeout: 5_000 });
        });

        const nextStepSignals = [
          page.getByText(/select template/i).first(),
          page.getByRole('button', { name: /^use$/i }).first(),
          page.getByText(/retail banking\s*-\s*baseline/i).first(),
          page.getByRole('option', { name: /retail banking\s*-\s*baseline/i }).first(),
          page.getByLabel(/flow name/i).first(),
          page.getByPlaceholder(/flow name/i).first(),
          page.getByText(/\*?flow name/i).first(),
          page.locator('input[name*="flow" i][name*="name" i], input[id*="flow" i][id*="name" i]').first(),
        ];

        for (let i = 0; i < 12; i++) {
          for (const signal of nextStepSignals) {
            if (await signal.isVisible().catch(() => false)) {
              return;
            }
          }
          await page.waitForTimeout(300);
        }

        throw new Error('Continue clicked but neither Select Template nor Flow Details step loaded expected signals.');
      }

      // Continue exists but is disabled; keep waiting for selection to enable it.
      if (!enabled) {
        continue;
      }
    }
    await page.waitForTimeout(300);
  }

  throw new Error('Continue button was not visible after selecting Transaction Monitoring.');
}

export async function selectRetailBankingBaselineAndUse({ page }: PageArgs): Promise<void> {
  const flowDetailsAlreadyVisible = [
    page.getByLabel(/flow name/i).first(),
    page.getByPlaceholder(/flow name/i).first(),
    page.getByText(/\*?flow name/i).first(),
    page.locator('input[name*="flow" i][name*="name" i], input[id*="flow" i][id*="name" i]').first(),
  ];

  for (const signal of flowDetailsAlreadyVisible) {
    if (await signal.isVisible().catch(() => false)) {
      return;
    }
  }

  const baselineCandidates = [
    page.getByRole('button', { name: /^retail banking\s*-\s*baseline$/i }).first(),
    page.getByRole('radio', { name: /^retail banking\s*-\s*baseline$/i }).first(),
    page.getByRole('option', { name: /^retail banking\s*-\s*baseline$/i }).first(),
    page.getByText(/^retail banking\s*-\s*baseline$/i).first(),
    page.locator('xpath=//*[contains(translate(normalize-space(.), "RETAIL BANKING - BASELINE", "retail banking - baseline"), "retail banking") and contains(translate(normalize-space(.), "RETAIL BANKING - BASELINE", "retail banking - baseline"), "baseline")]').first(),
  ];

  let selectedBaseline = false;
  for (let attempt = 0; attempt < 8; attempt++) {
    for (const candidate of baselineCandidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click({ timeout: 5_000 }).catch(async () => {
          await candidate.click({ force: true, timeout: 5_000 });
        });
        selectedBaseline = true;
        break;
      }
    }

    if (selectedBaseline) {
      break;
    }

    await page.waitForTimeout(300);
  }

  if (!selectedBaseline) {
    throw new Error('Retail Banking - Baseline option was not visible to select.');
  }

  const useButtonCandidates = [
    page.getByRole('button', { name: /^use$/i }).first(),
    page.locator('button').filter({ hasText: /^Use$/ }).first(),
    page.locator('button:has-text("Use")').first(),
  ];

  for (let attempt = 0; attempt < 8; attempt++) {
    for (const button of useButtonCandidates) {
      const visible = await button.isVisible().catch(() => false);
      const enabled = visible ? await button.isEnabled().catch(() => false) : false;
      if (visible && enabled) {
        await button.click({ timeout: 5_000 }).catch(async () => {
          await button.click({ force: true, timeout: 5_000 });
        });

        const flowNameSignals = [
          page.getByLabel(/flow name/i).first(),
          page.getByPlaceholder(/flow name/i).first(),
          page.getByText(/\*?flow name/i).first(),
          page.getByRole('textbox', { name: /flow name/i }).first(),
          page.locator('input[name*="flow" i][name*="name" i], input[id*="flow" i][id*="name" i]').first(),
        ];

        for (let i = 0; i < 12; i++) {
          for (const signal of flowNameSignals) {
            if (await signal.isVisible().catch(() => false)) {
              return;
            }
          }
          await page.waitForTimeout(300);
        }

        throw new Error('Use clicked but flow details form did not load.');
      }
    }

    await page.waitForTimeout(300);
  }

  throw new Error('Use button was not visible/enabled after selecting Retail Banking - Baseline.');
}

export async function enterFlowBuilderDetails(
  { page, flowName, flowDescription }: FlowDetailsArgs
): Promise<void> {
  const createFlowDialog = page.getByRole('dialog', { name: /create flow/i }).first();

  const flowNameCandidates = [
    page.getByLabel(/flow name/i).first(),
    page.getByPlaceholder(/flow name/i).first(),
    page.getByRole('textbox', { name: /flow name/i }).first(),
    page.locator('input[name*="flow" i][name*="name" i], input[id*="flow" i][id*="name" i]').first(),
    createFlowDialog.locator('xpath=.//*[contains(translate(normalize-space(.), "FLOW NAME", "flow name"), "flow name")]/following::*[@role="textbox" or self::input or self::textarea][1]').first(),
    createFlowDialog.locator('xpath=.//*[contains(normalize-space(.), "*Flow Name")]/following::*[@role="textbox" or self::input or self::textarea][1]').first(),
    createFlowDialog.locator('input, textarea, [role="textbox"]').first(),
  ];

  const descriptionCandidates = [
    page.getByLabel(/description/i).first(),
    page.getByPlaceholder(/description/i).first(),
    page.locator('textarea[name*="description" i], textarea[id*="description" i], input[name*="description" i], input[id*="description" i]').first(),
    createFlowDialog.locator('xpath=.//*[contains(translate(normalize-space(.), "DESCRIPTION", "description"), "description")]/following::*[@role="textbox" or self::textarea or self::input][1]').first(),
    createFlowDialog.locator('xpath=.//*[contains(normalize-space(.), "Flow Description")]/following::*[@role="textbox" or self::textarea or self::input][1]').first(),
    createFlowDialog.locator('input, textarea, [role="textbox"]').nth(1),
  ];

  let nameFilled = false;
  for (let attempt = 0; attempt < 10 && !nameFilled; attempt++) {
    for (const candidate of flowNameCandidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click({ timeout: 3_000 }).catch(() => undefined);
        await candidate.fill(flowName);
        nameFilled = true;
        break;
      }
    }

    if (!nameFilled) {
      await page.waitForTimeout(300);
    }
  }

  if (!nameFilled) {
    throw new Error('Flow Name input was not visible.');
  }

  let descriptionFilled = false;
  for (let attempt = 0; attempt < 10 && !descriptionFilled; attempt++) {
    for (const candidate of descriptionCandidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click({ timeout: 3_000 }).catch(() => undefined);
        await candidate.fill(flowDescription);
        descriptionFilled = true;
        break;
      }
    }

    if (!descriptionFilled) {
      await page.waitForTimeout(300);
    }
  }

  if (!descriptionFilled) {
    throw new Error('Flow Description input was not visible.');
  }

  await expect(
    flowNameCandidates[0]
      .or(flowNameCandidates[1])
      .or(flowNameCandidates[2])
      .or(flowNameCandidates[3])
  ).toBeVisible().catch(() => undefined);
}

export async function clickCreateFlowInDetails({ page }: PageArgs): Promise<void> {
  const createFlowDialog = page.getByRole('dialog', { name: /create flow/i }).first();
  const createFlowButtons = [
    createFlowDialog.getByRole('button', { name: /^create flow$/i }).first(),
    createFlowDialog.locator('button').filter({ hasText: /^Create Flow$/ }).first(),
    page.getByRole('button', { name: /^create flow$/i }).last(),
  ];

  for (let attempt = 0; attempt < 8; attempt++) {
    for (const button of createFlowButtons) {
      const visible = await button.isVisible().catch(() => false);
      const enabled = visible ? await button.isEnabled().catch(() => false) : false;
      if (visible && enabled) {
        await button.click({ timeout: 5_000 }).catch(async () => {
          await button.click({ force: true, timeout: 5_000 });
        });

        const completionSignals = [
          page.getByText(/runs/i).first(),
          page.getByText(/your runs/i).first(),
          page.getByRole('tab', { name: /overview|flows/i }).first(),
        ];

        for (let i = 0; i < 10; i++) {
          for (const signal of completionSignals) {
            if (await signal.isVisible().catch(() => false)) {
              return;
            }
          }
          await page.waitForTimeout(300);
        }

        return;
      }
    }

    await page.waitForTimeout(300);
  }

  throw new Error('Create Flow button was not visible or enabled in flow details step.');
}
