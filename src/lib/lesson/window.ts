import { type FloatFormat, R, type Rational, bias, decode } from '@/lib/fp';
import { powLabel } from './encode-frames';

/**
 * Exponent window of scene 3.2: the exponent picks the range [2^e, 2^(e+1)) and the
 * significand picks the position inside it (0 at the left end, 1 at the right end).
 */
export interface ExponentWindow {
  e: number;
  lo: string;
  hi: string;
  pos: Rational;
  /** Range boundaries around the current one: 2^(e-2) ... 2^(e+3), with short labels. */
  ticks: { k: number; label: string }[];
}

/** How many ranges are drawn on each side of the current one. */
export const WINDOW_SIDE = 2;

export function exponentWindow(fmt: FloatFormat, bits: bigint): ExponentWindow | null {
  const d = decode(fmt, bits);
  if (d.cls !== 'normal') return null;
  const e = d.expField - bias(fmt);
  return {
    e,
    lo: powLabel(e),
    hi: powLabel(e + 1),
    pos: R.rat(d.fracField, 1n << BigInt(fmt.fracBits)),
    ticks: Array.from({ length: 2 * WINDOW_SIDE + 2 }, (_, i) => {
      const k = e - WINDOW_SIDE + i;
      return { k, label: powLabel(k) };
    }),
  };
}
