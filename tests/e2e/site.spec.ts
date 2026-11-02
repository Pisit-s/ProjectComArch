import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/floating-point/number-systems',
  '/floating-point/binary-fractions',
  '/floating-point/ieee-754',
  '/floating-point/add-sub',
  '/floating-point/mul-div',
  '/floating-point/lab',
];
const CHAPTERS = PAGES.slice(1, 6);

test('navigate to every chapter and the Lab from the menu', async ({ page, isMobile }) => {
  await page.goto('/');
  for (const href of [...CHAPTERS, '/floating-point/lab']) {
    if (isMobile) {
      await page.getByRole('button', { name: 'เมนูบทเรียน' }).click();
      await page
        .getByRole('navigation', { name: 'บทเรียนทั้งหมด' })
        .locator(`a[href="${href}"]`)
        .click();
    } else {
      await page
        .getByRole('navigation', { name: 'เมนูหลัก' })
        .locator(`a[href="${href}"]`)
        .first()
        .click();
    }
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('previous / next chapter links and a summary in every chapter', async ({ page }) => {
  await page.goto(CHAPTERS[0]);
  for (let i = 0; i < CHAPTERS.length; i++) {
    await expect(page.getByTestId('chapter-summary')).toBeVisible();
    if (i < CHAPTERS.length - 1) {
      await page.getByTestId('next-chapter').click();
      await expect(page).toHaveURL(new RegExp(`${CHAPTERS[i + 1]}$`));
    }
  }
  await page.getByTestId('prev-chapter').click();
  await expect(page).toHaveURL(new RegExp(`${CHAPTERS[3]}$`));
});

for (const path of PAGES) {
  test(`no console errors and no serious axe violations: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const result = await new AxeBuilder({ page }).analyze();
    const bad = result.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map(
        (v) =>
          `${v.id}: ${v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(' '))
            .join(' | ')}`,
      );
    expect(bad).toEqual([]);
    expect(errors).toEqual([]);
  });
}
