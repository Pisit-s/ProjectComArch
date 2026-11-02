import { expect, test } from '@playwright/test';
import { openScene, stepTo } from './helpers';

test.describe('chapter 6: the adder circuit', () => {
  test('6.5 + 3.75 lights Small ALU, MUX + shift, Big ALU, Normalize, Round, result', async ({
    page,
  }) => {
    await openScene(page, 'circuit-flow');
    const svg = page.getByTestId('circuit-diagram').locator('svg');
    const next = page.getByTestId('circuit-player-next');
    const seen: string[] = [];
    for (let i = 0; i < 20; i++) {
      seen.push((await svg.getAttribute('data-active')) ?? '');
      if (!(await next.isEnabled())) break;
      await next.click();
    }
    expect(seen).toEqual([
      'regA regB',
      'smallAlu control',
      'muxExp muxSmall muxBig shift',
      'bigAlu',
      'normalize incdec',
      'round',
      'regR',
    ]);
    await expect(page.getByTestId('circuit-player-caption')).toContainText('0x41240000');
  });

  test('tapping a block explains it', async ({ page }) => {
    await openScene(page, 'circuit-flow');
    await page.getByTestId('circuit-player-next').click(); // leaves the poster
    await page.locator('[data-block=shift]').click();
    await expect(page.getByTestId('circuit-diagram-info')).toContainText('Shifter');
  });

  test('a tapped block shows the values going in and out in this step', async ({ page }) => {
    await openScene(page, 'circuit-flow');
    await stepTo(page, 'circuit-player', 'add');
    await page.locator('[data-block=bigAlu]').click();
    await expect(page.getByTestId('circuit-diagram-io')).toContainText('10.1001');
    await stepTo(page, 'circuit-player', 'normalize');
    await page.locator('[data-block=incdec]').click();
    await expect(page.getByTestId('circuit-diagram-io')).toContainText('+1');
  });

  test('subtraction routes through Control first', async ({ page }) => {
    await openScene(page, 'circuit-flow');
    await page.getByTestId('circuit-chip').nth(1).click();
    await page.getByTestId('circuit-player-next').click();
    await expect(page.getByTestId('circuit-diagram').locator('svg')).toHaveAttribute(
      'data-active',
      'control regB',
    );
  });
});
