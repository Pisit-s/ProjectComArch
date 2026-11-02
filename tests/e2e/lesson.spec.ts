import { expect, test } from '@playwright/test';
import { CHAPTERS, SECTIONS } from '../../src/content/lesson/sections';

test.describe('single-page lesson', () => {
  test('every section is on the page in order, no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/comkrub/);
    const ids = await page
      .locator('[data-testid^="section-"]')
      .evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(['top', ...SECTIONS.map((s) => s.id)]);
    for (const s of SECTIONS) {
      for (const sc of s.scenes) await expect(page.getByTestId(`scene-${sc.id}`)).toBeAttached();
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('chapter navigation jumps to the anchor', async ({ page, isMobile }) => {
    await page.goto('/');
    const target = CHAPTERS[4];
    if (isMobile) {
      await page.getByRole('button', { name: /เมนู/ }).first().click();
      await page.locator('#mobile-nav-panel').getByRole('link').nth(4).click();
    } else {
      await page.getByTestId('progress-nav').getByRole('link').nth(4).click();
    }
    await expect(page).toHaveURL(new RegExp(`#${target.id}$`));
    await expect(page.getByTestId(`section-${target.id}`)).toBeInViewport();
  });

  test('unknown path shows the 404 page', async ({ page }) => {
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await expect(page.getByTestId('not-found')).toBeVisible();
  });

  test('dev kit is not part of the production site', async ({ request }) => {
    test.skip(!!process.env.E2E_DEV, 'dev server serves the kit');
    const res = await request.get('/dev/kit');
    expect(res.status()).toBe(404);
  });
});
