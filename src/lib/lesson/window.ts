import { type FloatFormat, R, type Rational, bias, decode, formatRational } from '@/lib/fp';

/**
 * Exponent window of scene 3.2: the exponent picks the range [2^e, 2^(e+1)) and the
 * significand picks the position inside it (0 at the left end, 1 at the right end).
 */
export interface ExponentWindow {
  e: number;
  lo: string;
  hi: string;
  pos: Rational;
}

export function exponentWindow(fmt: FloatFormat, bits: bigint): ExponentWindow | null {
  const d = decode(fmt, bits);
  if (d.cls !== 'normal') return null;
  const e = d.expField - bias(fmt);
  return {
    e,
    lo: formatRational(R.pow2(e)),
    hi: formatRational(R.pow2(e + 1)),
    pos: R.rat(d.fracField, 1n << BigInt(fmt.fracBits)),
  };
}
