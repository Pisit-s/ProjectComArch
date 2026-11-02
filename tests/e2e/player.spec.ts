import { expect, test } from '@playwright/test';

test.describe('StepPlayer', () => {
  test('buttons, indicator, keyboard and flowchart', async ({ page }) => {
    await page.goto('/floating-point/lab');
    const player = page.getByTestId('sim-player');
    const counter = page.getByTestId('sim-player-counter');
    await expect(counter).toHaveText('ขั้นที่ 1/9');
    await page.getByTestId('sim-player-next').click();
    await expect(counter).toHaveText('ขั้นที่ 2/9');
    await page.getByTestId('sim-player-prev').click();
    await expect(counter).toHaveText('ขั้นที่ 1/9');
    // jump with the step indicator
    await player.getByRole('button', { name: /^ไปขั้นที่ 8/ }).click();
    await expect(counter).toHaveText('ขั้นที่ 8/9');
    // keyboard while focus is inside the player
    await player.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText('ขั้นที่ 7/9');
    await page.keyboard.press('Home');
    await expect(counter).toHaveText('ขั้นที่ 1/9');
    await page.keyboard.press('ArrowRight');
    await expect(counter).toHaveText('ขั้นที่ 2/9');
    // flowchart box jumps to its step
    await page.getByTestId('sim-player-flow').locator('[data-flow="round"]').click();
    await expect(player).toHaveAttribute('data-step', 'round');
  });

  test('auto play advances and stops when the user steps', async ({ page }) => {
    await page.goto('/floating-point/lab');
    const counter = page.getByTestId('sim-player-counter');
    await page.getByTestId('sim-player').getByLabel('ความเร็วในการเล่น').selectOption('2');
    await page.getByTestId('sim-player-play').click();
    await expect(counter).toHaveText('ขั้นที่ 3/9', { timeout: 6000 });
    await page.getByTestId('sim-player-prev').click();
    const now = await counter.textContent();
    await page.waitForTimeout(1600);
    await expect(counter).toHaveText(now!);
  });

  test('works with reduced motion', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/floating-point/lab');
    const counter = page.getByTestId('sim-player-counter');
    for (let i = 2; i <= 9; i++) {
      await page.getByTestId('sim-player-next').click();
      await expect(counter).toHaveText(`ขั้นที่ ${i}/9`);
    }
    await expect(page.getByTestId('final-hex')).toHaveText('0x418F0000');
    await ctx.close();
  });

  test('tapping a bit explains it', async ({ page }) => {
    await page.goto('/floating-point/lab');
    await page.getByTestId('sim-reg-a-bit-1').click();
    await expect(page.getByTestId('bit-info').first()).toContainText('Exponent');
  });
});
