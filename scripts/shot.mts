// Usage: tsx scripts/shot.mts <path> [out.png] [width=390] [height=844] [fullPage=1] [browser=chromium|webkit]
//          [--el <css selector>] [--steps <n>]
// --el    screenshot only that element (scrolled into view; its scene loads first)
// --steps focus the StepPlayer inside --el and press ArrowRight n times (key frames of a scene)
// A bare file name is saved under test-results/shots/ (gitignored).
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { chromium, webkit } from '@playwright/test';

const argv = process.argv.slice(2);
const flags: Record<string, string> = {};
const positional: string[] = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) flags[argv[i].slice(2)] = argv[++i] ?? '';
  else positional.push(argv[i]);
}
const [path = '/', outArg = 'shot.png', w = '390', h = '844', full = '1', browser = 'chromium'] =
  positional;
const out = outArg.includes('/') ? outArg : join('test-results/shots', outArg);
mkdirSync(dirname(out), { recursive: true });
const el = flags.el ?? process.env.SHOT_SELECTOR;
const steps = Number(flags.steps ?? 0);

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
// scroll through the page so in-view animations and lazy scenes have run
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo({ top: y, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
await page.waitForTimeout(900);
if (process.env.SHOT_CLICK) {
  for (const sel of process.env.SHOT_CLICK.split('|')) {
    await page.locator(sel).first().click();
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);
}
if (el) {
  const target = page.locator(el).first();
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  if (steps > 0) {
    // the player inside --el, or the player that contains it (e.g. --el is a stage)
    let player = target.locator('section[role=region]').first();
    if ((await player.count()) === 0)
      player = target.locator('xpath=ancestor-or-self::section[@role="region"]').last();
    await player.focus();
    for (let i = 0; i < steps; i++) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1200);
  }
  await target.screenshot({ path: out });
} else {
  await page.screenshot({ path: out, fullPage: full === '1' });
}
await b.close();
console.log('saved', out);
