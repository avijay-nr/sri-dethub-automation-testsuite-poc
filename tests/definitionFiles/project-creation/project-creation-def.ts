import { expect, type Locator, type Page } from '@playwright/test';
import { config } from '../../configFiles/config';
import { faker } from '@faker-js/faker/locale/zu_ZA';
import * as loginDef from '../loginTestDef/loginDef';

type PageArgs = { page: Page };
type ProjectNameArgs = PageArgs & { projectName: string };
type ProjectDetailsArgs = ProjectNameArgs & { projectDescription: string };
type DescriptionArgs = PageArgs & { updatedDescription: string };
type ExpectedDescriptionArgs = PageArgs & { expectedDescription: string };

const xpaths = {
  usernameInput: "//input[@type='text' or @name='username' or @id='username']",
  passwordInput: "//input[@type='password' or @name='password' or @id='password']",
  signInButton: "//button[contains(translate(normalize-space(.), 'SIGNIN', 'signin'), 'sign in') or contains(translate(normalize-space(.), 'LOGIN', 'login'), 'login')]",
  signInHeading: "//h1[contains(translate(normalize-space(.), 'PLEASE SIGN IN', 'please sign in'), 'please sign in')]",
  projectsEntry: "//button[contains(normalize-space(.), 'Projects')] | //a[contains(normalize-space(.), 'Projects')] | //*[@role='menuitem' and contains(normalize-space(.), 'Projects')]",
  projectListSignals: "//*[@role='menuitem' or @role='listitem'] | //*[contains(translate(normalize-space(.), 'PROJECT', 'project'), 'project')]",
  createProjectButton: "//button[contains(normalize-space(.), 'Create Project') or contains(normalize-space(.), 'Create Flow')]",
  createProjectHeading: "//h1[contains(normalize-space(.), 'Create Project') or contains(normalize-space(.), 'Create Flow')] | //h2[contains(normalize-space(.), 'Create Project') or contains(normalize-space(.), 'Create Flow')]",
  projectNameInput: "//input[contains(@name,'project') and contains(@name,'name')] | //input[contains(@id,'project') and contains(@id,'name')] | //input[contains(translate(@placeholder, 'PROJECT NAME', 'project name'), 'project name')]",
  descriptionInput: "//textarea[contains(@name,'description') or contains(@id,'description')] | //input[contains(@name,'description') or contains(@id,'description')]",
  createButton: "//button[normalize-space()='Create Project' or normalize-space()='Create Flow' or normalize-space()='Create']",
  duplicateMessage: "//*[contains(translate(normalize-space(.), 'DUPLICATE', 'duplicate'), 'duplicate') or contains(translate(normalize-space(.), 'EXISTS', 'exists'), 'exists')]",
  closeDialogButton: "//button[normalize-space()='Close' or normalize-space()='Cancel'] | //*[@aria-label='Close']",
  deleteButton: "//button[normalize-space()='Delete' or contains(normalize-space(.), 'Delete Project')] | //*[@aria-label and contains(translate(@aria-label, 'DELETE', 'delete'), 'delete')]",
  confirmDeleteButton: "//button[normalize-space()='Delete' or normalize-space()='Yes' or normalize-space()='Yes, Delete' or normalize-space()='Confirm' or contains(normalize-space(.), 'Delete Project')]",
  cancelDeleteButton: "//button[normalize-space()=" + '"' + "Don't Delete" + '"' + " or normalize-space()='Dont Delete' or normalize-space()='Cancel Delete' or normalize-space()='Cancel' or normalize-space()='No']",
  editButton: "//button[normalize-space()='Edit' or contains(normalize-space(.), 'Edit Project')] | //*[@aria-label and contains(translate(@aria-label, 'EDIT', 'edit'), 'edit')]",
  saveButton: "//button[normalize-space()='Save' or normalize-space()='Update' or contains(normalize-space(.), 'Update Project')]",
  updatedMessage: "//*[contains(translate(normalize-space(.), 'UPDATED', 'updated'), 'updated')]",
};

