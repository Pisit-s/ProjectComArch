import { expect, test } from '@playwright/test';

test('lab: a shared URL restores the same state and step', async ({ page }) => {
  await page.goto('/lab?tab=calc&op=mul&a=0.1&b=3&step=round');
  await expect(page.getByTestId('sim-a')).toHaveValue('0.1');
  await expect(page.getByTestId('sim-b')).toHaveValue('3');
  await expect(page.getByTestId('sim-player')).toHaveAttribute('data-step', 'round');
  await expect(page.getByTestId('sim').getByTestId('result-hex')).toHaveText('0x3E99999A');
});

test('lab: the copied link reopens the same page', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'clipboard permissions are Chromium only');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/lab');
  await page.getByTestId('example-D3').click();
  await page.getByTestId('sim-player-flow').locator('[data-flow="significand"]').click();
  await page.getByTestId('copy-link').click();
  await expect(page.getByTestId('copy-link')).toContainText('คัดลอกแล้ว');
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(url).toContain('op=div');
  expect(url).toContain('step=sig-div');
  const other = await context.newPage();
  await other.goto(url);
  await expect(other.getByTestId('sim-a')).toHaveValue('1');
  await expect(other.getByTestId('sim-b')).toHaveValue('3');
  await expect(other.getByTestId('sim-player')).toHaveAttribute('data-step', 'sig-div');
});

test('lab: converter state in the URL and bad values fall back', async ({ page }) => {
  await page.goto('/lab?tab=conv&mode=decode&hex=40B80000');
  await expect(page.getByTestId('conv-decoded')).toHaveText('5.75');
  await page.getByTestId('conv-tab-encode').click();
  await page.getByTestId('conv-input').fill('0.1');
  await expect(page).toHaveURL(/mode=encode&x=0.1/);
  await page.goto('/lab?tab=calc&op=pow&a=1,5');
  await expect(page.getByTestId('lab-invalid')).toBeVisible();
  await expect(page.getByTestId('sim-a')).toHaveValue('6.5');
});

test('404 page', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByTestId('not-found')).toBeVisible();
});
