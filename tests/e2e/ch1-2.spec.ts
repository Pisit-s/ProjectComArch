import { expect, test } from '@playwright/test';

test('chapter 1: toggle bits to 00001010 = 10, preset 255', async ({ page }) => {
  await page.goto('/learn/number-systems');
  await page.getByTestId('int-preset-0').click();
  await expect(page.getByTestId('int-binary')).toContainText('00000000');
  await page.getByTestId('int-bit-4').click();
  await page.getByTestId('int-bit-6').click();
  await expect(page.getByTestId('int-binary')).toContainText('00001010');
  await expect(page.getByTestId('int-decimal')).toHaveText('10');
  await page.getByTestId('int-preset-255').click();
  await expect(page.getByTestId('int-binary')).toContainText('11111111');
  await expect(page.getByTestId('int-decimal')).toHaveText('255');
  // typing a decimal flips the bits; out of range shows a Thai error
  await page.getByTestId('int-input').fill('128');
  await expect(page.getByTestId('int-binary')).toContainText('10000000');
  await page.getByTestId('int-input').fill('300');
  await expect(page.getByText('ต้องอยู่ระหว่าง 0 ถึง 255')).toBeVisible();
  await expect(page.getByTestId('chapter-summary')).toBeVisible();
});

test('chapter 2: 0.1 at 16 bits and 0.375', async ({ page }) => {
  await page.goto('/learn/binary-fractions');
  const fc = page.getByTestId('frac-converter');
  await fc.getByTestId('fc-input').fill('0.1');
  await fc.getByTestId('fc-bits-16').click();
  await expect(page.getByTestId('fc-bits')).toHaveText('0001100110011001');
  await expect(page.getByTestId('fc-approx')).toHaveText('0.0999908447265625');
  await expect(page.getByTestId('fc-error')).toHaveText('0.0000091552734375');
  await expect(page.getByTestId('fc-repeat')).toContainText('0011');
  await fc.getByTestId('fc-input').fill('0.375');
  await expect(page.getByTestId('fc-bits')).toHaveText('011');
  await expect(page.getByTestId('fc-error')).toHaveText('0');
  await fc.getByTestId('fc-input').fill('1.5');
  await expect(page.getByText('ต้องเป็นเศษส่วนที่ 0 ≤ x < 1')).toBeVisible();
  // fraction explorer
  await page.getByTestId('frac-bit-0').click(); // 1010... -> 0010...
  await expect(page.getByTestId('frac-decimal')).toHaveText('0.125');
  await expect(page.getByTestId('chapter-summary')).toBeVisible();
});
