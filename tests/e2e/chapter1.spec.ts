import { expect, test } from '@playwright/test';
import { openScene, stepTo, stepToEnd } from './helpers';

/** Values from PLAN.md 11.2 (chapter 1). The page renders them from src/lib/int. */
test.describe('chapter 1: binary add and subtract', () => {
  test('1.1 7 + 6 in 8 bits = 00001101 = 13', async ({ page }) => {
    await openScene(page, 'int-add');
    await expect(page.getByTestId('int-add-player-poster')).toBeVisible();
    await stepTo(page, 'int-add-player', 'col-1');
    await expect(page.getByTestId('int-add-arc')).toBeVisible();
    await stepToEnd(page, 'int-add-player');
    await expect(page.getByTestId('int-add-sum')).toHaveText('00001101');
    await expect(page.getByTestId('int-add-dec')).toHaveText('= 13');
    await expect(page.getByTestId('int-add-player-caption')).toContainText('00001101₂ = 13');
  });

  test('1.1 typed input and the 4-bit carry out', async ({ page }) => {
    await openScene(page, 'int-add');
    await page.getByTestId('int-add-w4').click();
    await page.getByTestId('int-add-a').fill('9');
    await page.getByTestId('int-add-b').fill('8');
    await stepToEnd(page, 'int-add-player');
    await expect(page.getByTestId('int-add-sum')).toHaveText('0001');
    await expect(page.getByTestId('int-add-carry-out')).toHaveText('1');
    await page.getByTestId('int-add-a').fill('16');
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('1.2 7 − 6 on the ALU = 0001', async ({ page }) => {
    await openScene(page, 'int-sub');
    await stepTo(page, 'int-sub-player', 'invert');
    await expect(page.getByTestId('int-sub-b')).toHaveText('1001');
    await expect(page.getByTestId('mini-alu-binvert')).toHaveText('1');
    await stepTo(page, 'int-sub-player', 'carry-in');
    await expect(page.getByTestId('mini-alu-carryin')).toHaveText('1');
    await stepToEnd(page, 'int-sub-player');
    await expect(page.getByTestId('int-sub-result')).toHaveText('0001');
    await expect(page.getByTestId('int-sub-dec')).toHaveText('= 1');
  });

  test('1.3 4 + 5 = 1001 = −7 with the overflow label; 3 + (−2) is fine', async ({ page }) => {
    await openScene(page, 'overflow');
    await page.getByTestId('overflow-chip').filter({ hasText: '4 + 5' }).click();
    await stepToEnd(page, 'overflow-player');
    await expect(page.getByTestId('wheel-status')).toHaveAttribute('data-status', 'overflow');
    await expect(page.getByTestId('wheel-status')).toContainText('overflow');
    await expect(page.getByTestId('wheel-result')).toHaveText('1001 = −7');

    await page.getByTestId('overflow-chip').nth(1).click();
    await stepToEnd(page, 'overflow-player');
    await expect(page.getByTestId('wheel-status')).toHaveAttribute('data-status', 'ok');
    await expect(page.getByTestId('wheel-result')).toHaveText('0001 = 1');
  });

  test('1.4 104 shifted right 3 = 13; 13 shifted 1 drops a 1', async ({ page }) => {
    await openScene(page, 'shift');
    await page.getByTestId('shift-range').fill('3');
    await expect(page.getByTestId('shift-dec')).toHaveText('13');
    await expect(page.getByTestId('shift-chain')).toHaveText('104→52→26→13');
    await expect(page.getByTestId('shift-caption')).toContainText('ได้ 13');

    await page.getByTestId('shift-chip').filter({ hasText: /^13$/ }).click();
    await page.getByTestId('shift-range').fill('1');
    await expect(page.getByTestId('shift-dec')).toHaveText('6');
    await expect(page.getByTestId('shift-tray')).toHaveText('1');
  });
});
