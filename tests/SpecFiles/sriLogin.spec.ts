import { test } from '@playwright/test';
import * as loginDef from '../definitionFiles/loginTest/logindef';

test('Login to SRI portal @regression @smoke @login @login_TC001', async ({ page }) => {
  await test.step('Login to SRI portal', async () => {
    await loginDef.loginToPortal(page);
  });
  await test.step('Assert login success', async () => {
    await loginDef.assertLoginSuccess(page);
  });
});

test('Verify invalid login @regression @login @login_TC002', async ({ page }) => {
  await test.step('Login with invalid username', async () => {
    await loginDef.loginWithInvalidUsername(page);
  });
  await test.step('Assert invalid username login validation', async () => {
    await loginDef.assertInvalidLoginError(page);
  });
  await test.step('Login with invalid password', async () => {
    await loginDef.loginWithInvalidPassword(page);
  });
  await test.step('Assert invalid password login validation', async () => {
    await loginDef.assertInvalidLoginError(page);
  });
});