import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  BINARY16,
  BINARY64,
  MINI8,
  R,
  type Rational,
  decode,
  encodeBits,
  encodeDecimal,
  isNaNBits,
  shortestDecimal,
} from '@/lib/fp';
import { F32, bitsFromF32, stepOf } from './helpers';
import { anyBits, edgeBits, subnormalBits } from './oracle-gen';

const decimalText = fc
  .tuple(
    fc.boolean(),
    fc.stringMatching(/^[1-9][0-9]{0,8}$/),
    fc.integer({ min: -45, max: 38 }),
    fc.integer({ min: 0, max: 3 }),
  )
  .map(([neg, digits, exp, style]) => {
    const sign = neg ? '-' : '';
    // several spellings of the same kind of number
    if (style === 0) return `${sign}${digits}e${exp}`;
    if (style === 1) return `${sign}${digits[0]}.${digits.slice(1) || '0'}e${exp}`;
    if (style === 2) return `${sign}0.${digits}E${exp + digits.length}`;
    return `${sign}${digits}.e${exp}`;
  });

/** |x - stored| as an exact rational (stored is finite). */
function distance(text: string, bits: bigint): Rational {
  const r = encodeDecimal(F32, text);
  if (!r.ok || !r.exact) throw new Error(text);
  return R.absR(R.sub(r.exact, decode(F32, bits).value!));
}

describe('encodeDecimal vs Math.fround(Number(s))', () => {
  it('random decimals with up to 9 significant digits', () => {
    fc.assert(
      fc.property(decimalText, (s) => {
        const got = encodeBits(F32, s)!;
        const want = bitsFromF32(Math.fround(Number(s)));
        if (got === want) return true;
        // Number(s) rounds twice; settle disagreements by exact distance
        const dGot = distance(s, got);
        const dWant = distance(s, want);
        return R.cmp(dGot, dWant) <= 0;
      }),
      { numRuns: 20_000 },
    );
  });

  it('E13 is the double-rounding case (Number gives 0x3F800002)', () => {
    const s = '1.00000017881393432617187499';
    expect(bitsFromF32(Math.fround(Number(s)))).toBe(0x3f800002n);
    expect(encodeBits(F32, s)).toBe(0x3f800001n);
  });
});

describe('round trip: encode(shortestDecimal(bits)) = bits', () => {
  it('random patterns (not NaN)', () => {
    fc.assert(
      fc.property(fc.oneof(anyBits, edgeBits, subnormalBits), (bits) => {
        if (isNaNBits(F32, bits)) return true;
        return encodeBits(F32, shortestDecimal(F32, bits)) === bits;
      }),
      { numRuns: 5_000 },
    );
  });

  it('known shortest forms', () => {
    expect(shortestDecimal(F32, 0x3dcccccdn)).toBe('0.1');
    expect(shortestDecimal(F32, 0x3e99999an)).toBe('0.3');
    expect(shortestDecimal(F32, 0x00000001n)).toBe('1e-45');
    expect(shortestDecimal(F32, 0x7f7fffffn)).toBe('3.4028235e+38');
    expect(shortestDecimal(F32, 0x80000000n)).toBe('-0');
    expect(shortestDecimal(F32, 0xc1540000n)).toBe('-13.25');
    expect(shortestDecimal(F32, 0x7f800000n)).toBe('Infinity');
    expect(shortestDecimal(F32, 0x7fc00000n)).toBe('NaN');
    expect(shortestDecimal(F32, 0x4b800001n)).toBe('16777218');
  });

  it('other formats', () => {
    for (const fmt of [MINI8, BINARY16]) {
      const n = 1n << BigInt(1 + fmt.expBits + fmt.fracBits);
      for (let b = 0n; b < n; b++) {
        if (isNaNBits(fmt, b)) continue;
        expect(encodeBits(fmt, shortestDecimal(fmt, b))).toBe(b);
      }
    }
    expect(shortestDecimal(BINARY64, encodeBits(BINARY64, '0.1')!)).toBe('0.1');
    expect(encodeBits(BINARY64, '0.1')).toBe(0x3fb999999999999an);
  });
});

describe('encode details', () => {
  it('special inputs', () => {
    for (const [text, bits] of [
      ['inf', 0x7f800000n],
      ['-Infinity', 0xff800000n],
      ['∞', 0x7f800000n],
      ['−∞', 0xff800000n],
      ['NaN', 0x7fc00000n],
      ['0', 0n],
      ['-0.000', 0x80000000n],
    ] as const) {
      const r = encodeDecimal(F32, text);
      expect(r.ok && r.bits).toBe(bits);
      if (r.ok) expect(r.equal).toBe(true);
    }
  });
  it('rejects bad text', () => {
    expect(encodeDecimal(F32, '1,5')).toEqual({ ok: false, error: { kind: 'comma' } });
    expect(encodeBits(F32, 'abc')).toBeNull();
  });
  it('huge and tiny magnitudes', () => {
    expect(encodeBits(F32, '1e99999')).toBe(0x7f800000n);
    expect(encodeBits(F32, '-1e-99999')).toBe(0x80000000n);
    const big = encodeDecimal(F32, '1e300');
    if (!big.ok) throw new Error();
    expect(stepOf(big, 'int-binary').rowsTruncated).toBe(true);
    expect(stepOf(big, 'int-binary').binary.length).toBe(256);
  });
  it('max finite rounds to infinity just above the midpoint', () => {
    // max = (2 - 2^-23) * 2^127, midpoint to 2^128 is (2 - 2^-24) * 2^127
    expect(encodeBits(F32, '340282356779733661637539395458142568447')).toBe(0x7f7fffffn);
    expect(encodeBits(F32, '340282356779733661637539395458142568448')).toBe(0x7f800000n);
  });
  it('rounding carries into the next binade', () => {
    const r = encodeDecimal(F32, '1.99999999');
    if (!r.ok) throw new Error();
    expect(r.bits).toBe(0x40000000n);
    expect(stepOf(r, 'round').carryOut).toBe(true);
  });
});
