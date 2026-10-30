import { R, type Rational, formatRational } from '@/lib/fp';

/** Split a fixed-point bigint into binary integer and fraction digits (string slicing only). */
export function fixedPoint(
  value: bigint,
  fracBits: number,
  minInt = 1,
): { int: string; frac: string } {
  const s = value.toString(2).padStart(fracBits + minInt, '0');
  return { int: s.slice(0, s.length - fracBits) || '0', frac: s.slice(s.length - fracBits) };
}

export const fixedString = (value: bigint, fracBits: number, minInt = 1): string => {
  const { int, frac } = fixedPoint(value, fracBits, minInt);
  return frac ? `${int}.${frac}` : int;
};

/** Drop trailing zeros of a fraction string (keep at least `keep`). */
export function trimZeros(frac: string, keep = 1): string {
  const t = frac.replace(/0+$/, '');
  return t.length >= keep ? t : frac.slice(0, keep);
}

export const fmt = (r: Rational | null, maxSignificant?: number): string =>
  r === null ? '' : formatRational(r, maxSignificant ? { maxSignificant } : {});

export const isZero = (r: Rational | null): boolean => r !== null && R.isZero(r);

/** Unsigned binary of an exponent field value, or null when it does not fit. */
export function bin8(n: number, bits = 8): string | null {
  return n >= 0 && n < 2 ** bits ? n.toString(2).padStart(bits, '0') : null;
}
