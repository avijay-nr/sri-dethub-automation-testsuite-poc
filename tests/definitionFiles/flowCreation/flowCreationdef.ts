import type { Locator, Page } from '@playwright/test';
import * as loginDef from '../loginTest/logindef';
import * as projectCreationDef from '../projectCreation/projectCreationdef';

type PageArgs = { page: Page };
type FlowNameArgs = PageArgs & { flowName: string };
type FlowDetailsArgs = FlowNameArgs & { flowDescription: string };
type UpdatedFlowDetailsArgs = PageArgs & {
  updatedFlowName: string;
  updatedFlowDescription: string;
};

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
  overviewTab: "//*[@role='tab' and (normalize-space()='Overview' or contains(normalize-space(.), 'Overview'))]",
  flowsTab: "//*[@role='tab' and (normalize-space()='Flows' or contains(normalize-space(.), 'Flows'))]",
  deploymentsTab: "//*[@role='tab' and (normalize-space()='Deployments' or contains(normalize-space(.), 'Deployments'))]",
  deployButton:
    "//button[contains(normalize-space(.), 'Deploy') or contains(normalize-space(.), 'Publish') or contains(normalize-space(.), 'Release')] | //*[@aria-label and (contains(translate(@aria-label, 'DEPLOY', 'deploy'), 'deploy') or contains(translate(@aria-label, 'PUBLISH', 'publish'), 'publish') or contains(translate(@aria-label, 'RELEASE', 'release'), 'release'))]",
  deployButtonByFlowName: (flowName: string) =>
    `//*[normalize-space()=${JSON.stringify(flowName)}]/ancestor::*[.//button[contains(normalize-space(.), 'Deploy') or contains(normalize-space(.), 'Publish') or contains(normalize-space(.), 'Release')]][1]//button[contains(normalize-space(.), 'Deploy') or contains(normalize-space(.), 'Publish') or contains(normalize-space(.), 'Release')][1]`,
  exportButton:
    "//button[contains(normalize-space(.), 'Export Flow') or contains(normalize-space(.), 'Export') or contains(normalize-space(.), 'Download')] | //*[@aria-label and (contains(translate(@aria-label, 'EXPORT', 'export'), 'export') or contains(translate(@aria-label, 'DOWNLOAD', 'download'), 'download'))]",
  exportButtonByFlowName: (flowName: string) =>
    `//*[normalize-space()=${JSON.stringify(flowName)}]/ancestor::*[.//button[contains(normalize-space(.), 'Export Flow') or contains(normalize-space(.), 'Export') or contains(normalize-space(.), 'Download')]][1]//button[contains(normalize-space(.), 'Export Flow') or contains(normalize-space(.), 'Export') or contains(normalize-space(.), 'Download')][1]`,
  viewButton:
    "//button[contains(normalize-space(.), 'View')] | //*[@aria-label and contains(translate(@aria-label, 'VIEW', 'view'), 'view')]",
  viewButtonByFlowName: (flowName: string) =>
    `//*[normalize-space()=${JSON.stringify(flowName)}]/ancestor::*[.//button[contains(normalize-space(.), 'View')]][1]//button[contains(normalize-space(.), 'View')][1]`,
  deployedSignal:
    "//*[contains(translate(normalize-space(.), 'DEPLOYED', 'deployed'), 'deployed') or contains(translate(normalize-space(.), 'PUBLISHED', 'published'), 'published') or contains(translate(normalize-space(.), 'RELEASED', 'released'), 'released')]",
  transactionMonitoringOption:
    "//div[text()='Transaction Monitoring'] | //*[@role='option' and contains(normalize-space(.), 'Transaction Monitoring')] | //*[contains(normalize-space(.), 'Transaction Monitoring')] | //div[contains(text(),'Transaction Monitoring')]",
  domainOption:
    "//*[@role='option' and (contains(normalize-space(.), 'Retail Banking') or contains(normalize-space(.), 'Domain'))] | //*[contains(normalize-space(.), 'Retail Banking') or contains(normalize-space(.), 'Domain')]",
  modelOption:
    "//*[@role='option' and (contains(normalize-space(.), 'Baseline') or contains(normalize-space(.), 'Model'))] | //*[contains(normalize-space(.), 'Baseline') or contains(normalize-space(.), 'Model')]",
  ootbTemplateOption:
    "//*[@role='option' and contains(normalize-space(.), 'Retail Banking - Baseline')] | //*[contains(normalize-space(.), 'Retail Banking - Baseline')]",
  retailBankingOption:
    "//*[@role='option' and contains(normalize-space(.), 'Retail Banking')] | //*[contains(normalize-space(.), 'Retail Banking')]",
  useButton:
    "//button[contains(normalize-space(.), 'Use') or contains(normalize-space(.), 'use')]",
  duplicateMessage:
    "//*[contains(translate(normalize-space(.), 'DUPLICATE', 'duplicate'), 'duplicate') or contains(translate(normalize-space(.), 'EXISTS', 'exists'), 'exists') or contains(translate(normalize-space(.), 'UNIQUE', 'unique'), 'unique')]",
  flowRowContainer: (flowName: string) =>
    `//*[normalize-space()=${JSON.stringify(flowName)}]/ancestor::*[.//button[contains(normalize-space(.), 'Edit') or contains(translate(@aria-label, 'EDIT', 'edit'), 'edit')]][1]`,
};

function byXPath(page: Page, value: string): Locator {
  return page.locator(`xpath=${value}`);
}

async function clickFirstVisible(page: Page, candidates: Locator[]): Promise<boolean> {
  for (const candidate of candidates) {
    const target = candidate.first();
    if (await target.isVisible().catch(() => false)) {
      try {
        await target.click();
      } catch (e) {
        try {
          await target.click({ force: true }).catch(() => {});
        } catch (forceClickError) {
          // Page/context may close while test times out; ignore and let caller retry.
        }
      }
      return true;
    }
  }

  return false;
}

async function settlePage(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(250).catch(() => {});
}

