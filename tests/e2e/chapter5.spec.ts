import { expect, test } from '@playwright/test';
import { openScene, stepTo, stepToEnd } from './helpers';

/** Values from PLAN.md 11.2 (chapter 5). The page renders them from the engine. */
test.describe('chapter 5: add and subtract', () => {
  test('5.1 four decimal digits: 1.002 × 10²', async ({ page }) => {
    await openScene(page, 'dec4');
    await stepToEnd(page, 'dec4');
    await expect(page.getByTestId('dec4-caption')).toContainText('1.002 × 10²');
  });

  test('5.2 6.5 + 3.75 = 0x41240000, normalize right 1', async ({ page }) => {
    await openScene(page, 'fp-add-bits');
    await stepTo(page, 'fp-add-player', 'normalize');
    await expect(page.getByTestId('fp-add-player-stage')).toContainText('→1');
    await stepToEnd(page, 'fp-add-player');
    await expect(page.getByTestId('fp-add-hex')).toHaveText('0x41240000');
    await expect(page.getByTestId('fp-add-value')).toHaveText('10.25');
  });

  test('5.2 typing a new operand rebuilds the scene', async ({ page }) => {
    await openScene(page, 'fp-add-bits');
    await page.getByTestId('fp-add-b').fill('0.5625');
    await page.getByTestId('fp-add-a').fill('9.75');
    await stepToEnd(page, 'fp-add-player');
    await expect(page.getByTestId('fp-add-value')).toHaveText('10.3125');
    await page.getByTestId('fp-add-a').fill('1,5');
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('5.3 0.5 − 0.4375 = 0x3D800000, normalize left 3; 3.75 − 6.5 swaps', async ({ page }) => {
    await openScene(page, 'fp-sub');
    await stepTo(page, 'fp-sub-player', 'add');
    await expect(page.getByTestId('mini-alu-binvert')).toHaveText('1');
    await expect(page.getByTestId('mini-alu-carryin')).toHaveText('1');
    await stepTo(page, 'fp-sub-player', 'normalize');
    await expect(page.getByTestId('fp-sub-player-stage')).toContainText('←3');
    await stepToEnd(page, 'fp-sub-player');
    await expect(page.getByTestId('fp-sub-hex')).toHaveText('0x3D800000');

    await page.getByTestId('fp-sub-chip').nth(1).click();
    await stepTo(page, 'fp-sub-player', 'swap');
    await stepToEnd(page, 'fp-sub-player');
    await expect(page.getByTestId('fp-sub-hex')).toHaveText('0xC0300000');
  });

  test('5.4 0.1 + 0.2 rounds up to 0x3E99999A; 16777216 + 1 is a tie', async ({ page }) => {
    await openScene(page, 'rounding');
    await page.getByTestId('rounding-player-poster').click();
    await page.getByTestId('rounding-player-play').click(); // pause
    await expect(page.getByTestId('rounding-player-caption')).toContainText('G = 1, R = 1, S = 0');
    await stepTo(page, 'rounding-player', 'rule');
    await expect(page.locator('[data-testid=round-rules] [data-active=true]')).toContainText(
      '1, R',
    );
    await stepToEnd(page, 'rounding-player');
    await expect(page.getByTestId('rounding-hex')).toHaveText('0x3E99999A');
    await expect(page.getByTestId('rounding-stored')).toHaveText('0.300000011920928955078125');

    await page.getByTestId('rounding-chip').nth(1).click();
    await stepTo(page, 'rounding-player', 'rule');
    await expect(page.locator('[data-testid=round-rules] [data-active=true]')).toContainText('LSB');
    await stepToEnd(page, 'rounding-player');
    await expect(page.getByTestId('rounding-hex')).toHaveText('0x4B800000');
  });

  test('5.5 slide example in double: 16 / 20 / 16', async ({ page }) => {
    await openScene(page, 'slide-fun-fact');
    await stepToEnd(page, 'fun-fact');
    await expect(page.getByTestId('fun-fact-order')).toHaveText(/y − x\s*16.*20.*16/s);
  });
});
