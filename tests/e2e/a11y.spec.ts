import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('page has no serious accessibility issues or console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  // scroll once through the page so every scene mounts
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
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