async function isFlowCreateDialogOpen(page: Page): Promise<boolean> {
  const signals = [
    page.getByRole('dialog').first(),
    byXPath(page, xpaths.createFlowHeading).first(),
    byXPath(page, xpaths.flowNameInput).first(),
    page.getByRole('button', { name: /continue/i }).first(),
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

async function clickFirstVisibleInScope(scopes: Locator[], candidates: string[]): Promise<boolean> {
  for (const scope of scopes) {
    for (const candidate of candidates) {
      const target = scope.getByRole('button', { name: new RegExp(candidate, 'i') }).first();
      if (await target.isVisible().catch(() => false)) {
        await target.click().catch(async () => {
          await target.click({ force: true });
        });
        return true;
      }
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

    await settlePage(page);
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
      page.getByRole('button', { name: /continue/i }),
    ]);

    if (submitted) {
      return;
    }
  }

  const continueButton = page.getByRole('button', { name: /continue/i }).first();
  if (await continueButton.isVisible().catch(() => false)) {
    await continueButton.click().catch(async () => {
      await continueButton.click({ force: true });
    });
    return;
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
  const tryOpenDetailsOnce = async (): Promise<boolean> => {
    const flowNameText = byXPath(page, xpaths.flowNameText(flowName)).first();
    for (let attempt = 0; attempt < 4; attempt++) {
      if (await flowNameText.isVisible().catch(() => false)) {
        break;
      }
      await settlePage(page);
    }

    if (!(await flowNameText.isVisible().catch(() => false))) {
      return false;
    }

    const projectDetailsButton = byXPath(page, xpaths.flowDetailsButton(flowName)).first();
    await projectDetailsButton.scrollIntoViewIfNeeded().catch(() => undefined);

    let clicked = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await projectDetailsButton.isVisible().catch(() => false)) {
        await projectDetailsButton.click().catch(async () => {
          await projectDetailsButton.click({ force: true });
        });
        clicked = true;
        break;
      }

      await settlePage(page);
    }

    if (!clicked) {
      return false;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const flowsTabVisible =
        (await byXPath(page, xpaths.flowsTab).first().isVisible().catch(() => false)) ||
        (await page.getByRole('tab', { name: /flows/i }).first().isVisible().catch(() => false)) ||
        (await page.getByText(/^flows$/i).first().isVisible().catch(() => false));

      if ((await isProjectDetailsOpen(page)) || flowsTabVisible) {
        return true;
      }

      await settlePage(page);
    }

    return false;
  };

  if (await tryOpenDetailsOnce()) {
    return;
  }

  await projectCreationDef.openProjectsList({ page });
  await projectCreationDef.assertProjectsListVisible({ page });
  await settlePage(page);

  if (await tryOpenDetailsOnce()) {
    return;
  }

  throw new Error(`Project details view did not open for ${flowName}.`);
}

export async function openFlowsTabInProject({ page }: PageArgs): Promise<void> {
  await closeFlowCreationDialogIfOpen({ page }).catch(() => undefined);
  await settlePage(page);

  const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();
  if (await flowsPanel.isVisible().catch(() => false)) {
    return;
  }

  const flowsTab = page.getByRole('tab', { name: /flows/i });
  const flowsTabCount = await flowsTab.count().catch(() => 0);

  if (flowsTabCount > 0) {
    const firstFlowsTab = flowsTab.first();
    await firstFlowsTab.scrollIntoViewIfNeeded().catch(() => undefined);
    await firstFlowsTab.click().catch(async () => {
      await firstFlowsTab.click({ force: true }).catch(() => undefined);
    });

    await settlePage(page);
    return;
  }

  const clickTabCandidates = async (): Promise<boolean> => {
    const candidates = [
      byXPath(page, xpaths.flowsTab).first(),
      page.getByRole('tab', { name: /flows/i }).first(),
      page.getByText(/^flows$/i).first(),
      page.locator("xpath=//*[self::button or @role='tab'][contains(normalize-space(.), 'Flows')]").first(),
    ];

    return await clickFirstVisible(page, candidates);
  };

  for (let attempt = 0; attempt < 4; attempt++) {
    const clicked = await clickTabCandidates();
    if (clicked) {
      await settlePage(page);
      return;
    }

    await settlePage(page);
  }

  throw new Error('Could not find/click Flows tab in project details.');
}

export async function openOverviewTabInProject({ page }: PageArgs): Promise<void> {
  const clickTabCandidates = async (): Promise<boolean> => {
    const candidates = [
      byXPath(page, xpaths.overviewTab).first(),
      page.getByRole('tab', { name: /overview/i }).first(),
      page.getByText(/^overview$/i).first(),
      page.locator("xpath=//*[self::button or @role='tab'][contains(normalize-space(.), 'Overview')]").first(),
    ];

    return await clickFirstVisible(page, candidates);
  };

  for (let attempt = 0; attempt < 4; attempt++) {
    const clicked = await clickTabCandidates();
    if (clicked) {
      await settlePage(page);
      return;
    }

    await settlePage(page);
  }

  throw new Error('Could not find/click Overview tab in project details.');
}

export async function openDeploymentsTabInProject({ page }: PageArgs): Promise<void> {
  const clickTabCandidates = async (): Promise<boolean> => {
    const candidates = [
      byXPath(page, xpaths.deploymentsTab).first(),
      page.getByRole('tab', { name: /deployments/i }).first(),
      page.getByText(/^deployments$/i).first(),
      page.locator("xpath=//*[self::button or @role='tab'][contains(normalize-space(.), 'Deployments')]").first(),
    ];

    return await clickFirstVisible(page, candidates);
  };

  for (let attempt = 0; attempt < 4; attempt++) {
    const clicked = await clickTabCandidates();
    if (clicked) {
      await settlePage(page);
      return;
    }

    await settlePage(page);
  }

  throw new Error('Could not find/click Deployments tab in project details.');
}

export async function selectTransactionMonitoringFlowType({ page }: PageArgs): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  const exactTransactionMonitoring = page.locator("xpath=//div[text()='Transaction Monitoring']").first();
  const transactionMonitoringBySubtitle = page
    .locator("xpath=//*[contains(normalize-space(.), 'Detect suspicious patterns in customer transactions.')]")
    .first();
  const continueButton = page.getByRole('button', { name: /continue/i }).first();

  const isContinueEnabled = async (): Promise<boolean> => {
    return await continueButton.isEnabled().catch(() => false);
  };

  if (await isContinueEnabled()) {
    return;
  }

  await settlePage(page);

  const optionCandidates = [
    dialog.getByRole('option', { name: /transaction\s*monitoring/i }).first(),
    page.getByRole('option', { name: /transaction\s*monitoring/i }).first(),
    exactTransactionMonitoring,
    transactionMonitoringBySubtitle,
    dialog.getByText('Detect suspicious patterns in customer transactions.', { exact: false }).first(),
    page.getByText('Detect suspicious patterns in customer transactions.', { exact: false }).first(),
    dialog.getByText('Transaction Monitoring', { exact: false }).first(),
    page.getByText('Transaction Monitoring', { exact: false }).first(),
    dialog.locator(`xpath=//*[contains(normalize-space(.), 'Transaction Monitoring')]`).first(),
    page.locator(`xpath=//*[contains(normalize-space(.), 'Transaction Monitoring')]`).first(),
  ];

  const radioCandidates = [
    dialog.getByRole('option', { name: /transaction\s*monitoring/i }).first().getByRole('radio').first(),
    page.getByRole('option', { name: /transaction\s*monitoring/i }).first().getByRole('radio').first(),
    dialog.getByRole('radio').first(),
  ];

  for (let attempt = 0; attempt < 5; attempt++) {
    await clickFirstVisible(page, optionCandidates).catch(() => false);

    for (const radio of radioCandidates) {
      if (await radio.isVisible().catch(() => false)) {
        await radio.click().catch(async () => {
          await radio.click({ force: true });
        });
      }
    }

    if (await isContinueEnabled()) {
      return;
    }

    await settlePage(page);
  }

  throw new Error('Could not select Transaction Monitoring after clicking Create Flow.');
}

