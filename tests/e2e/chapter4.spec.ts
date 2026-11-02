import { expect, test } from '@playwright/test';
import { openScene, stepTo, stepToEnd } from './helpers';

/** Values from PLAN.md 11.2 (chapter 4). The page renders them from the engine. */
test.describe('chapter 3: convert and read back (3.2, 3.3)', () => {
  test('3.2 6.5 → 0x40D00000', async ({ page }) => {
    await openScene(page, 'encode');
    await stepTo(page, 'encode-player', 'exp');
    await expect(page.getByTestId('encode-player-caption')).toContainText('2 + 127 = 129');
    await stepToEnd(page, 'encode-player');
    await expect(page.getByTestId('encode-hex')).toHaveText('0x40D00000');
    await expect(page.getByTestId('encode-warning')).toHaveCount(0);
  });

  test('3.2 −0.75 → 0xBF400000 (P&H)', async ({ page }) => {
    await openScene(page, 'encode');
    await page.getByTestId('encode-chip').nth(2).click();
    await stepToEnd(page, 'encode-player');
    await expect(page.getByTestId('encode-hex')).toHaveText('0xBF400000');
  });

  test('3.2 0.1 repeats and shows the stored value warning', async ({ page }) => {
    await openScene(page, 'encode');
    await page.getByTestId('encode-input').fill('0.1');
    await expect(page.getByTestId('encode-warning')).toContainText('0.100000001490116119384765625');
    await stepTo(page, 'encode-player', 'loop');
    await expect(page.getByTestId('encode-times2-row')).toHaveCount(8);
    await stepToEnd(page, 'encode-player');
    await expect(page.getByTestId('encode-hex')).toHaveText('0x3DCCCCCD');
  });

  test('3.2 bad input shows an error and keeps the last scene', async ({ page }) => {
    await openScene(page, 'encode');
    await page.getByTestId('encode-input').fill('1,5');
    await expect(page.locator('#encode [role=alert]')).toBeVisible();
    await stepToEnd(page, 'encode-player');
    await expect(page.getByTestId('encode-hex')).toHaveText('0x40D00000');
  });
  test('3.3 reads back 0x40D00000 = 6.5, then P&H 0xC0A00000 = −5', async ({ page }) => {
    await openScene(page, 'decode');
    await stepToEnd(page, 'decode-player');
    await expect(page.getByTestId('decode-value')).toHaveText('6.5');
    await page.getByTestId('decode-chip').nth(1).click();
    await stepTo(page, 'decode-player', 'exp');
    await expect(page.getByTestId('decode-player-caption')).toContainText('129 − 127 = 2');
    await stepToEnd(page, 'decode-player');
    await expect(page.getByTestId('decode-value')).toHaveText('−5');

    await page.getByTestId('decode-input').fill('7F800000');
    await stepToEnd(page, 'decode-player');
    await expect(page.getByTestId('decode-value')).toHaveText('+∞');
    await page.getByTestId('decode-input').fill('12');
    await expect(page.locator('#decode [role=alert]')).toBeVisible();
  });
});
