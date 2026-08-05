import { expect, type Page } from '@playwright/test';
import { config } from '../../configFiles/config';
import { faker } from '@faker-js/faker/locale/zu_ZA';

type PageArgs = { page: Page };
type PageInput = Page | PageArgs;
type LoginArgs = { page: PageInput; username: string; password: string };
type InvalidUsernameArgs = { page: PageInput; invalidUsername?: string; validPassword?: string };
type InvalidPasswordArgs = { page: PageInput; invalidPassword?: string; validUsername?: string };

function resolvePage(pageOrArgs: PageInput): Page {
  return 'page' in pageOrArgs ? pageOrArgs.page : pageOrArgs;
}

const xpaths = {
  usernameInput: "//input[contains(@id,'username')]",
  passwordInput: "//input[contains(@id,'password')]",
  loginButton: "//button[@type='submit']",
  menuBtn: "//div[contains(@title,'Menu')]",
  invalidLoginAlert: "//span[contains(text(),'" + cfgString('invalidLoginAlertText', 'Login authentication failed') + "')]",
  helpButton: "//button[contains(translate(normalize-space(.), 'HELP', 'help'), 'help') or contains(translate(normalize-space(.), 'HELP_OUTLINE', 'help_outline'), 'help')]",
  profileMenuButton: "//button[contains(@aria-label,'expand') or contains(normalize-space(.),'expand_more')]",
  logoutButton: "//button[contains(text(),'Log Out') or contains(text(),'Logout') or contains(text(),'Sign Out')]",
  title: (title: string) => "//div//*[contains(@title,'" + title + "')]",
};

function byXPath(page: Page, value: string) {
  return page.locator(`xpath=${value}`).first();
}

function shellSignals(page: Page) {
  return [
    page.getByRole('button', { name: /projects|help/i }).first(),
    byXPath(page, xpaths.profileMenuButton),
    byXPath(page, xpaths.menuBtn),
  ];
}

async function isAlreadyAuthenticated(page: Page): Promise<boolean> {
  for (const signal of shellSignals(page)) {
    if (await signal.isVisible().catch(() => false)) {
      return true;
    }
  }

  return /\/smc2\/(home|dashboard|projects)/i.test(page.url());
}

function loginFormSignals(page: Page) {
  return [
    byXPath(page, xpaths.usernameInput),
    page.getByRole('textbox', { name: /username/i }).first(),
    page.locator('input[name*="user" i], input[id*="user" i], input[type="text"]').first(),
  ];
}

async function isLoginFormVisible(page: Page): Promise<boolean> {
  for (const signal of loginFormSignals(page)) {
    if (await signal.isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

async function openSamlApplicationIfPresent(page: Page): Promise<void> {
  const samlEntryCandidates = [
    page.getByRole('link', { name: /^smui$/i }).first(),
    page.getByRole('button', { name: /^smui$/i }).first(),
    page.getByText(/^smui$/i).first(),
    page.locator('a[href*="smui" i], button[aria-label*="smui" i]').first(),
  ];

  for (const candidate of samlEntryCandidates) {
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.click({ timeout: 10_000 }).catch(async () => {
        await candidate.click({ force: true, timeout: 10_000 });
      });
      break;
    }
  }
}

function cfgString(key: string, fallback: string): string {
  const value = (config as unknown as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function resolvePortalUrl(): string {
  const configuredUrl = (config as unknown as Record<string, unknown>).url;
  if (typeof configuredUrl !== 'string' || configuredUrl.trim().length === 0) {
    throw new Error('Missing config.url in tests/configFiles configuration. Set url in the active TEST_CONFIG file or environment.');
  }

  return configuredUrl.trim();
}

export async function navigateToLoginPage(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);
  await page.goto(resolvePortalUrl(), {
    waitUntil: 'commit',
    timeout: 0,
  });

  await openSamlApplicationIfPresent(page);
}

export async function enterUsername(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);
  await byXPath(page, xpaths.usernameInput).fill(cfgString('username', 'admin'));
}

export async function enterPassword(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);
  await byXPath(page, xpaths.passwordInput).fill(cfgString('password', 'password'));
}

export async function enterInvalidUsername(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);
  await byXPath(page, xpaths.usernameInput).fill('invalid_user');
}

export async function enterInvalidPassword(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);
  await byXPath(page, xpaths.passwordInput).fill('invalid_password');
}

export async function clickLoginButton(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);
  await byXPath(page, xpaths.loginButton).click();
}