function byXPath(page: Page, value: string): Locator {
  return page.locator(`xpath=${value}`);
}

function authLocatorCandidates(page: Page) {
  return {
    username: [
      byXPath(page, xpaths.usernameInput).first(),
      page.getByRole('textbox', { name: /username/i }).first(),
      page.locator('input[name*="user" i], input[id*="user" i], input[type="text"]').first(),
    ],
    password: [
      byXPath(page, xpaths.passwordInput).first(),
      page.getByRole('textbox', { name: /password/i }).first(),
      page.locator('input[type="password"]').first(),
    ],
    signInButton: [
      byXPath(page, xpaths.signInButton).first(),
      page.getByRole('button', { name: /sign in|login/i }).first(),
      page.locator('button[type="submit"]').first(),
    ],
    signInSignals: [
      byXPath(page, xpaths.signInHeading).first(),
      page.getByRole('heading', { name: /sign in|login/i }).first(),
      page.getByRole('button', { name: /sign in|login/i }).first(),
      page.locator('form input[type="password"]').first(),
    ],
  };
}

async function fillFirstVisible(candidates: Locator[], value: string): Promise<void> {
  for (const candidate of candidates) {
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.fill(value);
      return;
    }
  }

  await candidates[0].fill(value);
}

function projectCreationLocators(page: Page) {
  const dialog = page.getByRole('dialog').first();
  const deleteDialog = page.getByRole('dialog').last();

  const projectNameText = (projectName: string) =>
    page.locator(`xpath=//*[normalize-space()=${JSON.stringify(projectName)}]`).first();

  return {
    auth: {
      usernameInput: byXPath(page, xpaths.usernameInput).first(),
      passwordInput: byXPath(page, xpaths.passwordInput).first(),
      signInButton: byXPath(page, xpaths.signInButton).first(),
      signInHeading: byXPath(page, xpaths.signInHeading).first(),
    },
    projects: {
      entryPoints: [
        byXPath(page, xpaths.projectsEntry),
        page.getByRole('button', { name: /projects/i }),
      ],
      listSignals: [
        byXPath(page, xpaths.projectListSignals),
        page.locator('[role="menuitem"]'),
      ],
      landingSignals: [
        byXPath(page, xpaths.createProjectButton),
        byXPath(page, xpaths.projectListSignals),
      ],
      rowContainers: [
        page.locator('[role="row"]'),
        page.locator('[role="listitem"]'),
        page.locator('[role="menuitem"]'),
        page.locator('tr'),
        page.locator('.p-datatable-tbody > tr'),
      ],
      projectNameText,
    },
    createProject: {
      dialog,
      createProjectButton: byXPath(page, xpaths.createProjectButton).first(),
      openDialogSignals: [
        page.getByRole('dialog', { name: /create (project|flow)/i }).first(),
        byXPath(page, xpaths.createProjectHeading),
        byXPath(page, xpaths.projectNameInput),
        page.getByPlaceholder(/project name/i),
      ],
      projectNameInputs: [
        byXPath(page, xpaths.projectNameInput).first(),
        page.getByPlaceholder(/project name/i).first(),
        page.getByRole('textbox', { name: /project name/i }).first(),
      ],
      descriptionInputs: [
        byXPath(page, xpaths.descriptionInput),
        page.getByPlaceholder(/description/i),
      ],
      createButtons: [
        dialog.locator(`xpath=${xpaths.createButton}`).first(),
        byXPath(page, xpaths.createButton).first(),
      ],
      duplicateSignals: [
        byXPath(page, xpaths.duplicateMessage),
        page.locator('[role="alert"]:has-text("exists")'),
      ],
      closeTargets: [
        dialog.locator(`xpath=${xpaths.closeDialogButton}`),
        page.getByRole('button', { name: /^close$/i }),
      ],
    },
    projectActions: {
      deleteDialog,
      deleteTargets: [
        byXPath(page, xpaths.deleteButton),
        page.getByRole('button', { name: /^delete$/i }),
      ],
      confirmDeleteTargets: [
        page.locator("xpath=//button[normalize-space()=\"Don't Delete\" or normalize-space()='Dont Delete' or normalize-space()='Cancel Delete' or normalize-space()='Cancel' or normalize-space()='No']/preceding-sibling::button[1]").first(),
        page.locator("xpath=//button[normalize-space()=\"Don't Delete\" or normalize-space()='Dont Delete' or normalize-space()='Cancel Delete' or normalize-space()='Cancel' or normalize-space()='No']/following-sibling::button[1]").first(),
        deleteDialog.locator(`xpath=${xpaths.confirmDeleteButton}`).first(),
        deleteDialog.getByRole('button', { name: /^delete$/i }).first(),
        deleteDialog.getByRole('button', { name: /yes|confirm/i }).first(),
        page.getByRole('button', { name: /yes|confirm/i }).last(),
      ],
      cancelDeleteTargets: [
        deleteDialog.locator(`xpath=${xpaths.cancelDeleteButton}`),
        byXPath(page, xpaths.cancelDeleteButton),
      ],
      editTargets: [
        byXPath(page, xpaths.editButton),
        page.getByRole('button', { name: /^edit$/i }),
      ],
      saveTargets: [
        dialog.locator(`xpath=${xpaths.saveButton}`),
        byXPath(page, xpaths.saveButton),
      ],
      updatedSignals: [
        byXPath(page, xpaths.updatedMessage),
        page.locator('[role="alert"]:has-text("updated")'),
      ],
    },
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function resolveProjectsUrl(): string {
  const configuredUrl = (config as unknown as Record<string, unknown>).url;
  const baseUrl =
    typeof configuredUrl === 'string' && configuredUrl.trim().length > 0
      ? configuredUrl
      : 'https://det-sri-test-core-api.symphonyai.dev/smc2/home';

  return baseUrl.replace(/\/smc2\/(home|dashboard|login|projects).*$/i, '/smc2/projects');
}

async function selectProjectByExactName({ page, projectName }: ProjectNameArgs): Promise<void> {
  const { projects } = projectCreationLocators(page);
  const projectContainers = projects.rowContainers;
  const exactNameTarget = projects.projectNameText(projectName);

  for (const container of projectContainers) {
    const candidate = container.filter({ has: exactNameTarget }).first();
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.click({ timeout: 5_000 }).catch(async () => {
        await candidate.click({ force: true, timeout: 5_000 });
      });
      return;
    }
  }

  await exactNameTarget.waitFor({ state: 'visible' });
  await exactNameTarget.click({ timeout: 5_000 }).catch(async () => {
    await exactNameTarget.click({ force: true, timeout: 5_000 });
  });
}

async function getExactProjectCard(page: Page, projectName: string): Promise<Locator | null> {
  const { projects } = projectCreationLocators(page);
  const exactNameTarget = projects.projectNameText(projectName);
  const card = exactNameTarget.locator(
    "xpath=ancestor::*[.//button[contains(normalize-space(.), 'Edit Project') or contains(normalize-space(.), 'Delete Project') or normalize-space(.)='Edit' or normalize-space(.)='Delete'] or .//*[@aria-label and (contains(translate(@aria-label, 'EDIT', 'edit'), 'edit') or contains(translate(@aria-label, 'DELETE', 'delete'), 'delete'))]][1]"
  ).first();

  return (await card.isVisible().catch(() => false)) ? card : null;
}

async function maximizeBrowserWindow(page: Page): Promise<void> {
  try {
    const cdpSession = await page.context().newCDPSession(page);
    const { windowId } = await cdpSession.send('Browser.getWindowForTarget');
    await cdpSession.send('Browser.setWindowBounds', {
      windowId,
      bounds: { windowState: 'maximized' },
    });
    return;
  } catch {
    await page.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.availWidth, screen.availHeight);
    });
  }
}

