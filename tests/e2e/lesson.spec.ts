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

  test('chapters 1-6 open with their vocabulary right after the hook', async ({ page }) => {
    await page.goto('/');
    for (const c of CHAPTERS.filter((x) => x.number <= 6)) {
      const first = await page
        .getByTestId(`section-${c.id}`)
        .locator('header')
        .evaluate((h) => h.nextElementSibling?.getAttribute('data-testid'));
      expect(first, c.id).toBe(`vocab-${c.id}`);
    }
  });

  test('scrollspy marks the chapter being read; NextUp goes to the next chapter', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'the chapter list in the header shows from 1024px');
    await page.goto('/#fp-add');
    const nav = page.getByTestId('progress-nav');
    await expect(nav.locator('[aria-current=location]')).toHaveAttribute('href', '#fp-add');
    await page.getByTestId('section-fp-add').getByTestId('next-up').click();
    await expect(page).toHaveURL(/#circuit$/);
    await expect(nav.locator('[aria-current=location]')).toHaveAttribute('href', '#circuit');
  });

  test('every scene loads when it is scrolled to', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    for (const s of SECTIONS)
      for (const sc of s.scenes) {
        const shell = page.getByTestId(`scene-${sc.id}`);
        await shell.scrollIntoViewIfNeeded();
        await expect(shell, sc.id).toHaveAttribute('data-loaded', '1');
      }
  });

  test('quick check answers right and wrong', async ({ page }) => {
    await page.goto('/#fp-add');
    const quiz = page.getByTestId('quiz-fp-add');
    await quiz.scrollIntoViewIfNeeded();
    // chapter links scroll smoothly: wait until the page stops moving before tapping
    await expect
      .poll(async () => {
        const y = await page.evaluate(() => window.scrollY);
        await page.waitForTimeout(250);
        return y === (await page.evaluate(() => window.scrollY));
      })
      .toBe(true);
    await quiz.getByRole('radio').first().check();
    await quiz.locator('button[type=submit]').click();
    await expect(page.getByTestId('quiz-fp-add-result')).toBeVisible();
  });
});

test.describe('narrow phone (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } });
  test('no horizontal scroll with every scene loaded', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
