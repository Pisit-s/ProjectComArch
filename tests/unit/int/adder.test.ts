import { describe, expect, it } from 'vitest';
import {
  type Width,
  addBits,
  fromSigned,
  mask,
  shiftRight,
  signedRange,
  subBits,
  toBits,
  toSigned,
} from '@/lib/int/adder';

const inRange = (w: Width, n: number) => n >= signedRange(w).min && n <= signedRange(w).max;

describe('exhaustive 4- and 8-bit add / sub', () => {
  for (const w of [4, 8] as Width[]) {
    it(`width ${w}`, () => {
      for (let a = 0; a <= mask(w); a++) {
        for (let b = 0; b <= mask(w); b++) {
          const s = addBits(w, a, b);
          expect(s.result).toBe((a + b) % (1 << w));
          expect(s.carryOut).toBe(a + b > mask(w) ? 1 : 0);
          expect(s.unsignedOverflow).toBe(a + b > mask(w));
          // slide w03c page 10: overflow only when the signed sum leaves the range
          expect(s.signedOverflow).toBe(!inRange(w, toSigned(w, a) + toSigned(w, b)));
          const d = subBits(w, a, b);
          expect(d.result).toBe((((a - b) % (1 << w)) + (1 << w)) % (1 << w));
          expect(d.signedOverflow).toBe(!inRange(w, toSigned(w, a) - toSigned(w, b)));
          expect(d.negB).toBe((-b & mask(w)) >>> 0);
        }
      }
    });
  }
});

describe('golden D.2 (slides w03c)', () => {
  const cases: [number, number, string, number, boolean, number][] = [
    [3, 2, '0101', 5, false, 0],
    [3, -2, '0001', 1, false, 1],
    [-3, 2, '1111', -1, false, 0],
    [-3, -2, '1011', -5, false, 1],
    [4, 5, '1001', -7, true, 0],
    [4, -5, '1111', -1, false, 0],
    [-4, 5, '0001', 1, false, 1],
    [-4, -5, '0111', 7, true, 1],
  ];
  for (const [x, y, bits, signed, ovf, cout] of cases) {
    it(`${x} + ${y}`, () => {
      const r = addBits(4, fromSigned(4, x), fromSigned(4, y));
      expect(toBits(4, r.result)).toBe(bits);
      expect(toSigned(4, r.result)).toBe(signed);
      expect(r.signedOverflow).toBe(ovf);
      expect(r.carryOut).toBe(cout);
    });
  }
  it('7 + 6 in 8 bits: carries into columns 1-4 are 0 1 1 0', () => {
    const r = addBits(8, 7, 6);
    expect(toBits(8, r.result)).toBe('00001101');
    expect(r.result).toBe(13);
    expect(r.columns.slice(1, 5).map((c) => c.cin)).toEqual([0, 1, 1, 0]);
    expect(r.columns.slice(4).every((c) => c.a === 0 && c.b === 0 && c.cout === 0)).toBe(true);
  });
  it('7 + 6 in 4 bits overflows as signed', () => {
    const r = addBits(4, 7, 6);
    expect(toBits(4, r.result)).toBe('1101');
    expect(toSigned(4, r.result)).toBe(-3);
    expect(r.signedOverflow).toBe(true);
  });
  it('7 - 6 in 4 bits', () => {
    const r = subBits(4, 7, 6);
    expect(toBits(4, r.inverted)).toBe('1001');
    expect(toBits(4, r.negB)).toBe('1010');
    expect(r.add.carryIn).toBe(1);
    expect(r.add.carryOut).toBe(1);
    expect(toBits(4, r.result)).toBe('0001');
  });
  it('shift right', () => {
    expect([1, 2, 3].map((s) => shiftRight(8, 104, s).value)).toEqual([52, 26, 13]);
    expect(shiftRight(8, 104, 3).lost).toEqual([0, 0, 0]);
    expect(shiftRight(8, 13, 1)).toEqual({ value: 6, lost: [1] });
  });
  it('range checks', () => {
    expect(() => addBits(4, 16, 0)).toThrow();
    expect(() => shiftRight(4, 1, 5)).toThrow();
    expect(() => fromSigned(4, 8)).toThrow();
    expect(signedRange(4)).toEqual({ min: -8, max: 7 });
    expect(toSigned(8, 0x80)).toBe(-128);
  });
});
