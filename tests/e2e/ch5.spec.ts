import { expect, test } from '@playwright/test';

test('chapter 5: multiplication, division and special cases', async ({ page }) => {
  await page.goto('/floating-point/mul-div');
  const sim = page.getByTestId('sim');
  const player = page.getByTestId('sim-player');
  // 6.5 x 2.75 with three partial products
  await expect(sim.getByTestId('result-hex')).toHaveText('0x418F0000');
  await player.getByRole('button', { name: /^ไปขั้นที่ 5/ }).click();
  await expect(player).toHaveAttribute('data-step', 'sig-mul');
  await expect(page.getByTestId('pp-row')).toHaveCount(3);
  // exponent in decimal and 8-bit binary
  await player.getByRole('button', { name: /^ไปขั้นที่ 4/ }).click();
  await expect(page.getByTestId('exponent-calc')).toContainText('10000010');

  // 1 / 3 rounds up with G=1 R=0 S=1
  await page.getByTestId('example-D3').click();
  await expect(sim.getByTestId('result-hex')).toHaveText('0x3EAAAAAB');
  await page.getByTestId('sim-player-flow').locator('[data-flow="significand"]').click();
  await expect(page.getByTestId('div-row').first()).toBeVisible();
  await page.getByTestId('div-show-all').click();
  await expect(page.getByTestId('div-row')).toHaveCount(27);
  await page.getByTestId('sim-player-flow').locator('[data-flow="round"]').click();
  await expect(page.getByTestId('grs-G')).toHaveText('1');
  await expect(page.getByTestId('grs-R')).toHaveText('0');
  await expect(page.getByTestId('grs-S')).toHaveText('1');

  // 1 / 0 = +inf with an explanation
  await page.getByTestId('example-D4').click();
  await expect(sim.getByTestId('result-hex')).toHaveText('0x7F800000');
  await page.getByTestId('sim-player-flow').locator('[data-flow="special"]').click();
  await expect(page.getByTestId('special-case')).toContainText('x ÷ 0');
  await expect(sim.getByTestId('result-card')).toContainText('Division by zero');

  // 0 / 0 = NaN
  await page.getByTestId('example-D5').click();
  await expect(sim.getByTestId('result-value')).toHaveText('NaN');
  await expect(sim.getByTestId('result-card')).toContainText('Invalid operation');

  // 3e38 x 10 overflows
  await page.getByTestId('example-M5').click();
  await expect(sim.getByTestId('result-hex')).toHaveText('0x7F800000');
  await page.getByTestId('sim-player-flow').locator('[data-flow="range"]').click();
  await expect(page.getByTestId('range-gauge')).toContainText('Overflow');

  // special value buttons: inf x 0 = NaN
  await page.getByTestId('special-Infinity').click();
  await page.getByRole('button', { name: 'B', exact: true }).click();
  await page.getByTestId('special-0').click();
  await expect(sim.getByTestId('result-value')).toHaveText('NaN');
  await expect(page.getByTestId('chapter-summary')).toBeVisible();
});
