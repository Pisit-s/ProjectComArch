import { expect, test } from '@playwright/test';
import { openScene, stepToEnd } from './helpers';

/** Values from PLAN.md 11.2 (chapter 3). The page renders them from the engine. */
test.describe('chapter 3: IEEE 754', () => {
  test('3.1 6.5 → Exponent 129, 0x40D00000, value 6.5', async ({ page }) => {
    await openScene(page, 'layout');
    await expect(page.getByTestId('layout-hex')).toHaveText('0x40D00000');
    await stepToEnd(page, 'layout-player');
    await expect(page.getByTestId('layout-exp')).toHaveText('129');
    await expect(page.getByTestId('layout-value')).toHaveText('6.5');
    await expect(page.getByTestId('layout-word-sig')).toHaveAttribute('data-colored', '1');
  });

  test('3.1 accepts hex and refuses numbers that are not normalized', async ({ page }) => {
    await openScene(page, 'layout');
    await page.getByTestId('layout-input').fill('0xC0A00000');
    await stepToEnd(page, 'layout-player');
    await expect(page.getByTestId('layout-value')).toHaveText('−5');
    await page.getByTestId('layout-input').fill('0');
    await expect(page.locator('#layout [role=alert]')).toBeVisible();
    await expect(page.getByTestId('layout-value')).toHaveText('−5');
  });

  test('3.2 an exponent bit halves the value and moves the window', async ({ page }) => {
    await openScene(page, 'bit-play');
    await expect(page.getByTestId('bitplay-value')).toHaveText('6.5');
    await expect(page.getByTestId('bitplay-caption')).toContainText('[4, 8)');
    await page.getByTestId('bitplay-reg-bit-8').click();
    await expect(page.getByTestId('bitplay-value')).toHaveText('3.25');
    await expect(page.getByTestId('bitplay-window')).toHaveAttribute('data-e', '1');
    await expect(page.getByTestId('bitplay-caption')).toContainText('[2, 4)');
    await page.getByTestId('bitplay-reg-bit-9').click();
    await expect(page.getByTestId('bitplay-value')).toHaveText('2.25');
    await page.getByTestId('bitplay-chip').first().click();
    await expect(page.getByTestId('bitplay-hex')).toHaveText('0x3F800000');
  });
});
