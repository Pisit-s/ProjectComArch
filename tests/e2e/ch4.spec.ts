import { expect, test } from '@playwright/test';

test('chapter 4: 0.1 + 0.2, player controls and flowchart', async ({ page }) => {
  await page.goto('/learn/add-sub');
  const sim = page.getByTestId('sim');
  await expect(sim.getByTestId('result-hex')).toHaveText('0x3E99999A');
  const counter = page.getByTestId('sim-player-counter');
  await expect(counter).toHaveText(/ขั้นที่ 1\//);
  await page.getByTestId('sim-player-next').click();
  await expect(counter).toHaveText(/ขั้นที่ 2\//);
  await page.getByTestId('sim-player-prev').click();
  await expect(counter).toHaveText(/ขั้นที่ 1\//);
  await page
    .getByTestId('sim-player')
    .getByRole('button', { name: /^ไปขั้นที่ 4/ })
    .click();
  await expect(page.getByTestId('sim-player')).toHaveAttribute('data-step', 'align');
  // shift one bit at a time inside the align step
  await page.getByTestId('align-shift-one').isDisabled();
  await page.getByTestId('sim-player').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('sim-player')).toHaveAttribute('data-step', 'sig-add');
  await page.getByTestId('sim-player-flow').locator('[data-flow="round"]').click();
  await expect(page.getByTestId('round-decision')).toHaveAttribute('data-decision', 'up');
  await page.getByTestId('sim-player-play').click();
  await expect(page.getByTestId('sim-player')).toHaveAttribute('data-step', 'encode', {
    timeout: 6000,
  });
  // subtraction with cancellation
  await page.getByTestId('example-A6').click();
  await expect(sim.getByTestId('result-hex')).toHaveText('0x34000000');
  await page.getByTestId('example-A5').click();
  await expect(sim.getByTestId('result-hex')).toHaveText('0x4B800002');
  await expect(page.getByTestId('chapter-summary')).toBeVisible();
});