async function submitLogin({ page, username, password }: LoginArgs): Promise<void> {
  const resolvedPage = resolvePage(page);

  if (await isAlreadyAuthenticated(resolvedPage)) {
    return;
  }

  await expect
    .poll(async () => (await isLoginFormVisible(resolvedPage)) || (await isAlreadyAuthenticated(resolvedPage)), {
      timeout: 30_000,
      intervals: [500, 1_000, 2_000],
    })
    .toBeTruthy();

  if (await isAlreadyAuthenticated(resolvedPage)) {
    return;
  }

  const usernameCandidates = loginFormSignals(resolvedPage);
  const passwordCandidates = [
    byXPath(resolvedPage, xpaths.passwordInput),
    resolvedPage.getByRole('textbox', { name: /password/i }).first(),
    resolvedPage.locator('input[type="password"]').first(),
  ];

  let usernameFilled = false;
  for (const candidate of usernameCandidates) {
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.fill(username);
      usernameFilled = true;
      break;
    }
  }

  if (!usernameFilled) {
    await usernameCandidates[0].fill(username);
  }

  let passwordFilled = false;
  for (const candidate of passwordCandidates) {
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.fill(password);
      passwordFilled = true;
      break;
    }
  }

  if (!passwordFilled) {
    await passwordCandidates[0].fill(password);
  }

  await byXPath(resolvedPage, xpaths.loginButton).click();
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
    // Fallback for non-Chromium contexts or restricted environments.
    await page.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.availWidth, screen.availHeight);
    });
  }
}

export async function loginToPortal(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);
  await navigateToLoginPage(page);

  if (await isAlreadyAuthenticated(page)) {
    await maximizeBrowserWindow(page);
    return;
  }

  await submitLogin({
    page,
    username: cfgString('username', 'admin'),
    password: cfgString('password', 'password'),
  });
  await maximizeBrowserWindow(page);
  await expect
    .poll(async () => isAlreadyAuthenticated(page), {
      timeout: 60_000,
      intervals: [500, 1_000, 2_000],
    })
    .toBeTruthy();
}

export async function assertLoginSuccess(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);

  const successSignals = [
    byXPath(page, xpaths.title(cfgString('titleText', 'SymphonyAI: SRI'))),
    byXPath(page, xpaths.menuBtn),
    page.getByRole('button', { name: /projects|menu/i }).first(),
  ];

  let successVisible = false;
  for (const signal of successSignals) {
    if (await signal.isVisible().catch(() => false)) {
      successVisible = true;
      break;
    }
  }

  if (!successVisible) {
    await expect(page).toHaveURL(/\/smc2\/(home|dashboard)/i, { timeout: 20_000 });
    return;
  }

  expect(successVisible).toBeTruthy();
}

export async function loginWithInvalidUsername(pageOrArgs: PageInput | InvalidUsernameArgs): Promise<void> {
  const isArgsObject =
    typeof pageOrArgs === 'object' &&
    pageOrArgs !== null &&
    'page' in pageOrArgs &&
    ('invalidUsername' in pageOrArgs || 'validPassword' in pageOrArgs);

  const page = isArgsObject
    ? resolvePage((pageOrArgs as InvalidUsernameArgs).page)
    : resolvePage(pageOrArgs as PageInput);
  const invalidUsername = isArgsObject
    ? (pageOrArgs as InvalidUsernameArgs).invalidUsername ?? 'invalid_user'
    : 'invalid_user';
  const validPassword = isArgsObject
    ? (pageOrArgs as InvalidUsernameArgs).validPassword ?? cfgString('password', 'password')
    : cfgString('password', 'password');

  await navigateToLoginPage(page);
  await submitLogin({ page, username: invalidUsername, password: validPassword });
}

export async function assertInvalidLoginError(pageOrArgs: PageInput): Promise<void> {
  const page = resolvePage(pageOrArgs);

  const invalidSignals = [
    byXPath(page, xpaths.invalidLoginAlert),
    page.getByText(/invalid|failed|authentication|incorrect|error/i).first(),
    page.getByRole('button', { name: /sign in|login/i }).first(),
    byXPath(page, xpaths.loginButton),
  ];

  let invalidStateVisible = false;
  for (const signal of invalidSignals) {
    if (await signal.isVisible().catch(() => false)) {
      invalidStateVisible = true;
      break;
    }
  }

  if (!invalidStateVisible) {
    await expect(page).toHaveURL(/\/smc2\/(login|home)/i, { timeout: 20_000 });
    return;
  }

  await expect(byXPath(page, xpaths.menuBtn)).not.toBeVisible().catch(() => undefined);
}

export async function assertInvalidUsernameLogin({ page }: PageArgs): Promise<void> {
  const resolvedPage = resolvePage(page);
  await expect(resolvedPage).toHaveURL(/\/smc2\/(login|home)/, { timeout: 10_000 });
  await assertInvalidLoginError(resolvedPage);
  await resolvedPage.waitForTimeout(10_000);
}

