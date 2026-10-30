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

test('lab: binary64 and binary16 formats, kept in the URL', async ({ page }) => {
  await page.goto('/lab');
  await page.getByTestId('example-A2').click();
  await page.getByTestId('lab-fmt-b64').click();
  await expect(page).toHaveURL(/fmt=b64/);
  await expect(page.getByTestId('lab-format-note')).toContainText('binary64');
  // the famous 0.1 + 0.2 = 0.30000000000000004 in double precision
  await expect(page.getByTestId('sim').getByTestId('result-value')).toHaveText(
    '0.30000000000000004',
  );
  await expect(page.getByTestId('sim').getByTestId('result-hex')).toHaveText('0x3FD3333333333334');
  await page.getByTestId('lab-fmt-b16').click();
  await expect(page.getByTestId('sim').getByTestId('result-hex')).toHaveText(/^0x[0-9A-F]{4}$/);
  // reopening the link keeps the format
  await page.goto('/lab?fmt=b16&tab=conv&mode=decode&hex=2E66');
  await expect(page.getByTestId('lab-fmt-b16')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('conv-decoded')).toContainText('0.0999755859375');
});

test('presentation mode: full screen player, keys anywhere, Esc leaves', async ({
  page,
  isMobile,
}) => {
  await page.goto('/learn/mul-div#simulator');
  const player = page.getByTestId('sim-player');
  await page.getByTestId('sim-player-present').click();
  await expect(player).toHaveAttribute('data-presenting', '1');
  const size = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  expect(parseFloat(size)).toBeGreaterThanOrEqual(18);
  // keys work even when focus moves to the page body
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('sim-player-counter')).toHaveText(/ขั้นที่ 2\//);
  if (!isMobile) {
    await page.keyboard.press('Escape');
  } else {
    await page.getByTestId('sim-player-present').click();
  }
  await expect(player).not.toHaveAttribute('data-presenting', '1');
});
