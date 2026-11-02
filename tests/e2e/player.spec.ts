import { expect, test } from '@playwright/test';
import { openScene } from './helpers';

const P = 'fp-add-player';

test.describe('StepPlayer', () => {
  test('poster plays to the last step', async ({ page }) => {
    test.setTimeout(60_000);
    await openScene(page, 'fp-add-bits');
    await page.getByTestId(P).locator('select').selectOption({ index: 2 });
    await page.getByTestId(`${P}-poster`).click();
    await expect(page.getByTestId(`${P}-poster`)).toHaveCount(0);
    await expect(page.getByTestId(`${P}-counter`)).toHaveText('7/7', { timeout: 40_000 });
  });

  test('prev, next, dots and keyboard', async ({ page }) => {
    await openScene(page, 'fp-add-bits');
    const region = page.getByTestId(P);
    await page.getByTestId(`${P}-next`).click();
    await expect(region).toHaveAttribute('data-step-index', '1');
    await page.getByTestId(`${P}-prev`).click();
    await expect(region).toHaveAttribute('data-step-index', '0');
    await page.getByTestId(`${P}-dots`).getByRole('button').nth(3).click();
    await expect(region).toHaveAttribute('data-step-index', '3');
    await region.focus();
    await page.keyboard.press('ArrowRight');
    await expect(region).toHaveAttribute('data-step-index', '4');
    await page.keyboard.press('ArrowLeft');
    await expect(region).toHaveAttribute('data-step-index', '3');
    await page.getByTestId(`${P}-restart`).click();
    await expect(region).toHaveAttribute('data-step-index', '0');
  });

  test('presentation mode opens and closes', async ({ page }) => {
    await openScene(page, 'fp-add-bits');
    await page.getByTestId(`${P}-present`).click();
    await expect(page.locator(`[data-testid=${P}][data-presenting="1"]`)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(`[data-testid=${P}][data-presenting="1"]`)).toHaveCount(0);
  });

  test('why button opens the detail', async ({ page }) => {
    await openScene(page, 'fp-add-bits');
    await page.getByTestId(`${P}-dots`).getByRole('button').nth(1).click();
    await page.getByTestId(`${P}-why`).click();
    await expect(page.getByTestId(`${P}-detail`)).toBeVisible();
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('nothing plays by itself and every step is reachable', async ({ page }) => {
    await openScene(page, 'fp-add-bits');
    await page.waitForTimeout(3000);
    await expect(page.getByTestId(`${P}-counter`)).toHaveText('1/7');
    for (let i = 0; i < 6; i++) await page.getByTestId(`${P}-next`).click();
    await expect(page.getByTestId(`${P}-counter`)).toHaveText('7/7');
    await expect(page.getByTestId('fp-add-hex')).toHaveText('0x41240000');
  });
});
