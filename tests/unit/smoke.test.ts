import { describe, expect, it } from 'vitest';

describe('smoke', () => {
  it('runs with BigInt', () => {
    expect(2n ** 10n).toBe(1024n);
  });
});