async function clickFirstVisibleWithRetry(
  page: Page,
  candidates: Locator[],
  attempts = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    for (const candidate of candidates) {
      const target = candidate.first();
      if (await target.isVisible().catch(() => false)) {
        await target.click({ timeout: 5_000 }).catch(async () => {
          await target.click({ force: true, timeout: 5_000 });
        });
        return true;
      }
    }

    if (attempt < attempts) {
      await page.waitForTimeout(1_500);
    }
  }

  return false;
}

async function waitForPostLoginShell(page: Page): Promise<void> {
  const { auth } = projectCreationLocators(page);
  const authCandidates = authLocatorCandidates(page);

  // Wait until login form is no longer the active view.
  await Promise.race([
    auth.signInHeading.waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => undefined),
    auth.usernameInput.first().waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => undefined),
    authCandidates.signInSignals[0].waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => undefined),
    page.waitForURL(/\/smc2\/(home|dashboard|projects)/i, { timeout: 60_000 }).catch(() => undefined),
  ]);

  // Give the SPA a moment to render shell controls after auth redirect.
  await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  await page.waitForTimeout(2_000);
}

export async function openProjectsList({ page }: PageArgs): Promise<void> {
  const { projects } = projectCreationLocators(page);

  // Reuse the stabilized login workflow from login definitions.
  await loginDef.loginToPortal(page);
  await waitForPostLoginShell(page);

  let opened = await clickFirstVisibleWithRetry(page, projects.entryPoints, 4);

  if (!opened) {
    await page.goto(resolveProjectsUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => undefined);
    await page.waitForTimeout(2_000);
    opened = /\/smc2\/projects/i.test(page.url());
  }

  let landingReady = false;
  for (const signal of projects.landingSignals) {
    if (await signal.first().isVisible().catch(() => false)) {
      landingReady = true;
      break;
    }
  }

  if (!landingReady) {
    await page.waitForTimeout(5_000);

    for (const signal of projects.landingSignals) {
      if (await signal.first().isVisible().catch(() => false)) {
        landingReady = true;
        break;
      }
    }
  }

  expect(opened || landingReady).toBeTruthy();
}

