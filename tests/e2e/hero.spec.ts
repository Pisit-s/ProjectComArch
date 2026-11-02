import { expect, test } from '@playwright/test';

/** Hero (PLAN.md 3.1): text from the server, a teaser that plays once, the journey map. */
test.describe('hero', () => {
  test('teaser plays by itself to 0x40D00000 + 0x40700000 = 0x41240000', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('comkrub');
    const teaser = page.getByTestId('hero-teaser');
    await expect(teaser).toHaveAttribute('data-step', 'decimal');
    await expect(page.getByTestId('hero-dec-2')).toHaveText('10.25');
    await expect(teaser).toHaveAttribute('data-step', 'sum', { timeout: 15_000 });
    await expect(page.getByTestId('hero-hex-0')).toHaveText('0x40D00000');
    await expect(page.getByTestId('hero-hex-1')).toHaveText('0x40700000');
    await expect(page.getByTestId('hero-hex-2')).toHaveText('0x41240000');
    await expect(page.getByTestId('hero-teaser-play')).toHaveAttribute('aria-pressed', 'false');
  });

  test('start button and journey map jump to chapters', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'เริ่มเรียน' }).click();
    await expect(page).toHaveURL(/#binary$/);
    await page.goto('/');
    await page
      .getByTestId('journey-map')
      .getByRole('link', { name: /ทศนิยมใน C/ })
      .click();
    await expect(page).toHaveURL(/#float-in-c$/);
  });
});

test.describe('hero with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows the last step at once and never plays', async ({ page }) => {
    await page.goto('/');
    const teaser = page.getByTestId('hero-teaser');
    await expect(teaser).toHaveAttribute('data-step', 'sum');
    await expect(page.getByTestId('hero-hex-2')).toHaveText('0x41240000');
    await expect(page.getByTestId('hero-teaser-play')).toHaveAttribute('aria-pressed', 'false');
    await page.waitForTimeout(3000);
    await expect(teaser).toHaveAttribute('data-step', 'sum');
  });
});
