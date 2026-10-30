// Usage: tsx scripts/shot.mts <path> <out.png> [width=390] [height=844] [fullPage=1] [browser=chromium|webkit]
import { chromium, webkit } from '@playwright/test';

const [
  path = '/',
  out = 'test-results/shots/shot.png',
  w = '390',
  h = '844',
  full = '1',
  browser = 'chromium',
] = process.argv.slice(2);
const base = process.env.SHOT_BASE ?? 'http://localhost:3200';
const b = await (browser === 'webkit' ? webkit : chromium).launch();
const ctx = await b.newContext({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: Number(w) < 700,
});
const page = await ctx.newPage();
await page.goto(base + path, { waitUntil: 'networkidle' });
// scroll through the page so in-view animations (BlurFade) have run
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(900);
if (process.env.SHOT_CLICK) {
  for (const sel of process.env.SHOT_CLICK.split('|')) {
    await page.locator(sel).first().click();
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);
}
if (process.env.SHOT_SELECTOR) {
  const el = page.locator(process.env.SHOT_SELECTOR).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await el.screenshot({ path: out });
} else {
  await page.screenshot({ path: out, fullPage: full === '1' });
}
await b.close();
console.log('saved', out);
