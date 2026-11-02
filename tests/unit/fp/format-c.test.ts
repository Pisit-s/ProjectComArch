import { describe, expect, it } from 'vitest';
import { BINARY32, addSub, encodeBits, printfFixed } from '@/lib/fp';
import { addBits } from '@/lib/int/adder';

const F = BINARY32;
const sum = (a: string, b: string) => addSub(F, encodeBits(F, a)!, encodeBits(F, b)!, '+').bits;

describe('printfFixed (golden D.4)', () => {
  it('int 7 + 6 prints 13 (from the adder model)', () => {
    expect(String(addBits(8, 7, 6).result)).toBe('13');
  });
  it('6.5f + 3.75f with %f', () => expect(printfFixed(F, sum('6.5', '3.75'))).toBe('10.250000'));
  it('0.1f + 0.2f with %.9f', () =>
    expect(printfFixed(F, sum('0.1', '0.2'), 9)).toBe('0.300000012'));
  it('16777216.0f + 1.0f with %f', () =>
    expect(printfFixed(F, sum('16777216', '1'))).toBe('16777216.000000'));
  it('ties to even on the exact value, signs and specials', () => {
    expect(printfFixed(F, encodeBits(F, '0.125')!, 2)).toBe('0.12');
    expect(printfFixed(F, encodeBits(F, '0.375')!, 2)).toBe('0.38');
    expect(printfFixed(F, encodeBits(F, '2.5')!, 0)).toBe('2');
    expect(printfFixed(F, encodeBits(F, '-1.5')!, 0)).toBe('-2');
    expect(printfFixed(F, encodeBits(F, '-0')!)).toBe('-0.000000');
    expect(printfFixed(F, encodeBits(F, '0.1')!)).toBe('0.100000');
    expect(printfFixed(F, encodeBits(F, 'inf')!)).toBe('inf');
    expect(printfFixed(F, encodeBits(F, '-inf')!)).toBe('-inf');
    expect(printfFixed(F, encodeBits(F, 'nan')!)).toBe('nan');
    expect(printfFixed(F, 0xffc00000n)).toBe('-nan');
  });
});