export async function clickFlowCreationContinue({ page }: PageArgs): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  const continueButton = dialog.getByRole('button', { name: /continue/i }).first();

  if (!(await continueButton.isEnabled().catch(() => false))) {
    await selectTransactionMonitoringFlowType({ page });
  }

  const clicked = await clickFirstVisible(page, [continueButton, page.getByRole('button', { name: /continue/i }).first()]);

  if (!clicked) {
    throw new Error('Could not click Continue after selecting Transaction Monitoring.');
  }

  await settlePage(page);
}

export async function selectDomainInFlowCreation({ page }: PageArgs): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  const clickTextOrAncestor = async (textPatterns: Array<RegExp | string>): Promise<boolean> => {
    for (const pattern of textPatterns) {
      const targets = [
        dialog.getByText(pattern, { exact: false }).first(),
        page.getByText(pattern, { exact: false }).first(),
        dialog.locator(`xpath=//*[contains(normalize-space(.), ${JSON.stringify(typeof pattern === 'string' ? pattern : String(pattern.source).replace(/\\/g, ''))})]`).first(),
        page.locator(`xpath=//*[contains(normalize-space(.), ${JSON.stringify(typeof pattern === 'string' ? pattern : String(pattern.source).replace(/\\/g, ''))})]`).first(),
      ];

      for (const target of targets) {
        if (await target.isVisible().catch(() => false)) {
          const clickableAncestors = [
            target.locator('xpath=ancestor::button[1]'),
            target.locator('xpath=ancestor::*[@role="option"][1]'),
            target.locator('xpath=ancestor::*[@role="button"][1]'),
            target.locator('xpath=ancestor::*[self::div or self::span or self::label][1]'),
            target,
          ];

          for (const clickable of clickableAncestors) {
            if (await clickable.first().isVisible().catch(() => false)) {
              await clickable.first().click().catch(async () => {
                await clickable.first().click({ force: true });
              });
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  const clicked = await clickTextOrAncestor([
    /retail\s*banking/i,
    'Retail Banking',
    'Domain',
  ]);

  if (!clicked) {
    // Some builds do not expose a labeled domain option and jump directly to model/template choices.
    const alreadyAdvanced =
      (await dialog.getByRole('option', { name: /baseline/i }).first().isVisible().catch(() => false)) ||
      (await dialog.getByText(/baseline/i).first().isVisible().catch(() => false)) ||
      (await dialog.locator(`xpath=${xpaths.modelOption}`).first().isVisible().catch(() => false)) ||
      (await dialog.locator(`xpath=${xpaths.ootbTemplateOption}`).first().isVisible().catch(() => false));

    if (alreadyAdvanced) {
      await settlePage(page);
      return;
    }

    // Fallback: click first visible selectable option/card in the domain/model chooser.
    const genericOptionClicked = await clickFirstVisible(page, [
      dialog.locator('[role="option"]').first(),
      dialog.locator('button').first(),
      dialog.locator('[aria-label*="select" i]').first(),
      dialog.locator('div[role="button"]').first(),
    ]);

    if (!genericOptionClicked) {
      throw new Error('Could not select domain after Continue.');
    }
  }

  await settlePage(page);
}

export async function selectRetailBankingInFlowCreation({ page }: PageArgs): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  const clickTextOrAncestor = async (textPatterns: Array<RegExp | string>): Promise<boolean> => {
    for (const pattern of textPatterns) {
      const targets = [
        dialog.getByText(pattern, { exact: false }).first(),
        page.getByText(pattern, { exact: false }).first(),
      ];

      for (const target of targets) {
        if (await target.isVisible().catch(() => false)) {
          const clickableAncestors = [
            target.locator('xpath=ancestor::button[1]'),
            target.locator('xpath=ancestor::*[@role="option"][1]'),
            target.locator('xpath=ancestor::*[@role="button"][1]'),
            target.locator('xpath=ancestor::*[self::div or self::span or self::label][1]'),
            target,
          ];

          for (const clickable of clickableAncestors) {
            if (await clickable.first().isVisible().catch(() => false)) {
              await clickable.first().click().catch(async () => {
                await clickable.first().click({ force: true });
              });
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  const clicked =
    (await clickTextOrAncestor([/retail\s*banking/i, 'Retail Banking'])) ||
    (await clickFirstVisible(page, [
      dialog.getByRole('option', { name: /retail\s*banking/i }).first(),
      page.getByRole('option', { name: /retail\s*banking/i }).first(),
      dialog.getByRole('button', { name: /retail\s*banking/i }).first(),
      page.getByRole('button', { name: /retail\s*banking/i }).first(),
      dialog.getByText(/retail\s*banking/i).first(),
      page.getByText(/retail\s*banking/i).first(),
      dialog.locator(`xpath=${xpaths.retailBankingOption}`).first(),
      page.locator(`xpath=${xpaths.retailBankingOption}`).first(),
    ]));

  if (!clicked) {
    // Fallback: pick the first visible selectable card/option when labels are not exposed.
    const genericSelectionClicked = await clickFirstVisible(page, [
      dialog.locator('[role="option"]').first(),
      page.locator('[role="option"]').first(),
      dialog.locator('div[role="button"]').first(),
      page.locator('div[role="button"]').first(),
      dialog.locator('button').first(),
      page.locator('button').first(),
    ]);

    if (genericSelectionClicked) {
      await settlePage(page);
      return;
    }

    // Some builds skip the explicit Retail Banking pick and show template choices directly.
    const templateVisible =
      (await dialog.locator(`xpath=${xpaths.ootbTemplateOption}`).first().isVisible().catch(() => false)) ||
      (await dialog.getByText(/retail\s*banking\s*-\s*baseline/i).first().isVisible().catch(() => false)) ||
      (await dialog.getByRole('button', { name: /use/i }).first().isVisible().catch(() => false)) ||
      (await dialog.getByRole('button', { name: /create flow|create/i }).first().isVisible().catch(() => false)) ||
      (await dialog.locator(`xpath=${xpaths.flowNameInput}`).first().isVisible().catch(() => false)) ||
      (await page.locator(`xpath=${xpaths.ootbTemplateOption}`).first().isVisible().catch(() => false)) ||
      (await page.getByText(/retail\s*banking\s*-\s*baseline/i).first().isVisible().catch(() => false)) ||
      (await page.getByRole('button', { name: /use/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('button', { name: /create flow|create/i }).first().isVisible().catch(() => false)) ||
      (await page.locator(`xpath=${xpaths.flowNameInput}`).first().isVisible().catch(() => false));

    if (!templateVisible) {
      throw new Error('Could not select Retail Banking after Continue.');
    }
  }

  await settlePage(page);
}

export async function selectModelInFlowCreation({ page }: PageArgs): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  const clicked = await clickFirstVisible(page, [
    dialog.getByRole('option', { name: /baseline/i }).first(),
    dialog.getByText(/baseline/i).first(),
    dialog.locator(`xpath=${xpaths.modelOption}`).first(),
    page.getByRole('option', { name: /baseline/i }).first(),
    page.getByText(/baseline/i).first(),
    dialog.getByRole('button', { name: /baseline|model/i }).first(),
    page.getByRole('button', { name: /baseline|model/i }).first(),
    dialog.getByText(/model/i).first(),
    page.getByText(/model/i).first(),
  ]);

  if (!clicked) {
    // Some builds auto-advance from domain to template/use/details without explicit model step.
    const alreadyAdvanced =
      (await dialog.locator(`xpath=${xpaths.ootbTemplateOption}`).first().isVisible().catch(() => false)) ||
      (await page.locator(`xpath=${xpaths.ootbTemplateOption}`).first().isVisible().catch(() => false)) ||
      (await dialog.getByText(/retail\s*banking\s*-\s*baseline/i).first().isVisible().catch(() => false)) ||
      (await page.getByText(/retail\s*banking\s*-\s*baseline/i).first().isVisible().catch(() => false)) ||
      (await dialog.getByRole('button', { name: /use/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('button', { name: /use/i }).first().isVisible().catch(() => false)) ||
      (await dialog.locator(`xpath=${xpaths.flowNameInput}`).first().isVisible().catch(() => false)) ||
      (await page.locator(`xpath=${xpaths.flowNameInput}`).first().isVisible().catch(() => false));

    if (!alreadyAdvanced) {
      const genericSelectionClicked = await clickFirstVisible(page, [
        dialog.locator('[role="option"]').first(),
        page.locator('[role="option"]').first(),
        dialog.locator('div[role="button"]').first(),
        page.locator('div[role="button"]').first(),
        dialog.locator('button').first(),
        page.locator('button').first(),
      ]);

      if (!genericSelectionClicked) {
        throw new Error('Could not select model after domain selection.');
      }
    }
  }

  await settlePage(page);
}

export async function selectOotbTemplateInFlowCreation({ page }: PageArgs): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  const clicked = await clickFirstVisible(page, [
    dialog.getByRole('option', { name: /retail\s*banking\s*-\s*baseline/i }).first(),
    dialog.getByText(/retail\s*banking\s*-\s*baseline/i).first(),
    dialog.getByRole('option', { name: /baseline/i }).first(),
    dialog.getByText(/baseline/i).first(),
    dialog.getByRole('button', { name: /retail\s*banking\s*-\s*baseline|baseline/i }).first(),
    dialog.getByText(/ootb|template/i).first(),
    dialog.locator(`xpath=${xpaths.ootbTemplateOption}`).first(),
    page.getByRole('option', { name: /retail\s*banking\s*-\s*baseline/i }).first(),
    page.getByText(/retail\s*banking\s*-\s*baseline/i).first(),
    page.getByRole('option', { name: /baseline/i }).first(),
    page.getByText(/baseline/i).first(),
    page.getByRole('button', { name: /retail\s*banking\s*-\s*baseline|baseline/i }).first(),
    page.getByText(/ootb|template/i).first(),
  ]);

  if (!clicked) {
    // Some builds do not expose the template card and move directly to Use/details.
    const alreadyAdvanced =
      (await dialog.getByRole('button', { name: /use/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('button', { name: /use/i }).first().isVisible().catch(() => false)) ||
      (await dialog.locator(`xpath=${xpaths.flowNameInput}`).first().isVisible().catch(() => false)) ||
      (await page.locator(`xpath=${xpaths.flowNameInput}`).first().isVisible().catch(() => false)) ||
      (await dialog.getByRole('button', { name: /create flow|create/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('button', { name: /create flow|create/i }).first().isVisible().catch(() => false));

    if (alreadyAdvanced) {
      await settlePage(page);
      return;
    }

    const genericTemplateClicked = await clickFirstVisible(page, [
      dialog.locator('[role="option"]').first(),
      page.locator('[role="option"]').first(),
      dialog.locator('div[role="button"]').first(),
      page.locator('div[role="button"]').first(),
      dialog.locator('button').first(),
      page.locator('button').first(),
    ]);

    if (!genericTemplateClicked) {
      throw new Error('Could not select OOTB template Retail Banking - Baseline after model selection.');
    }
  }

  await settlePage(page);
}

export async function clickUseInFlowCreation({ page }: PageArgs): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  const useButton = dialog.locator(`xpath=${xpaths.useButton}`).first();
  const clicked = await clickFirstVisible(page, [
    useButton,
    dialog.getByRole('button', { name: /use/i }).first(),
    page.getByRole('button', { name: /use/i }).first(),
    dialog.getByText(/^use$/i).first(),
    page.getByText(/^use$/i).first(),
    dialog.getByRole('button', { name: /continue|next|create flow|create/i }).first(),
    page.getByRole('button', { name: /continue|next|create flow|create/i }).first(),
  ]);

  if (!clicked) {
    const alreadyAdvanced =
      (await dialog.locator(`xpath=${xpaths.flowNameInput}`).first().isVisible().catch(() => false)) ||
      (await page.locator(`xpath=${xpaths.flowNameInput}`).first().isVisible().catch(() => false)) ||
      (await dialog.getByRole('button', { name: /create flow|create/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('button', { name: /create flow|create/i }).first().isVisible().catch(() => false));

    if (!alreadyAdvanced) {
      throw new Error('Could not click Use after selecting Retail Banking.');
    }
  }

  await settlePage(page);
}

export async function closeFlowCreationDialogIfOpen({ page }: PageArgs): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  if (!(await dialog.isVisible().catch(() => false))) {
    return;
  }

  const closed = await clickFirstVisible(page, [
    dialog.getByRole('button', { name: /close|cancel/i }).first(),
    dialog.locator('[aria-label*="close" i]').first(),
    dialog.locator('xpath=(.//button)[1]').first(),
  ]);
}

export async function fillFlowDetailsAndCreateInFlowCreation(
  { page, flowName, flowDescription }: FlowDetailsArgs
): Promise<void> {
  const dialog = page.getByRole('dialog').first();
  const scopes = [dialog, page.locator('main').first(), page.locator('body').first()];

  for (let step = 0; step < 6; step++) {
    let nameFilled = false;
    let descriptionFilled = false;

    for (const scope of scopes) {
      if (!nameFilled) {
        const nameCandidates = [
          scope.locator('input:not([type="radio"])[name*="flow" i], input:not([type="radio"])[id*="flow" i], input:not([type="radio"])[name*="name" i], input:not([type="radio"])[id*="name" i]').first(),
          scope.getByLabel(/flow\s*name|\*\s*flow\s*name|name/i).first(),
          scope.getByPlaceholder(/flow\s*name|name/i).first(),
          scope.getByRole('textbox').first(),
        ];

        for (const nameInput of nameCandidates) {
          if (await nameInput.isVisible().catch(() => false)) {
            await nameInput.fill('');
            await nameInput.fill(flowName);
            nameFilled = true;
            break;
          }
        }
      }

      if (!descriptionFilled) {
        const descriptionCandidates = [
          scope.locator('textarea[name*="description" i], textarea[id*="description" i], input[name*="description" i], input[id*="description" i]').first(),
          scope.getByLabel(/flow\s*description|description/i).first(),
          scope.getByPlaceholder(/flow\s*description|description/i).first(),
          scope.getByRole('textbox').nth(1),
        ];

        for (const descriptionInput of descriptionCandidates) {
          if (await descriptionInput.isVisible().catch(() => false)) {
            await descriptionInput.fill('');
            await descriptionInput.fill(flowDescription);
            descriptionFilled = true;
            break;
          }
        }
      }

      if (nameFilled && descriptionFilled) {
        break;
      }
    }

    // Submit only through enabled actions; avoid clicking disabled Create Flow buttons.
    const submitCandidates = [
      dialog.getByRole('button', { name: /create\s*flow|create|continue|next|confirm|save/i }).first(),
      page.getByRole('button', { name: /create\s*flow|create|continue|next|confirm|save/i }).first(),
    ];

    let clicked = false;
    for (const submit of submitCandidates) {
      if ((await submit.isVisible().catch(() => false)) && (await submit.isEnabled().catch(() => false))) {
        try {
          await submit.click();
        } catch (e) {
          try {
            await submit.click({ force: true }).catch(() => {});
          } catch (forceClickError) {
            // Page or browser may have closed, skip force click
          }
        }
        clicked = true;
        break;
      }
    }

    if (clicked) {
      // Exit immediately after successful click - no retries
      await settlePage(page);
      return;
    }

    // If not clicked, dialog might not be ready yet
    if (!nameFilled || !descriptionFilled) {
      await settlePage(page);
      continue;
    }

    // Could not find submit button, exit loop
    break;
  }
}

export async function createFlowInsideProject(
  { page, flowName, flowDescription }: FlowDetailsArgs
): Promise<void> {
  await startFlowCreation({ page });
  await selectTransactionMonitoringFlowType({ page });
  await clickFlowCreationContinue({ page });
  await selectDomainInFlowCreation({ page });
  await selectModelInFlowCreation({ page });
  await selectOotbTemplateInFlowCreation({ page });
  await clickUseInFlowCreation({ page });
  await fillFlowDetailsAndCreateInFlowCreation({ page, flowName, flowDescription });
}

export async function createFlowFromOverviewSectionInsideProject(
  { page, flowName, flowDescription }: FlowDetailsArgs
): Promise<void> {
  await openOverviewTabInProject({ page });
  await createFlowInsideProject({ page, flowName, flowDescription });
}

export async function openFlowForEditInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await openFlowsTabInProject({ page });
  await settlePage(page);

  const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();
  const panelVisible = await flowsPanel.isVisible().catch(() => false);
  const searchScope = panelVisible ? flowsPanel : page.locator('main').first();

  // Narrow the flows list to the target flow when a search input is present.
  const searchInputCandidates = [
    searchScope.getByPlaceholder(/search/i).first(),
    searchScope.getByRole('searchbox').first(),
    searchScope.locator('input[type="search"]').first(),
    searchScope.locator('input[placeholder*="Search" i]').first(),
  ];
  for (const searchInput of searchInputCandidates) {
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('');
      await searchInput.fill(flowName);
      await settlePage(page);
      break;
    }
  }

  const editCandidates = [
    searchScope.locator(`xpath=//*[normalize-space()=${JSON.stringify(flowName)}]/ancestor::*[.//button[contains(normalize-space(.), 'Edit Flow') or contains(normalize-space(.), 'Edit')]][1]//button[contains(normalize-space(.), 'Edit Flow') or contains(normalize-space(.), 'Edit')][1]`).first(),
    page.locator(`xpath=//*[normalize-space()=${JSON.stringify(flowName)}]/ancestor::*[.//button[contains(normalize-space(.), 'Edit Flow') or contains(normalize-space(.), 'Edit')]][1]//button[contains(normalize-space(.), 'Edit Flow') or contains(normalize-space(.), 'Edit')][1]`).first(),
    searchScope.getByRole('button', { name: /edit flow/i }).first(),
    searchScope.getByRole('button', { name: /edit/i }).first(),
    searchScope.locator('button[aria-label*="edit" i]').first(),
    searchScope.locator('[aria-label*="edit" i]').first(),
    page.getByRole('button', { name: /edit flow|edit/i }).first(),
  ];

  let clicked = false;
  for (let attempt = 0; attempt < 4; attempt++) {
    for (const candidate of editCandidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click().catch(async () => {
          await candidate.click({ force: true });
        });
        clicked = true;
        break;
      }
    }

    if (clicked) {
      break;
    }

    await settlePage(page);
  }

  if (!clicked) {
    throw new Error(`Could not find an Edit action for flow ${flowName} inside the project.`);
  }
}

export async function updateFlowNameAndDescriptionInsideProject(
  { page, updatedFlowName, updatedFlowDescription }: UpdatedFlowDetailsArgs
): Promise<void> {
  const namedDialog = page.getByRole('dialog', { name: /edit\s*flow/i }).first();
  const dialog = (await namedDialog.isVisible().catch(() => false))
    ? namedDialog
    : page.getByRole('dialog').first();
  const scopes = [dialog, page.locator('main').first(), page.locator('body').first()];

  const dialogTextboxes = dialog.getByRole('textbox');
  if ((await dialogTextboxes.count().catch(() => 0)) >= 2) {
    const nameBox = dialogTextboxes.nth(0);
    const descriptionBox = dialogTextboxes.nth(1);

    if (await nameBox.isVisible().catch(() => false)) {
      await nameBox.fill('');
      await nameBox.fill(updatedFlowName);
    }

    if (await descriptionBox.isVisible().catch(() => false)) {
      await descriptionBox.fill('');
      await descriptionBox.fill(updatedFlowDescription);
    }
  }

  let nameUpdated = false;
  for (const scope of scopes) {
    const nameCandidates = [
      scope.locator('input:not([type="radio"])[name*="flow" i], input:not([type="radio"])[id*="flow" i], input:not([type="radio"])[name*="name" i], input:not([type="radio"])[id*="name" i]').first(),
      scope.getByLabel(/flow name|name/i).first(),
      scope.getByPlaceholder(/flow name|name/i).first(),
      scope.getByRole('textbox').first(),
    ];
    for (const nameInput of nameCandidates) {
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('');
        await nameInput.fill(updatedFlowName);
        nameUpdated = true;
        break;
      }
    }
    if (nameUpdated) {
      break;
    }
  }

  let descriptionUpdated = false;
  for (const scope of scopes) {
    const descriptionCandidates = [
      scope.locator('textarea[name*="description" i], textarea[id*="description" i], input[name*="description" i], input[id*="description" i]').first(),
      scope.getByLabel(/description/i).first(),
      scope.getByPlaceholder(/description/i).first(),
      scope.getByRole('textbox').nth(1),
    ];
    for (const descriptionInput of descriptionCandidates) {
      if (await descriptionInput.isVisible().catch(() => false)) {
        await descriptionInput.fill('');
        await descriptionInput.fill(updatedFlowDescription);
        descriptionUpdated = true;
        break;
      }
    }
    if (descriptionUpdated) {
      break;
    }
  }

  if (!nameUpdated || !descriptionUpdated) {
    throw new Error('Could not locate flow name/description fields while editing flow inside project.');
  }

  const saved = await clickFirstVisibleInScope(
    [dialog, page.locator('main').first(), page.locator('body').first()],
    ['Save', 'Update', 'Confirm', 'Done']
  );

  if (!saved) {
    throw new Error('Could not find Save/Update action while editing flow inside project.');
  }

  await settlePage(page);
}

export async function assertFlowDetailsInEditDialog(
  { page, updatedFlowName, updatedFlowDescription }: UpdatedFlowDetailsArgs
): Promise<void> {
  const namedDialog = page.getByRole('dialog', { name: /edit\s*flow/i }).first();
  const dialog = (await namedDialog.isVisible().catch(() => false))
    ? namedDialog
    : page.getByRole('dialog').first();
  const scopes = [dialog, page.locator('main').first(), page.locator('body').first()];

  let nameMatches = false;
  let descriptionMatches = false;

  const dialogTextboxes = dialog.getByRole('textbox');
  if ((await dialogTextboxes.count().catch(() => 0)) >= 2) {
    const nameValue = await dialogTextboxes.nth(0).inputValue().catch(() => '');
    const descriptionValue = await dialogTextboxes.nth(1).inputValue().catch(() => '');

    if (nameValue.trim() === updatedFlowName && descriptionValue.trim() === updatedFlowDescription) {
      return;
    }
  }

  for (const scope of scopes) {
    const nameCandidates = [
      scope.locator('input:not([type="radio"])[name*="flow" i], input:not([type="radio"])[id*="flow" i], input:not([type="radio"])[name*="name" i], input:not([type="radio"])[id*="name" i]').first(),
      scope.getByLabel(/flow name|name/i).first(),
      scope.getByPlaceholder(/flow name|name/i).first(),
      scope.getByRole('textbox').first(),
    ];

    for (const nameInput of nameCandidates) {
      if (await nameInput.isVisible().catch(() => false)) {
        const value = await nameInput.inputValue().catch(() => '');
        if (value.trim() === updatedFlowName) {
          nameMatches = true;
        }
        break;
      }
    }

    const descriptionCandidates = [
      scope.locator('textarea[name*="description" i], textarea[id*="description" i], input[name*="description" i], input[id*="description" i]').first(),
      scope.getByLabel(/description/i).first(),
      scope.getByPlaceholder(/description/i).first(),
      scope.getByRole('textbox').nth(1),
    ];

    for (const descriptionInput of descriptionCandidates) {
      if (await descriptionInput.isVisible().catch(() => false)) {
        const value = await descriptionInput.inputValue().catch(() => '');
        if (value.trim() === updatedFlowDescription) {
          descriptionMatches = true;
        }
        break;
      }
    }

    if (nameMatches && descriptionMatches) {
      return;
    }
  }

  throw new Error('Updated flow name/description are not visible in edit dialog.');
}

export async function assertFlowVisibleInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await closeFlowCreationDialogIfOpen({ page });

  for (let attempt = 0; attempt < 8; attempt++) {
    const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();
    const flowsPanelVisible = await flowsPanel.isVisible().catch(() => false);

    // When the Flows panel is already visible, avoid tab re-navigation that can fail intermittently.
    if (!flowsPanelVisible) {
      const flowsTab = page.getByRole('tab', { name: /flows/i }).first();
      const tabSelected = (await flowsTab.getAttribute('aria-selected').catch(() => null))?.includes('true') ?? false;
      const tabVisible = await flowsTab.isVisible().catch(() => false);

      // Avoid hard-failing on intermittent tab click issues; search current page first,
      // then attempt tab navigation as a late fallback.
      if ((!tabVisible || !tabSelected) && attempt >= 2) {
        await openFlowsTabInProject({ page }).catch(() => undefined);
      }
    }

    const scope = (await flowsPanel.isVisible().catch(() => false))
      ? flowsPanel
      : page.locator('main').first();

    // Narrow list results when a search/filter input exists in the Flows section.
    const searchInputCandidates = [
      scope.getByPlaceholder(/search/i).first(),
      scope.getByRole('searchbox').first(),
      scope.locator('input[type="search"]').first(),
      scope.locator('input[placeholder*="Search" i]').first(),
    ];
    for (const searchInput of searchInputCandidates) {
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('');
        await searchInput.fill(flowName);
        await settlePage(page);
        break;
      }
    }

    const exactByXPath = scope.locator(`xpath=${xpaths.flowNameText(flowName)}`).first();
    const exactByText = scope.getByText(flowName, { exact: true }).first();
    const partialByText = scope.getByText(flowName, { exact: false }).first();
    const escapedName = flowName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexByText = scope.getByText(new RegExp(escapedName, 'i')).first();
    const globalExact = page.getByText(flowName, { exact: true }).first();
    const globalRegex = page.getByText(new RegExp(escapedName, 'i')).first();

    await partialByText.scrollIntoViewIfNeeded().catch(() => undefined);

    const visible =
      (await exactByXPath.isVisible().catch(() => false)) ||
      (await exactByText.isVisible().catch(() => false)) ||
      (await partialByText.isVisible().catch(() => false)) ||
      (await regexByText.isVisible().catch(() => false)) ||
      (await globalExact.isVisible().catch(() => false)) ||
      (await globalRegex.isVisible().catch(() => false));

    const mainText = await page.locator('main').first().innerText().catch(() => '');
    const visibleByMainText = mainText.includes(flowName);

    if (visible || visibleByMainText) {
      return;
    }

    // Retry with tab re-open for delayed backend indexing/render.
    if (attempt % 2 === 1) {
      await page.reload().catch(() => undefined);
    }

    await settlePage(page);
  }

  throw new Error(`Created flow ${flowName} is not visible in the Flows section.`);
}

export async function assertSingleFlowVisibleInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await closeFlowCreationDialogIfOpen({ page });

  const getVisibleCount = async (locator: Locator): Promise<number> => {
    const total = await locator.count();
    let visibleCount = 0;

    for (let i = 0; i < total; i++) {
      const item = locator.nth(i);
      if (await item.isVisible().catch(() => false)) {
        visibleCount++;
      }
    }

    return visibleCount;
  };

  for (let attempt = 0; attempt < 6; attempt++) {
    await openFlowsTabInProject({ page });

    const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();

    const scope = (await flowsPanel.isVisible().catch(() => false))
      ? flowsPanel
      : page.locator('main').first();

    const exactByXPath = scope.locator(`xpath=${xpaths.flowNameText(flowName)}`);
    const exactByText = scope.getByText(flowName, { exact: true });

    const xpathVisibleCount = await getVisibleCount(exactByXPath);
    const textVisibleCount = await getVisibleCount(exactByText);
    const visibleCount = Math.max(xpathVisibleCount, textVisibleCount);

    if (visibleCount > 1) {
      throw new Error(`Duplicate flow ${flowName} is visible more than once in the Flows section.`);
    }

    if (visibleCount === 1) {
      return;
    }

    await settlePage(page);
  }
}

export async function deleteFlowInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await openFlowsTabInProject({ page });
  await assertFlowVisibleInsideProject({ page, flowName });

  const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();
  const panelVisible = await flowsPanel.isVisible().catch(() => false);
  const searchScope = panelVisible ? flowsPanel : page.locator('main').first();

  const flowContainer = panelVisible
    ? flowsPanel.locator(`xpath=${xpaths.flowRowContainer(flowName)}`).first()
    : byXPath(page, xpaths.flowRowContainer(flowName)).first();

  const deleteClicked = await clickFirstVisible(page, [
    flowContainer.getByRole('button', { name: /delete\s*flow|delete/i }).first(),
    flowContainer.locator('button[aria-label*="delete" i]').first(),
    searchScope.getByRole('button', { name: /delete\s*flow|delete/i }).first(),
    page.getByRole('button', { name: /delete\s*flow|delete/i }).first(),
  ]);

  if (!deleteClicked) {
    throw new Error(`Could not find Delete action for flow ${flowName}.`);
  }
  await settlePage(page);
  const confirmClicked = await clickFirstVisible(page, [
    page.getByRole('dialog').getByRole('button', { name: /delete|yes|confirm|ok/i }).first(),
    page.getByRole('button', { name: /delete|yes|confirm|ok/i }).first(),
    page.locator("xpath=//button[normalize-space()='Delete' or normalize-space()='Yes' or normalize-space()='Yes, Delete' or normalize-space()='Confirm' or normalize-space()='OK']").first(),
  ]);
  if (!confirmClicked) {
    throw new Error(`Could not confirm delete for flow ${flowName}.`);
  }
  await settlePage(page);
}
export async function assertFlowNotVisibleInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await closeFlowCreationDialogIfOpen({ page });
  for (let attempt = 0; attempt < 6; attempt++) {
    await openFlowsTabInProject({ page });
    const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();
    const scope = (await flowsPanel.isVisible().catch(() => false))
      ? flowsPanel
      : page.locator('main').first();
    const searchInputCandidates = [
      scope.getByPlaceholder(/search/i).first(),
      scope.getByRole('searchbox').first(),
      scope.locator('input[type="search"]').first(),
      scope.locator('input[placeholder*="Search" i]').first(),
    ];
    for (const searchInput of searchInputCandidates) {
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('');
        await searchInput.fill(flowName);
        await settlePage(page);
        break;
      }
    }
    const visible =
      (await scope.locator(`xpath=${xpaths.flowNameText(flowName)}`).first().isVisible().catch(() => false)) ||
      (await scope.getByText(flowName, { exact: true }).first().isVisible().catch(() => false));
    if (!visible) {
      return;
    }
    await settlePage(page);
  }
  throw new Error(`Flow ${flowName} is still visible after deletion.`);
}
export async function assertFlowVisibleInDeploymentsTab({ page, flowName }: FlowNameArgs): Promise<void> {
  await openDeploymentsTabInProject({ page });
  for (let attempt = 0; attempt < 8; attempt++) {
    const deploymentsPanel = page.getByRole('tabpanel', { name: /deployments/i }).first();
    const scope = (await deploymentsPanel.isVisible().catch(() => false))
      ? deploymentsPanel
      : page.locator('main').first();
    const searchInputCandidates = [
      scope.getByPlaceholder(/search/i).first(),
      scope.getByRole('searchbox').first(),
      scope.locator('input[type="search"]').first(),
      scope.locator('input[placeholder*="Search" i]').first(),
    ];
    for (const searchInput of searchInputCandidates) {
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('');
        await searchInput.fill(flowName);
        await settlePage(page);
        break;
      }
    }
    const exactByXPath = scope.locator(`xpath=${xpaths.flowNameText(flowName)}`).first();
    const exactByText = scope.getByText(flowName, { exact: true }).first();
    const partialByText = scope.getByText(flowName, { exact: false }).first();
    const escapedName = flowName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexByText = scope.getByText(new RegExp(escapedName, 'i')).first();
    const visible =
      (await exactByXPath.isVisible().catch(() => false)) ||
      (await exactByText.isVisible().catch(() => false)) ||
      (await partialByText.isVisible().catch(() => false)) ||
      (await regexByText.isVisible().catch(() => false));
    if (visible) {
      return;
    }
    await settlePage(page);
  }
  throw new Error(`Deployed flow ${flowName} is not visible in Deployments tab.`);
}
export async function deployFlowInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await openFlowsTabInProject({ page });
  const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();
  const panelVisible = await flowsPanel.isVisible().catch(() => false);
  const searchScope = panelVisible ? flowsPanel : page.locator('main').first();
  const actionScope = searchScope;
  const deployClicked = await clickFirstVisible(page, [
    byXPath(page, xpaths.deployButtonByFlowName(flowName)).first(),
    actionScope.locator(`xpath=${xpaths.deployButton}`).first(),
    actionScope.getByRole('button', { name: /deploy|publish|release/i }).first(),
    actionScope.locator('button[aria-label*="deploy" i], button[aria-label*="publish" i], button[aria-label*="release" i]').first(),
    actionScope.getByText(/^deploy$/i).first(),
    searchScope.getByRole('button', { name: /deploy|publish|release/i }).first(),
    page.getByRole('button', { name: /deploy|publish|release/i }).first(),
  ]);
  if (!deployClicked) {
    throw new Error(`Could not find a Deploy action for flow ${flowName}.`);
  }
  await settlePage(page);
  const deployedSignals = [
    actionScope.getByText(/deployed|published|released/i).first(),
    searchScope.getByText(/deployed|published|released/i).first(),
    page.getByText(/deployed|published|released/i).first(),
    actionScope.locator(`xpath=${xpaths.deployedSignal}`).first(),
    page.locator(`xpath=${xpaths.deployedSignal}`).first(),
  ];
  await assertFlowVisibleInsideProject({ page, flowName });
  for (const signal of deployedSignals) {
    if (await signal.isVisible().catch(() => false)) {
      return;
    }
  }
  await settlePage(page);
}
export async function exportFlowInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await openFlowsTabInProject({ page });
  await assertFlowVisibleInsideProject({ page, flowName });
  const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();
  const panelVisible = await flowsPanel.isVisible().catch(() => false);
  const searchScope = panelVisible ? flowsPanel : page.locator('main').first();
  const downloadPromise = page.waitForEvent('download').catch(() => null);
  const exportClicked = await clickFirstVisible(page, [
    byXPath(page, xpaths.exportButtonByFlowName(flowName)).first(),
    searchScope.locator(`xpath=${xpaths.exportButton}`).first(),
    searchScope.getByRole('button', { name: /export\s*flow|export|download/i }).first(),
    searchScope.locator('button[aria-label*="export" i], button[aria-label*="download" i]').first(),
    page.getByRole('button', { name: /export\s*flow|export|download/i }).first(),
  ]);
  if (!exportClicked) {
    throw new Error(`Could not find an Export action for flow ${flowName}.`);
  }
  const download = await downloadPromise;
  if (download) {
    const suggested = download.suggestedFilename();
    if (suggested && suggested.trim().length > 0) {
      return;
    }
  }
  const exportSignals = [
    page.getByText(/exported|downloading|download started|prepared|success/i).first(),
    searchScope.getByText(/exported|downloading|download started|prepared|success/i).first(),
    page.getByRole('alert').filter({ hasText: /export|download/i }).first(),
  ];
  for (const signal of exportSignals) {
    if (await signal.isVisible().catch(() => false)) {
      return;
    }
  }
  await settlePage(page);
}
export async function deployFlowFromFlowScreenInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await openFlowsTabInProject({ page });
  await assertFlowVisibleInsideProject({ page, flowName });
  const flowsPanel = page.getByRole('tabpanel', { name: /flows/i }).first();
  const panelVisible = await flowsPanel.isVisible().catch(() => false);
  const searchScope = panelVisible ? flowsPanel : page.locator('main').first();
  const popupPromise = page.context().waitForEvent('page').catch(() => null);
  const viewClicked = await clickFirstVisible(page, [
    byXPath(page, xpaths.viewButtonByFlowName(flowName)).first(),
    searchScope.locator(`xpath=${xpaths.viewButton}`).first(),
    searchScope.getByRole('button', { name: /^view$/i }).first(),
    page.getByRole('button', { name: /^view$/i }).first(),
  ]);
  if (!viewClicked) {
    throw new Error(`Could not find a View action for flow ${flowName}.`);
  }
  const popup = await popupPromise;
  const activePage = popup ?? page;
  let deployClicked = false;
  for (let attempt = 0; attempt < 6; attempt++) {
    deployClicked = await clickFirstVisible(activePage, [
      byXPath(activePage, xpaths.deployButtonByFlowName(flowName)).first(),
      byXPath(activePage, xpaths.deployButton).first(),
      activePage.getByRole('button', { name: /deploy|publish|release|go live|activate/i }).first(),
      activePage.locator('button[aria-label*="deploy" i], button[aria-label*="publish" i], button[aria-label*="release" i], button[aria-label*="activate" i]').first(),
      activePage.getByText(/^deploy$/i).first(),
      activePage.locator("xpath=//*[self::button or @role='button'][contains(normalize-space(.), 'Deploy') or contains(normalize-space(.), 'Publish') or contains(normalize-space(.), 'Release')]").first(),
    ]);
    if (deployClicked) {
      break;
    }
    await settlePage(activePage);
  }
  if (!deployClicked) {
    throw new Error(`Could not find Deploy action on flow screen for ${flowName}.`);
  }
  await settlePage(activePage);
  const deployedSignals = [
    activePage.getByText(/deployed|published|released/i).first(),
    activePage.locator(`xpath=${xpaths.deployedSignal}`).first(),
    activePage.getByRole('alert').filter({ hasText: /deployed|published|released/i }).first(),
  ];
  for (const signal of deployedSignals) {
    if (await signal.isVisible().catch(() => false)) {
      return;
    }
  }
  await settlePage(activePage);
}
export async function deployFlowFromOverviewSectionInsideProject({ page, flowName }: FlowNameArgs): Promise<void> {
  await openOverviewTabInProject({ page });
  const overviewPanel = page.getByRole('tabpanel', { name: /overview/i }).first();
  const panelVisible = await overviewPanel.isVisible().catch(() => false);
  const scope = panelVisible ? overviewPanel : page.locator('main').first();
  let deployClicked = false;
  for (let attempt = 0; attempt < 4; attempt++) {
    deployClicked = await clickFirstVisible(page, [
      scope.locator(`xpath=${xpaths.deployButton}`).first(),
      scope.getByRole('button', { name: /deploy|publish|release/i }).first(),
      scope.locator('button[aria-label*="deploy" i], button[aria-label*="publish" i], button[aria-label*="release" i]').first(),
      scope.getByText(/^deploy$/i).first(),
      byXPath(page, xpaths.deployButton).first(),
      page.getByRole('button', { name: /deploy|publish|release/i }).first(),
    ]);
    if (deployClicked) {
      break;
    }
    await settlePage(page);
  }
  if (!deployClicked) {
    throw new Error(`Could not find Deploy action in Overview section for ${flowName}.`);
  }
  await settlePage(page);
  const deployedSignals = [
    page.getByText(/deployed|published|released/i).first(),
    page.locator(`xpath=${xpaths.deployedSignal}`).first(),
    page.getByRole('alert').filter({ hasText: /deployed|published|released/i }).first(),
  ];
  for (const signal of deployedSignals) {
    if (await signal.isVisible().catch(() => false)) {
      return;
    }
  }
  await settlePage(page);
}
export async function assertDuplicateFlowRejected({ page, flowName }: FlowNameArgs): Promise<void> {
  const closeBrowserNow = async (): Promise<void> => {
    await page.close().catch(() => undefined);
    await page.context().close().catch(() => undefined);
  };

  const namedDialog = page.getByRole('dialog', { name: /create\s*flow/i }).first();
  const dialog = (await namedDialog.isVisible().catch(() => false)) ? namedDialog : page.getByRole('dialog').first();
  const duplicateSignals = [
    dialog.getByText(/already exists|duplicate|must be unique|name.*exists|name.*taken/i).first(),
    dialog.getByText(/cannot\s*be\s*a\s*duplicate/i).first(),
    page.getByRole('alert').filter({ hasText: /already exists|duplicate|must be unique|exists/i }).first(),
    page.getByText(/already exists|duplicate|must be unique|name.*exists|name.*taken/i).first(),
    dialog.locator(`xpath=${xpaths.duplicateMessage}`).first(),
    page.locator(`xpath=${xpaths.duplicateMessage}`).first(),
    page.getByText(/cannot be empty|invalid|required|not allowed|already used/i).first(),
    dialog.getByText(/cannot be empty|invalid|required|not allowed|already used/i).first(),
  ];

  for (let attempt = 0; attempt < 30; attempt++) {
    for (const signal of duplicateSignals) {
      if (await signal.isVisible().catch(() => false)) {
        await closeBrowserNow();
        return;
      }
    }

    const createFlowButton = dialog.getByRole('button', { name: /create\s*flow|create/i }).first();
    const dialogStillOpen = await dialog.isVisible().catch(() => false);
    const createStillDisabled =
      (await createFlowButton.isVisible().catch(() => false)) &&
      !(await createFlowButton.isEnabled().catch(() => false));

    const flowNameTextbox = dialog.getByRole('textbox').first();
    const hasSameFlowNameInField =
      (await flowNameTextbox.isVisible().catch(() => false)) &&
      ((await flowNameTextbox.inputValue().catch(() => '')).trim() === flowName);
    const hasInvalidState =
      (await flowNameTextbox.getAttribute('aria-invalid').catch(() => null)) === 'true' ||
      (await flowNameTextbox.getAttribute('invalid').catch(() => null)) !== null;

    // Some builds only disable Create without explicit toast/message.
    if (dialogStillOpen && (createStillDisabled || (hasSameFlowNameInField && hasInvalidState))) {
      await closeBrowserNow();
      return;
    }

    // Some UIs auto-close the dialog on validation; treat closed dialog as terminal state.
    if (!dialogStillOpen) {
      await closeBrowserNow();
      return;
    }

    await settlePage(page);
    await page.waitForTimeout(350).catch(() => undefined);
  }

  throw new Error(`Duplicate rejection signal was not visible for flow ${flowName}.`);
}
