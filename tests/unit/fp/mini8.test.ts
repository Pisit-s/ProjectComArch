import { describe, expect, it } from 'vitest';
import { MINI8, OPS, type Op, classify, decode, fieldsOf, isNaNBits, operate } from '@/lib/fp';

/**
 * Exhaustive 1-4-3 minifloat check against a brute-force oracle written independently of
 * roundPack: every finite value is an integer number of units u = 2^-9, so the exact result
 * N/D (in units) is compared against all 256 patterns with integer arithmetic.
 */
const UNIT_EXP = -9; // emin - fracBits = -6 - 3
const MAX_UNITS = 240 * 512; // largest finite value 240
const OVERFLOW_UNITS = MAX_UNITS + 4096; // max + ulp/2 (ulp at max = 16 = 8192 units)

const ALL = Array.from({ length: 256 }, (_, i) => BigInt(i));

function units(bits: bigint): number {
  const d = decode(MINI8, bits);
  // significand * 2^(exponent - fracBits) in units of 2^-9
  const m = Number(d.significand) * 2 ** (d.exponent - 3 - UNIT_EXP);
  return d.sign ? -m : m;
}

function asNumber(bits: bigint): number {
  const c = classify(MINI8, bits);
  const s = fieldsOf(MINI8, bits).sign ? -1 : 1;
  if (c === 'nan') return NaN;
  if (c === 'infinity') return s * Infinity;
  if (c === 'zero') return s * 0;
  return units(bits) * 2 ** UNIT_EXP;
}

const FINITE = ALL.filter((b) => {
  const c = classify(MINI8, b);
  return c !== 'nan' && c !== 'infinity';
}).map((b) => ({ bits: b, u: units(b), neg: fieldsOf(MINI8, b).sign === 1 }));

const INF_POS = 0b0_1111_000n;
const INF_NEG = 0b1_1111_000n;

function bruteForce(op: Op, a: bigint, b: bigint): bigint | 'nan' {
  const x = asNumber(a);
  const y = asNumber(b);
  const js = op === '+' ? x + y : x - y;
  if (Number.isNaN(js)) return 'nan';
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    // special operands: IEEE double semantics give the same class and sign
    if (js === Infinity) return INF_POS;
    if (js === -Infinity) return INF_NEG;
    return Object.is(js, -0) ? 0b1_0000_000n : 0n;
  }
  if (js === 0) return Object.is(js, -0) ? 0b1_0000_000n : 0n;

  // exact result N in units
  const ua = units(a);
  const ub = units(b);
  const N = op === '+' ? ua + ub : ua - ub;
  const negative = N < 0;
  if (Math.abs(N) >= OVERFLOW_UNITS) return negative ? INF_NEG : INF_POS;

  let best: (typeof FINITE)[number] | null = null;
  let bestDist = Infinity;
  for (const c of FINITE) {
    if (c.neg !== negative) continue;
    const dist = Math.abs(c.u - N);
    if (dist < bestDist || (dist === bestDist && (c.bits & 1n) === 0n)) {
      best = c;
      bestDist = dist;
    }
  }
  return best!.bits;
}

describe('MINI8 exhaustive (256 x 256 x 4)', () => {
  for (const op of OPS) {
    it(`op ${op}`, () => {
      let checked = 0;
      const failures: string[] = [];
      for (const a of ALL) {
        for (const b of ALL) {
          const got = operate(MINI8, op, a, b).bits;
          const want = bruteForce(op, a, b);
          const ok = want === 'nan' ? isNaNBits(MINI8, got) : got === want;
          if (!ok && failures.length < 5)
            failures.push(`${a} ${op} ${b}: got ${got}, want ${want}`);
          checked++;
        }
      }
      expect(failures).toEqual([]);
      expect(checked).toBe(65536);
    });
  }
});
