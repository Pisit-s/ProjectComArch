import { expect, test } from '@playwright/test';

/** Old chapter pages and the Lab redirect permanently to the single page (PLAN.md 4.1). */
const ROWS: [string, string][] = [
  ['/learn', '/'],
  ['/learn/number-systems', '/#binary'],
  ['/learn/binary-fractions', '/#encode'],
  ['/learn/ieee-754', '/#ieee754'],
  ['/learn/add-sub', '/#fp-add'],
  ['/learn/mul-div', '/'],
  ['/lab', '/'],
];

test.describe('redirects', () => {
  for (const [from, to] of ROWS) {
    test(`${from} -> ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers().location).toBe(to);
    });
  }

  test('/lab keeps its query and lands on the page', async ({ page }) => {
    await page.goto('/lab?a=0.1&b=0.2&op=add');
    await expect(page).toHaveURL(/\/\?a=0\.1&b=0\.2&op=add(#playground)?$/);
    await expect(page.getByTestId('section-playground')).toBeAttached();
  });

  test('/learn/ieee-754 opens at its chapter', async ({ page }) => {
    await page.goto('/learn/ieee-754');
    await expect(page).toHaveURL(/\/#ieee754$/);
    await expect(page.getByTestId('section-ieee754')).toBeInViewport();
  });
});
