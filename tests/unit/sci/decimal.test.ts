import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { decimalAdd, normalizeDecimal, scaledText } from '@/lib/sci/decimal';

describe('normalizeDecimal (golden D.3)', () => {
  it('0.002 x 10^4 -> 2 x 10^1, point hops right 3', () => {
    const n = normalizeDecimal('0.002', 4);
    expect(n.direction).toBe('right');
    expect(n.states.map((s) => `${s.text}e${s.exp}`)).toEqual([
      '0.002e4',
      '0.02e3',
      '0.2e2',
      '2e1',
    ]);
  });
  it('987.02 x 10^9 -> 9.8702 x 10^11, point hops left 2', () => {
    const n = normalizeDecimal('987.02', 9);
    expect(n.direction).toBe('left');
    expect(n.states.at(-1)).toEqual({ text: '9.8702', exp: 11 });
    expect(n.states).toHaveLength(3);
  });
  it('2.34 x 10^56 is already normalized', () => {
    expect(normalizeDecimal('2.34', 56)).toEqual({
      states: [{ text: '2.34', exp: 56 }],
      already: true,
      direction: 'none',
    });
  });
  it('binary digits work the same way: 110.1 -> 1.101 x 2^2', () => {
    expect(normalizeDecimal('110.1', 0).states.at(-1)).toEqual({ text: '1.101', exp: 2 });
  });
  it('pads zeros when the point moves past the last digit', () => {
    expect(normalizeDecimal('0.5', 0).states.at(-1)).toEqual({ text: '5', exp: -1 });
  });
  it('rejects zero and bad text', () => {
    expect(() => normalizeDecimal('0.000', 1)).toThrow();
    expect(() => normalizeDecimal('1,5', 0)).toThrow();
  });
});

describe('decimalAdd with 4 digits (golden D.3, P&H 3.5)', () => {
  it('9.999 x 10^1 + 1.610 x 10^-1 = 1.002 x 10^2', () => {
    const r = decimalAdd({ text: '9.999', exp: 1 }, { text: '1.610', exp: -1 });
    expect(r.d).toBe(2);
    expect(r.big).toBe('a');
    expect(r.align).toEqual({ before: '1.610', after: '0.016', lost: '10', exp: 1 });
    expect(r.add.sum).toBe('10.015');
    expect(r.normalize).toEqual({ before: '10.015', after: '1.0015', exp: 2, hops: 1 });
    expect(r.round).toEqual({ before: '1.0015', after: '1.002', exp: 2, decision: 'tie-even-up' });
    expect(r.result).toEqual({ text: '1.002', exp: 2 });
  });
  it('swapped order, exact sums and each rounding decision', () => {
    const r = decimalAdd({ text: '1.5', exp: 0 }, { text: '2.25', exp: 1 });
    expect(r.big).toBe('b');
    expect(r.result).toEqual({ text: '2.400', exp: 1 });
    expect(r.round.decision).toBe('exact');
    expect(r.normalize.hops).toBe(0);
    const up = decimalAdd({ text: '9.999', exp: 0 }, { text: '9.999', exp: -3 });
    expect([up.add.sum, up.round.after, up.round.decision]).toEqual(['10.008', '1.001', 'up']);
    const down = decimalAdd({ text: '9.000', exp: 0 }, { text: '1.002', exp: 0 });
    expect([down.add.sum, down.round.after, down.round.decision]).toEqual([
      '10.002',
      '1.000',
      'down',
    ]);
    const tie = decimalAdd({ text: '9.000', exp: 0 }, { text: '1.005', exp: 0 });
    expect([tie.add.sum, tie.round.after, tie.round.decision]).toEqual([
      '10.005',
      '1.000',
      'tie-even-down',
    ]);
    const exact = decimalAdd({ text: '9.000', exp: 0 }, { text: '1.000', exp: 0 });
    expect([exact.add.sum, exact.round.after, exact.round.decision]).toEqual([
      '10.000',
      '1.000',
      'exact',
    ]);
    const biggest = decimalAdd({ text: '9.999', exp: 0 }, { text: '9.999', exp: 0 });
    expect([biggest.add.sum, biggest.result.text, biggest.result.exp]).toEqual([
      '19.998',
      '2.000',
      1,
    ]);
    expect(scaledText(5n, 3)).toBe('0.005');
    expect(scaledText(7n, 0)).toBe('7');
  });
  it('rejects significands that are not normalized p-digit numbers', () => {
    expect(() => decimalAdd({ text: '10.0', exp: 0 }, { text: '1', exp: 0 })).toThrow();
    expect(() => decimalAdd({ text: '1.23456', exp: 0 }, { text: '1', exp: 0 })).toThrow();
  });
  it('property: result is the 4-digit number nearest to big + truncated small, ties to even', () => {
    const sig = fc.tuple(fc.integer({ min: 1, max: 9 }), fc.integer({ min: 0, max: 999 }));
    const e = fc.integer({ min: -5, max: 5 });
    fc.assert(
      fc.property(sig, sig, e, e, ([i1, f1], [i2, f2], e1, e2) => {
        const a = { text: `${i1}.${String(f1).padStart(3, '0')}`, exp: e1 };
        const b = { text: `${i2}.${String(f2).padStart(3, '0')}`, exp: e2 };
        const r = decimalAdd(a, b);
        const exact = BigInt(r.add.sum.replace('.', ''));
        const res = BigInt(r.result.text.replace('.', ''));
        const unit = 10n ** BigInt(r.result.exp - r.add.exp);
        const diff = res * unit - exact;
        const abs = diff < 0n ? -diff : diff;
        expect(2n * abs <= unit).toBe(true);
        if (2n * abs === unit) expect(res % 2n).toBe(0n);
        expect(r.result.text).toMatch(/^[1-9]\.\d{3}$/);
        return true;
      }),
      { numRuns: 5_000 },
    );
  });
});
