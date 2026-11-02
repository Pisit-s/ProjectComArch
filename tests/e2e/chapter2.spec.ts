import { expect, test } from '@playwright/test';
import { openScene, stepTo, stepToEnd } from './helpers';

/** Values from PLAN.md 11.2 (chapter 2). printf output comes from the engine (format-c.ts). */
test.describe('chapter 2: decimals in a program', () => {
  test('2.1 prints 13 10.250000; the 0.1f + 0.2f chip prints 0.300000012', async ({ page }) => {
    await openScene(page, 'c-code');
    await page.getByTestId('c-code-player-poster').click();
    await page.getByTestId('c-code-player-play').click(); // pause
    await stepTo(page, 'c-code-player', 'int');
    await expect(page.getByTestId('c-code-value')).toHaveText('13');
    await page.getByTestId('c-code-player-why').click();
    await expect(page.getByTestId('c-code-player-detail')).toContainText('overflow');
    await stepTo(page, 'c-code-player', 'float');
    await expect(page.getByTestId('c-fpu')).toBeVisible();
    await expect(page.getByTestId('c-code-value')).toHaveText('10.250000');
    await stepToEnd(page, 'c-code-player');
    await expect(page.getByTestId('c-code-output')).toHaveText('13 10.250000');

    await page.getByTestId('c-code-chip').nth(1).click();
    await stepToEnd(page, 'c-code-player');
    await expect(page.getByTestId('c-code-output')).toHaveText('0.300000012');
    await expect(page.getByTestId('c-code-teaser-link')).toHaveAttribute('href', '#rounding');
  });

  test('2.2 the point hops until the number is normalized', async ({ page }) => {
    await openScene(page, 'point');
    await stepToEnd(page, 'point-player');
    await expect(page.getByTestId('point-value')).toHaveText('2');
    await expect(page.getByTestId('point-exp')).toContainText('101');

    await page.getByTestId('point-chip').nth(1).click();
    await stepToEnd(page, 'point-player');
    await expect(page.getByTestId('point-value')).toHaveText('9.8702');

    await page.getByTestId('point-chip').nth(2).click();
    await expect(page.getByTestId('point-player-next')).toBeDisabled();
    await expect(page.getByTestId('point-player-caption')).toContainText('normalized อยู่แล้ว');

    await page.getByTestId('point-chip').nth(3).click();
    await expect(page.getByTestId('point-value')).toHaveText('110.1');
    await stepToEnd(page, 'point-player');
    await expect(page.getByTestId('point-value')).toHaveText('1.101');
  });
});
