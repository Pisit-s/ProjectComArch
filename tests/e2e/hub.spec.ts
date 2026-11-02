import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { TOPICS } from '../../src/content/topics';

// Statuses are read from the registry: other WPs flip them later (PLAN.md 7).
const ORDERED = [...TOPICS].sort((a, b) => a.order - b.order);
const SOON = ORDERED.filter((t) => t.status === 'coming-soon');
const READY = ORDERED.filter((t) => t.status === 'ready');
const STATUS_TEXT = { ready: 'พร้อมเรียน', 'coming-soon': 'กำลังพัฒนา' } as const;

test('home: one card per topic in registry order with the right status', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('[data-testid^="topic-card-"]');
  await expect(cards).toHaveCount(ORDERED.length);
  for (const [i, t] of ORDERED.entries()) {
    const card = cards.nth(i);
    await expect(card).toHaveAttribute('data-testid', `topic-card-${t.id}`);
    await expect(card).toHaveAttribute('href', t.href);
    await expect(card).toContainText(t.title);
    await expect(card).toContainText(STATUS_TEXT[t.status]);
  }
});

test('home: the first card is visible on a 390x844 phone without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const first = page.getByTestId(`topic-card-${ORDERED[0].id}`);
  await expect(first).toBeInViewport();
  const box = await first.boundingBox();
  expect(box!.y).toBeLessThan(844);
});

for (const t of SOON) {
  test(`coming soon: ${t.id}`, async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`topic-card-${t.id}`).click();
    await expect(page).toHaveURL(new RegExp(`${t.href}$`));
    const box = page.getByTestId('coming-soon');
    await expect(box).toContainText('กำลังพัฒนา');
    await expect(page.locator('h1')).toHaveText(t.title);
    for (const c of t.covers) await expect(page.getByTestId('coming-soon-covers')).toContainText(c);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await box.getByRole('link', { name: 'กลับหน้าแรก' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
}

for (const t of READY) {
  test(`ready: ${t.id} opens its own page`, async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`topic-card-${t.id}`).click();
    await expect(page).toHaveURL(new RegExp(`${t.href}$`));
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByTestId('coming-soon')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('กำลังพัฒนา');
  });
}

test('stage 1 links redirect and keep the query string', async ({ page }) => {
  await page.goto('/learn');
  await expect(page).toHaveURL(/\/floating-point$/);
  await page.goto('/learn/ieee-754');
  await expect(page).toHaveURL(/\/floating-point\/ieee-754$/);
  await page.goto('/lab?tab=calc&op=mul&a=0.1&b=3&step=round');
  await expect(page).toHaveURL(/\/floating-point\/lab\?tab=calc&op=mul&a=0\.1&b=3&step=round$/);
  await expect(page.getByTestId('lab-tab-calc')).toBeVisible();
});

test('header (desktop) and drawer (phone) list every topic', async ({ page, isMobile }) => {
  await page.goto('/floating-point/ieee-754');
  if (isMobile) {
    await page.getByRole('button', { name: 'เมนูหัวข้อ' }).click();
    for (const t of ORDERED) await expect(page.getByTestId(`drawer-topic-${t.id}`)).toBeVisible();
    const fp = page.getByTestId('drawer-fp-chapters');
    await expect(fp.locator('a')).toHaveCount(6);
    await expect(fp.locator('a[aria-current="page"]')).toHaveAttribute(
      'href',
      '/floating-point/ieee-754',
    );
    await page.getByTestId(`drawer-topic-${ORDERED[0].id}`).click();
    await expect(page).toHaveURL(new RegExp(`${ORDERED[0].href}$`));
    await page.getByRole('button', { name: 'เมนูหัวข้อ' }).click();
    await expect(page.getByTestId('drawer-fp-chapters')).toHaveCount(0);
  } else {
    for (const t of ORDERED) {
      const link = page.getByTestId(`nav-topic-${t.id}`);
      await expect(link).toBeVisible();
      if (t.id === 'floating-point') await expect(link).toHaveAttribute('aria-current', 'page');
      else await expect(link).not.toHaveAttribute('aria-current', 'page');
      if (t.status !== 'ready') await expect(link).toHaveAttribute('title', 'กำลังพัฒนา');
    }
  }
});

test('sitemap lists ready topics only', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const t of READY) expect(xml).toContain(`${t.href}</loc>`);
  for (const t of SOON) expect(xml).not.toContain(`${t.href}</loc>`);
  expect(xml).toContain('/floating-point/lab</loc>');
});

for (const path of ['/', ...SOON.map((t) => t.href), '/dev/kit']) {
  test(`no console errors and no serious axe violations: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    const res = await page.goto(path);
    // /dev/kit exists only in dev; in a production build it is a 404 by design
    if (path === '/dev/kit' && res?.status() === 404) return;
    await page.waitForLoadState('networkidle');
    // entrance fades change contrast while they run; measure the settled page
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
    );
    const result = await new AxeBuilder({ page }).analyze();
    const bad = result.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
    expect(bad).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('chapter pills keep the page at a #anchor', async ({ page }) => {
  await page.goto('/floating-point/mul-div#simulator');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#simulator-h')).toBeInViewport();
  await expect(
    page.getByRole('navigation', { name: 'บทของ Floating-Point' }).locator('[aria-current="page"]'),
  ).toHaveAttribute('href', '/floating-point/mul-div');
});
