import { bitLength } from './format';

/** Exact rational number, always reduced with den > 0. */
export interface Rational {
  readonly num: bigint;
  readonly den: bigint;
}

const abs = (n: bigint): bigint => (n < 0n ? -n : n);

export function gcd(a: bigint, b: bigint): bigint {
  a = abs(a);
  b = abs(b);
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function rat(num: bigint, den: bigint = 1n): Rational {
  if (den === 0n) throw new RangeError('zero denominator');
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  return g > 1n ? { num: num / g, den: den / g } : { num, den };
}

export const ZERO: Rational = { num: 0n, den: 1n };
export const ONE: Rational = { num: 1n, den: 1n };

/** 2^k for any integer k. */
export function pow2(k: number): Rational {
  return k >= 0 ? { num: 1n << BigInt(k), den: 1n } : { num: 1n, den: 1n << BigInt(-k) };
}

export const add = (a: Rational, b: Rational): Rational =>
  rat(a.num * b.den + b.num * a.den, a.den * b.den);
export const sub = (a: Rational, b: Rational): Rational =>
  rat(a.num * b.den - b.num * a.den, a.den * b.den);
export const mul = (a: Rational, b: Rational): Rational => rat(a.num * b.num, a.den * b.den);
export function div(a: Rational, b: Rational): Rational {
  if (b.num === 0n) throw new RangeError('division by zero');
  return rat(a.num * b.den, a.den * b.num);
}
export const neg = (a: Rational): Rational => ({ num: -a.num, den: a.den });
export const absR = (a: Rational): Rational => ({ num: abs(a.num), den: a.den });

export function cmp(a: Rational, b: Rational): -1 | 0 | 1 {
  const d = a.num * b.den - b.num * a.den;
  return d < 0n ? -1 : d > 0n ? 1 : 0;
}

export const eq = (a: Rational, b: Rational): boolean => a.num === b.num && a.den === b.den;
export const isZero = (a: Rational): boolean => a.num === 0n;

/** floor(a) for any sign. */
export function floor(a: Rational): bigint {
  const q = a.num / a.den;
  return a.num < 0n && q * a.den !== a.num ? q - 1n : q;
}

/** Multiply by 2^k exactly. */
export function scale2(a: Rational, k: number): Rational {
  return k >= 0 ? rat(a.num << BigInt(k), a.den) : rat(a.num, a.den << BigInt(-k));
}

/** floor(log2(a)) for a > 0, exact. */
export function floorLog2(a: Rational): number {
  if (a.num <= 0n) throw new RangeError('floorLog2 needs a positive value');
  let e = bitLength(a.num) - bitLength(a.den);
  // 2^e <= a < 2^(e+1) after at most one adjustment each way
  if (cmp(a, pow2(e)) < 0) e -= 1;
  else if (cmp(a, pow2(e + 1)) >= 0) e += 1;
  return e;
}

/** floor(log10(a)) for a > 0, exact. */
export function floorLog10(a: Rational): number {
  if (a.num <= 0n) throw new RangeError('floorLog10 needs a positive value');
  let e = a.num.toString().length - a.den.toString().length;
  const p10 = (k: number): Rational =>
    k >= 0 ? { num: 10n ** BigInt(k), den: 1n } : { num: 1n, den: 10n ** BigInt(-k) };
  while (cmp(a, p10(e)) < 0) e -= 1;
  while (cmp(a, p10(e + 1)) >= 0) e += 1;
  return e;
}

export const fromBigInt = (n: bigint): Rational => ({ num: n, den: 1n });
