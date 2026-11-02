import { expect, test } from '@playwright/test';
import { openScene } from './helpers';

test.describe('chapter 7: playground', () => {
  test('typed values give the engine result', async ({ page }) => {
    await openScene(page, 'playground');
    await page.getByTestId('play-a').fill('0.1');
    await page.getByTestId('play-b').fill('0.2');
    await expect(page.getByTestId('play-hex')).toHaveText('0x3E99999A');
    await expect(page.getByTestId('play-stored')).toHaveText('0.300000011920928955078125');
    await expect(page.getByTestId('play-result')).toContainText('inexact');
  });

  test('bits and circuit views share the same step', async ({ page }) => {
    await openScene(page, 'playground');
    for (let i = 0; i < 3; i++) await page.getByTestId('play-player-next').click();
    await expect(page.getByTestId('play-player-counter')).toHaveText('4/7');
    await page.getByTestId('play-view-circuit').click();
    await expect(page.getByTestId('play-diagram')).toBeVisible();
    await expect(page.getByTestId('play-player-counter')).toHaveText('4/7');
    await page.getByTestId('play-view-bits').click();
    await expect(page.getByTestId('play-track')).toBeVisible();
  });

  test('copied link reopens the same example and step', async ({ page, context }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __copied?: string };
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: async (t: string) => void (w.__copied = t) },
      });
    });
    await openScene(page, 'playground');
    await page.getByTestId('play-a').fill('1.5');
    await page.getByTestId('play-b').fill('0.375');
    await page.getByTestId('play-op-sub').click();
    await page.getByTestId('play-player-next').click();
    await page.getByTestId('play-player-next').click();
    await page.getByTestId('play-copy').click();
    const url = await page.evaluate(() => (window as unknown as { __copied?: string }).__copied);
    expect(url).toMatch(/\?a=1\.5&b=0\.375&op=sub&step=[a-z-]+#playground$/);

    const again = await context.newPage();
    await again.goto(url!);
    const shell = again.getByTestId('scene-playground');
    await shell.scrollIntoViewIfNeeded();
    await expect(again.getByTestId('play-a')).toHaveValue('1.5');
    await expect(again.getByTestId('play-b')).toHaveValue('0.375');
    await expect(again.getByTestId('play-op-sub')).toHaveAttribute('aria-pressed', 'true');
    await expect(again.getByTestId('play-player-counter')).toHaveText(/^3\//);
  });

  test('an old /lab link opens the playground with the same example', async ({ page }) => {
    await page.goto('/lab?a=6.5&b=3.75&op=sub');
    await expect(page).toHaveURL(/\/\?a=6\.5&b=3\.75&op=sub#playground$/);
    await expect(page.getByTestId('play-a')).toHaveValue('6.5');
    await expect(page.getByTestId('play-op-sub')).toHaveAttribute('aria-pressed', 'true');
  });
});
