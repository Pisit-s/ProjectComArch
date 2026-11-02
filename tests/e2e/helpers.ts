import { type Page, expect } from '@playwright/test';

/** Open the page at a scene and wait until its code has loaded. */
export async function openScene(page: Page, sceneId: string): Promise<void> {
  await page.goto(`/#${sceneId}`);
  const shell = page.getByTestId(`scene-${sceneId}`);
  await shell.scrollIntoViewIfNeeded();
  await expect(shell).toHaveAttribute('data-loaded', '1');
}

/** Press "next" until the player shows the step with this id. */
export async function stepTo(page: Page, player: string, stepId: string): Promise<void> {
  const region = page.getByTestId(player);
  const next = page.getByTestId(`${player}-next`);
  for (let i = 0; i < 40; i++) {
    if ((await region.getAttribute('data-step')) === stepId) return;
    await next.click();
  }
  throw new Error(`step ${stepId} not found in ${player}`);
}

/** Press "next" until the last step. */
export async function stepToEnd(page: Page, player: string): Promise<void> {
  const next = page.getByTestId(`${player}-next`);
  for (let i = 0; i < 40 && (await next.isEnabled()); i++) await next.click();
  await expect(next).toBeDisabled();
}