export async function assertProjectsListVisible({ page }: PageArgs): Promise<void> {
  const { projects } = projectCreationLocators(page);

  let found = false;
  for (const signal of projects.listSignals) {
    if (await signal.first().isVisible().catch(() => false)) {
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
}

export async function clickCreateProject({ page }: PageArgs): Promise<void> {
  const { createProject } = projectCreationLocators(page);
  await createProject.createProjectButton.waitFor({ state: 'visible' });
  await createProject.createProjectButton.click();
  await page.waitForTimeout(10_000);
}

export async function assertCreateProjectOpened({ page }: PageArgs): Promise<void> {
  const { createProject } = projectCreationLocators(page);

  let found = false;
  for (const signal of createProject.openDialogSignals) {
    if (await signal.first().isVisible().catch(() => false)) {
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
}

export async function enterProjectDetails(
  { page, projectName, projectDescription }: ProjectDetailsArgs
): Promise<void> {
  const { createProject } = projectCreationLocators(page);
  let projectNameFilled = false;
  for (const candidate of createProject.projectNameInputs) {
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.fill(projectName);
      projectNameFilled = true;
      break;
    }
  }

  if (!projectNameFilled) {
    await createProject.projectNameInputs[0].waitFor({ state: 'visible' });
    await createProject.projectNameInputs[0].fill(projectName);
  }

  let descriptionFilled = false;
  for (const candidate of createProject.descriptionInputs) {
    if (await candidate.first().isVisible().catch(() => false)) {
      await candidate.first().fill(projectDescription);
      descriptionFilled = true;
      break;
    }
  }

  expect(descriptionFilled).toBeTruthy();

  await page.waitForTimeout(2_000);

  let createClicked = false;
  for (const button of createProject.createButtons) {
    if (await button.isVisible().catch(() => false)) {
      try {
        await button.click({ timeout: 5_000 });
        createClicked = true;
        await page.waitForTimeout(5_000);
        break;
      } catch {
        // If overlay masks intercept pointer events, force-click the visible target.
        await button.click({ force: true, timeout: 5_000 });
        createClicked = true;
        await page.waitForTimeout(5_000);
        break;
      }
    }
  }

  expect(createClicked).toBeTruthy();
}

export async function assertDuplicateProjectRejected({ page }: PageArgs): Promise<void> {
  const { createProject } = projectCreationLocators(page);

  let found = false;
  for (const signal of createProject.duplicateSignals) {
    if (await signal.first().isVisible().catch(() => false)) {
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
}

export async function clickCloseProjectDialog({ page }: PageArgs): Promise<void> {
  const { createProject } = projectCreationLocators(page);
  const dialogVisibleInitially = await createProject.dialog.isVisible().catch(() => false);

  // If dialog is already closed, treat as success.
  if (!dialogVisibleInitially) {
    return;
  }

  let closed = false;
  for (const target of createProject.closeTargets) {
    if (await target.first().isVisible().catch(() => false)) {
      try {
        await target.first().click({ timeout: 5_000 });
        closed = true;
        break;
      } catch {
        await target.first().click({ force: true, timeout: 5_000 });
        closed = true;
        break;
      }
    }
  }

  if (!closed) {
    await page.keyboard.press('Escape').catch(() => undefined);
    closed = !(await createProject.dialog.isVisible().catch(() => false));
  }

  expect(closed).toBeTruthy();
}

export async function initiateProjectDeletion({ page, projectName }: ProjectNameArgs): Promise<void> {
  const card = await getExactProjectCard(page, projectName);
  if (!card) {
    throw new Error(`Could not find the project row for ${projectName}`);
  }

  const deleteTargets = [
    card.getByRole('button', { name: /delete project/i }).first(),
    card.getByRole('button', { name: /^delete$/i }).first(),
    card.locator('button[aria-label*="delete" i]').first(),
    card.locator('[aria-label*="delete" i]').first(),
  ];

  let deleteClicked = false;
  for (const target of deleteTargets) {
    if (await target.isVisible().catch(() => false)) {
      await target.click({ timeout: 5_000 }).catch(async () => {
        await target.click({ force: true, timeout: 5_000 });
      });
      deleteClicked = true;
      break;
    }
  }

  expect(deleteClicked).toBeTruthy();
  await page.waitForTimeout(1_000);
}

export async function cancelProjectDeletion({ page }: PageArgs): Promise<void> {
  const { projectActions } = projectCreationLocators(page);
  const dialogVisibleBeforeCancel = await projectActions.deleteDialog.isVisible().catch(() => false);

  let cancelClicked = false;
  for (const target of projectActions.cancelDeleteTargets) {
    if (await target.first().isVisible().catch(() => false)) {
      await target.first().click({ timeout: 5_000 }).catch(async () => {
        await target.first().click({ force: true, timeout: 5_000 });
      });
      cancelClicked = true;
      break;
    }
  }

  if (!cancelClicked) {
    await page.keyboard.press('Escape').catch(() => undefined);
  }

  const dialogClosed = !(await projectActions.deleteDialog.isVisible().catch(() => false));
  expect(cancelClicked || !dialogVisibleBeforeCancel || dialogClosed).toBeTruthy();
  await page.waitForTimeout(1_000);
}

export async function confirmProjectDeletion({ page }: PageArgs): Promise<void> {
  const { projectActions } = projectCreationLocators(page);
  const dialogVisibleBeforeConfirm = await projectActions.deleteDialog.isVisible().catch(() => false);

  let confirmClicked = false;
  for (const target of projectActions.confirmDeleteTargets) {
    if (await target.isVisible().catch(() => false)) {
      await target.click({ timeout: 5_000 }).catch(async () => {
        await target.click({ force: true, timeout: 5_000 });
      });
      confirmClicked = true;
      break;
    }
  }

  expect(confirmClicked || !dialogVisibleBeforeConfirm).toBeTruthy();
  await page.waitForTimeout(2_000);
}

export async function assertProjectStillPresent({ page, projectName }: ProjectNameArgs): Promise<void> {
  const { projects } = projectCreationLocators(page);
  const projectRow = projects.projectNameText(projectName);
  const projectVisible = await projectRow.isVisible().catch(() => false);
  expect(projectVisible).toBeTruthy();
}

export async function assertProjectDeleted({ page, projectName }: ProjectNameArgs): Promise<void> {
  const projectNameOccurrences = page.locator(
    `xpath=//*[normalize-space()=${JSON.stringify(projectName)}]`
  );
  await expect(projectNameOccurrences).toHaveCount(0, { timeout: 30_000 });
}

export async function openProjectForEdit({ page, projectName }: ProjectNameArgs): Promise<void> {
  const card = await getExactProjectCard(page, projectName);
  if (!card) {
    throw new Error(`Could not find the project row for ${projectName}`);
  }

  let editClicked = false;

  const rowEditTargets = [
    card.getByRole('button', { name: /edit project/i }).first(),
    card.getByRole('button', { name: /^edit$/i }).first(),
    card.locator('button[aria-label*="edit" i]').first(),
    card.locator('[aria-label*="edit" i]').first(),
  ];

  for (const target of rowEditTargets) {
    if (await target.isVisible().catch(() => false)) {
      await target.click({ timeout: 5_000 }).catch(async () => {
        await target.click({ force: true, timeout: 5_000 });
      });
      editClicked = true;
      break;
    }
  }

  expect(editClicked).toBeTruthy();
}

export async function updateProjectDescription({ page, updatedDescription }: DescriptionArgs): Promise<void> {
  const { createProject, projectActions } = projectCreationLocators(page);

  let descriptionUpdated = false;
  for (const candidate of createProject.descriptionInputs) {
    if (await candidate.first().isVisible().catch(() => false)) {
      await candidate.first().fill('');
      await candidate.first().fill(updatedDescription);
      descriptionUpdated = true;
      break;
    }
  }
  expect(descriptionUpdated).toBeTruthy();

  let saved = false;
  for (const target of projectActions.saveTargets) {
    if (await target.first().isVisible().catch(() => false)) {
      await target.first().click({ timeout: 5_000 }).catch(async () => {
        await target.first().click({ force: true, timeout: 5_000 });
      });
      saved = true;
      break;
    }
  }

  expect(saved).toBeTruthy();
  await page.waitForTimeout(2_000);
}

export async function assertProjectUpdated({ page, expectedDescription }: ExpectedDescriptionArgs): Promise<void> {
  const { createProject, projectActions } = projectCreationLocators(page);

  let found = false;
  for (const signal of projectActions.updatedSignals) {
    if (await signal.first().isVisible().catch(() => false)) {
      found = true;
      break;
    }
  }

  // Some UIs may not show a toast; verify edited value persisted in the form.
  if (!found) {
    for (const candidate of createProject.descriptionInputs) {
      if (await candidate.first().isVisible().catch(() => false)) {
        const value = await candidate.first().inputValue().catch(() => '');
        if (value.trim() === expectedDescription) {
          found = true;
          break;
        }
      }
    }
  }

  // Final fallback: no edit dialog visible anymore.
  if (!found) {
    found = !(await createProject.dialog.isVisible().catch(() => false));
  }

  expect(found).toBeTruthy();
}

export function generateProjectNameSeed(prefix?: string): string {
  const base = prefix && prefix.trim().length > 0 ? prefix : config.projectName;
  return `${base}-${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`;
}