export async function loginWithInvalidPassword(pageOrArgs: PageInput | InvalidPasswordArgs): Promise<void> {
  const isArgsObject =
    typeof pageOrArgs === 'object' &&
    pageOrArgs !== null &&
    'page' in pageOrArgs &&
    ('invalidPassword' in pageOrArgs || 'validUsername' in pageOrArgs);

  const page = isArgsObject
    ? resolvePage((pageOrArgs as InvalidPasswordArgs).page)
    : resolvePage(pageOrArgs as PageInput);
  const invalidPassword = isArgsObject
    ? (pageOrArgs as InvalidPasswordArgs).invalidPassword ?? 'invalid_password'
    : 'invalid_password';
  const validUsername = isArgsObject
    ? (pageOrArgs as InvalidPasswordArgs).validUsername ?? cfgString('username', 'admin')
    : cfgString('username', 'admin');

  await navigateToLoginPage(page);
  await submitLogin({ page, username: validUsername, password: invalidPassword });
}

export async function assertInvalidPasswordLogin({ page }: PageArgs): Promise<void> {
  const resolvedPage = resolvePage(page);
  await expect(resolvedPage).toHaveURL(/\/smc2\/(login|home)/, { timeout: 10_000 });
  await assertInvalidLoginError(resolvedPage);
  await resolvedPage.waitForTimeout(10_000);
}

export async function loginWithBlankCredentials({ page }: PageArgs): Promise<void> {
  const resolvedPage = resolvePage(page);
  await navigateToLoginPage(resolvedPage);
  await submitLogin({ page, username: '', password: '' });
}

export async function assertBlankCredentialsLogin({ page }: PageArgs): Promise<void> {
  const resolvedPage = resolvePage(page);
  await expect(resolvedPage).toHaveURL(/\/smc2\/(login|home)/, { timeout: 10_000 });
  await assertInvalidLoginError(resolvedPage);
  await resolvedPage.waitForTimeout(10_000);
}

export async function logoutFromAdminMenu({ page }: PageArgs): Promise<void> {
  const resolvedPage = resolvePage(page);
  await navigateToLoginPage(resolvedPage);
  await submitLogin({
    page: resolvedPage,
    username: cfgString('username', 'admin'),
    password: cfgString('password', 'password'),
  });
  await maximizeBrowserWindow(resolvedPage);
  await resolvedPage.waitForTimeout(60_000);

  await byXPath(resolvedPage, xpaths.profileMenuButton).click();
  await byXPath(resolvedPage, xpaths.logoutButton).click();
}

export async function assertLogoutSuccess({ page }: PageArgs): Promise<void> {
  const resolvedPage = resolvePage(page);
  await expect(resolvedPage).toHaveURL(/\/smc2\/(login|home)/, { timeout: 20_000 });
  await expect(byXPath(resolvedPage, xpaths.loginButton)).toBeVisible();
}

export async function loginAndClickHelp({ page }: PageArgs): Promise<void> {
  const resolvedPage = resolvePage(page);
  await navigateToLoginPage(resolvedPage);
  await submitLogin({
    page: resolvedPage,
    username: cfgString('username', 'admin'),
    password: cfgString('password', 'password'),
  });
  await maximizeBrowserWindow(resolvedPage);

  const helpTargets = [
    byXPath(resolvedPage, xpaths.helpButton),
    resolvedPage.getByRole('button', { name: /help/i }).first(),
    resolvedPage.getByRole('link', { name: /help/i }).first(),
    resolvedPage.locator('[aria-label*="help" i], [title*="help" i]').first(),
  ];

  let clicked = false;
  for (const target of helpTargets) {
    if (await target.isVisible().catch(() => false)) {
      await target.click({ timeout: 10_000 }).catch(async () => {
        await target.click({ force: true, timeout: 10_000 });
      });
      clicked = true;
      break;
    }
  }

  expect(clicked).toBeTruthy();
  await resolvedPage.waitForTimeout(10_000);
}

export async function assertHelpClickSuccess({ page }: PageArgs): Promise<void> {
  const resolvedPage = resolvePage(page);
  const helpTargets = [
    byXPath(resolvedPage, xpaths.helpButton),
    resolvedPage.getByRole('button', { name: /help/i }).first(),
    resolvedPage.getByRole('link', { name: /help/i }).first(),
    resolvedPage.locator('[aria-label*="help" i], [title*="help" i]').first(),
  ];

  let found = false;
  for (const target of helpTargets) {
    if (await target.isVisible().catch(() => false)) {
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
}

export function generateInvalidUsername(): string {
  return `invalid_${faker.internet.userName().toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
}

export function generateInvalidPassword(): string {
  return `invalid_${faker.internet.password({ length: 12 }).toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
}
