import { expect, test } from '@playwright/test';
import { openScene, stepToEnd } from './helpers';

/** Values from PLAN.md 11.2 (chapter 3). The page renders them from the engine. */
test.describe('chapter 3: IEEE 754', () => {
  test('3.1 reads 0x40D00000: Exponent 129, value 6.5', async ({ page }) => {
    await openScene(page, 'layout');
    await expect(page.getByTestId('layout-hex')).toHaveText('0x40D00000');
    await stepToEnd(page, 'layout-player');
    await expect(page.getByTestId('layout-exp')).toHaveText('129');
    await expect(page.getByTestId('layout-value')).toHaveText('6.5');
    await expect(page.getByTestId('layout-word-sig')).toHaveAttribute('data-colored', '1');
  });

  test('3.1 takes hex only and refuses bits that are not a normal number', async ({ page }) => {
    await openScene(page, 'layout');
    await page.getByTestId('layout-input').fill('0xC0A00000');
    await stepToEnd(page, 'layout-player');
    await expect(page.getByTestId('layout-value')).toHaveText('−5');
    await page.getByTestId('layout-input').fill('0');
    await expect(page.locator('#layout [role=alert]')).toBeVisible();
    await expect(page.getByTestId('layout-value')).toHaveText('−5');
  });

  test('3.3 an exponent bit halves the value and moves the window', async ({ page }) => {
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

  test('3.4 exponent zones load the slide examples', async ({ page }) => {
    await openScene(page, 'special');
    await expect(page.getByTestId('special-range')).toContainText('3.4028235e+38');
    await page.getByTestId('special-zone255').click();
    await expect(page.getByTestId('special-caption')).toContainText('255');
    await expect(page.getByTestId('special-value')).toHaveText('+∞');
    await page.getByTestId('special-chip').last().click();
    await expect(page.getByTestId('special-value')).toHaveText('NaN');
    await page.getByTestId('special-zone0').click();
    await page.getByTestId('special-chip').nth(2).click();
    await expect(page.getByTestId('special-value')).toContainText('1.40129846');
    await expect(page.getByTestId('double-compare')).toContainText('1023');
  });
});
