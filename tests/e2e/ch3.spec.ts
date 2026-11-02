import { expect, test } from '@playwright/test';

test('chapter 3: encode, inexact warning, decode and bit errors', async ({ page }) => {
  await page.goto('/floating-point/ieee-754');
  const conv = page.getByTestId('conv');
  const input = conv.getByTestId('conv-input');
  await input.fill('5.75');
  await expect(conv.getByTestId('conv-result-hex')).toHaveText('0x40B80000');
  await expect(conv.getByTestId('conv-exact')).toBeVisible();
  await input.fill('-13.25');
  await expect(conv.getByTestId('conv-result-hex')).toHaveText('0xC1540000');
  await input.fill('0.1');
  await expect(conv.getByTestId('conv-inexact')).toContainText(
    'ค่าที่เก็บจริงไม่เท่ากับค่าที่ป้อน',
  );
  await input.fill('1,5');
  await expect(conv.getByText('ใช้จุด (.) เป็นจุดทศนิยม')).toBeVisible();
  await input.fill('3.5e38');
  await expect(conv.getByTestId('conv-overflow')).toBeVisible();

  // step through the encoder to the end
  await input.fill('5.75');
  const player = conv.getByTestId('conv-player');
  await player.getByRole('button', { name: /^ไปขั้นที่ 3/ }).click();
  await conv.getByTestId('point-left').click();
  await conv.getByTestId('point-left').click();
  await expect(conv.getByTestId('point-done')).toBeVisible();

  // decode the bits of 5.75
  await conv.getByTestId('conv-tab-decode').click();
  await conv.getByTestId('conv-hex').fill('40B80000');
  await expect(conv.getByTestId('conv-decoded')).toHaveText('5.75');
  await conv.getByTestId('conv-bits').fill('0100000010111000000000000000000');
  await expect(conv.getByText('ต้องมีครบ 32 บิต แต่ตอนนี้มี 31 บิต')).toBeVisible();
  // toggling the sign bit
  await conv.getByTestId('conv-edit-bit-0').click();
  await expect(conv.getByTestId('conv-decoded')).toHaveText('−5.75');
  await expect(page.getByTestId('chapter-summary')).toBeVisible();
});
