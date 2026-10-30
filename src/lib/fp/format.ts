/**
 * Generic binary interchange format: 1 sign bit, `expBits` exponent bits, `fracBits` fraction bits.
 * All derived quantities that are bit patterns are bigint; exponents stay in safe-integer range as number.
 */
export interface FloatFormat {
  readonly name: string;
  readonly expBits: number;
  readonly fracBits: number;
}

export const BINARY32: FloatFormat = { name: 'binary32', expBits: 8, fracBits: 23 };
export const BINARY16: FloatFormat = { name: 'binary16', expBits: 5, fracBits: 10 };
export const BINARY64: FloatFormat = { name: 'binary64', expBits: 11, fracBits: 52 };
/** 1-4-3 minifloat, bias 7. Small enough to test every operand pair exhaustively. */
export const MINI8: FloatFormat = { name: 'mini8', expBits: 4, fracBits: 3 };

export type Bit = 0 | 1;

export interface Fields {
  sign: Bit;
  /** Biased exponent field value. */
  exp: number;
  /** Fraction field value. */
  frac: bigint;
}

export const bias = (fmt: FloatFormat): number => 2 ** (fmt.expBits - 1) - 1;
export const emin = (fmt: FloatFormat): number => 1 - bias(fmt);
export const emax = (fmt: FloatFormat): number => bias(fmt);
/** Precision in bits, including the hidden bit. */
export const precision = (fmt: FloatFormat): number => fmt.fracBits + 1;
export const width = (fmt: FloatFormat): number => 1 + fmt.expBits + fmt.fracBits;
/** All-ones exponent field (infinity / NaN). */
export const expFieldMax = (fmt: FloatFormat): number => 2 ** fmt.expBits - 1;

export const fracMask = (fmt: FloatFormat): bigint => (1n << BigInt(fmt.fracBits)) - 1n;
export const hiddenBit = (fmt: FloatFormat): bigint => 1n << BigInt(fmt.fracBits);
export const signMask = (fmt: FloatFormat): bigint => 1n << BigInt(width(fmt) - 1);
export const allOnes = (fmt: FloatFormat): bigint => (1n << BigInt(width(fmt))) - 1n;

export function pack(fmt: FloatFormat, sign: Bit, exp: number, frac: bigint): bigint {
  return (
    (BigInt(sign) << BigInt(width(fmt) - 1)) |
    (BigInt(exp) << BigInt(fmt.fracBits)) |
    (frac & fracMask(fmt))
  );
}

export function fieldsOf(fmt: FloatFormat, bits: bigint): Fields {
  return {
    sign: ((bits >> BigInt(width(fmt) - 1)) & 1n) === 1n ? 1 : 0,
    exp: Number((bits >> BigInt(fmt.fracBits)) & BigInt(expFieldMax(fmt))),
    frac: bits & fracMask(fmt),
  };
}

export const zeroBits = (fmt: FloatFormat, sign: Bit): bigint => pack(fmt, sign, 0, 0n);
export const infBits = (fmt: FloatFormat, sign: Bit): bigint =>
  pack(fmt, sign, expFieldMax(fmt), 0n);
/** Canonical quiet NaN: positive, top fraction bit set (binary32: 0x7FC00000). */
export const nanBits = (fmt: FloatFormat): bigint =>
  pack(fmt, 0, expFieldMax(fmt), 1n << BigInt(fmt.fracBits - 1));

export type FloatClass = 'zero' | 'subnormal' | 'normal' | 'infinity' | 'nan';

export function classify(fmt: FloatFormat, bits: bigint): FloatClass {
  const { exp, frac } = fieldsOf(fmt, bits);
  if (exp === 0) return frac === 0n ? 'zero' : 'subnormal';
  if (exp === expFieldMax(fmt)) return frac === 0n ? 'infinity' : 'nan';
  return 'normal';
}

export const isNaNBits = (fmt: FloatFormat, bits: bigint): boolean => classify(fmt, bits) === 'nan';

/** Number of bits needed to write n (n >= 0); bitLength(0) = 0. */
export function bitLength(n: bigint): number {
  return n === 0n ? 0 : n.toString(2).length;
}
