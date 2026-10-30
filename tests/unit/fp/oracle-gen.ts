import fc from 'fast-check';
import { type Op, isNaNBits, operate } from '@/lib/fp';
import { F32, bitsFromF32, f32FromBits } from './helpers';

const FRAC_MAX = (1n << 23n) - 1n;
const packBits = (s: bigint, e: bigint, f: bigint): bigint => (s << 31n) | (e << 23n) | f;

const sign = fc.bigInt(0n, 1n);
const frac = fc.bigInt(0n, FRAC_MAX);

/** 1. any 32-bit pattern */
export const anyBits = fc.bigInt(0n, 0xffffffffn);
/** 2. normal numbers */
export const normalBits = fc
  .tuple(sign, fc.bigInt(1n, 254n), frac)
  .map(([s, e, f]) => packBits(s, e, f));
/** 3. exponent near 127 (everyday values) */
export const nearOneBits = fc
  .tuple(sign, fc.bigInt(117n, 137n), frac)
  .map(([s, e, f]) => packBits(s, e, f));
/** 4. subnormal numbers */
export const subnormalBits = fc
  .tuple(sign, fc.bigInt(1n, FRAC_MAX))
  .map(([s, f]) => packBits(s, 0n, f));
/** 5. edges of the exponent and fraction ranges */
export const edgeBits = fc
  .tuple(
    sign,
    fc.constantFrom(0n, 1n, 2n, 125n, 126n, 127n, 128n, 253n, 254n, 255n),
    fc.constantFrom(0n, 1n, 2n, FRAC_MAX, FRAC_MAX - 1n, 1n << 22n),
  )
  .map(([s, e, f]) => packBits(s, e, f));
/** 6. short significands: only the top k fraction bits are random, so ties happen often */
export const shortBits = fc
  .tuple(sign, fc.bigInt(100n, 154n), fc.integer({ min: 0, max: 5 }), frac)
  .map(([s, e, k, f]) => packBits(s, e, k === 0 ? 0n : (f >> BigInt(23 - k)) << BigInt(23 - k)));

/** Pairs whose values are close (cancellation in a - b and a + (-b)). */
export const closePair = fc
  .tuple(nearOneBits, fc.bigInt(-64n, 64n), fc.boolean())
  .map(([a, delta, flip]) => {
    let b = (a & 0x7fffffffn) + delta;
    if (b < 0n) b = 0n;
    if (b > 0x7f7fffffn) b = 0x7f7fffffn;
    const s = flip ? (a >> 31n) ^ 1n : a >> 31n;
    return [a, (s << 31n) | b] as [bigint, bigint];
  });

export const PAIR_KINDS: [string, fc.Arbitrary<[bigint, bigint]>][] = [
  ['any', fc.tuple(anyBits, anyBits)],
  ['normal', fc.tuple(normalBits, normalBits)],
  ['near 127 + close pairs', fc.oneof(fc.tuple(nearOneBits, nearOneBits), closePair)],
  [
    'subnormal',
    fc.oneof(
      fc.tuple(subnormalBits, subnormalBits),
      fc.tuple(subnormalBits, normalBits),
      fc.tuple(normalBits, subnormalBits),
    ),
  ],
  ['edges', fc.tuple(edgeBits, edgeBits)],
  ['short significand', fc.tuple(shortBits, shortBits)],
];

export function oracle(op: Op, a: bigint, b: bigint): number {
  const x = f32FromBits(a);
  const y = f32FromBits(b);
  switch (op) {
    case '+':
      return Math.fround(x + y);
    case '-':
      return Math.fround(x - y);
    case '*':
      return Math.fround(x * y);
    case '/':
      return Math.fround(x / y);
  }
}

/** Engine bits equal Math.fround bits (NaN only needs to be NaN on both sides). */
export function matchesOracle(op: Op, a: bigint, b: bigint): boolean {
  const got = operate(F32, op, a, b).bits;
  const want = oracle(op, a, b);
  if (Number.isNaN(want)) return isNaNBits(F32, got);
  return got === bitsFromF32(want);
}
