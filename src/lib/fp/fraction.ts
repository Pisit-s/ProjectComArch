import type { Bit } from './format';
import { type ParseError, parseDecimal } from './parse';
import { type Rational, ZERO, add, cmp, ONE, pow2, rat, sub } from './rational';
import type { FracRow } from './steps';

/** How far the repeat detector looks before giving up (very long cycles are not shown). */
export const REPEAT_SEARCH_LIMIT = 2048;

export interface Repeat {
  /** 1-based index of the first repeating bit after the point. */
  start: number;
  length: number;
}

export interface FractionConversion {
  input: Rational;
  nBits: number;
  rows: FracRow[];
  /** Bits after the point, at most nBits (shorter when the expansion ends first). */
  bits: string;
  approx: Rational;
  /** input - approx (>= 0, truncation) */
  error: Rational;
  /** The expansion ends within nBits. */
  terminated: boolean;
  /** Total bits of a terminating expansion (null when it repeats or is too long to find). */
  terminatesAt: number | null;
  repeat: Repeat | null;
}

export type FractionError = ParseError | { kind: 'out-of-range' };
export type FractionOutcome =
  ({ ok: true } & FractionConversion) | { ok: false; error: FractionError };

const doubleStep = (v: Rational): { doubled: Rational; bit: Bit; rest: Rational } => {
  const doubled = rat(v.num * 2n, v.den);
  const bit: Bit = doubled.num >= doubled.den ? 1 : 0;
  return { doubled, bit, rest: bit ? sub(doubled, ONE) : doubled };
};

/** Value of 0.b1b2b3... */
export function fractionValue(bits: string): Rational {
  let v = ZERO;
  for (let i = 0; i < bits.length; i++) if (bits[i] === '1') v = add(v, pow2(-(i + 1)));
  return v;
}

/** Repeated multiplication by 2 with exact rationals (Chapter 2). Accepts 0 <= x < 1. */
export function fractionToBinary(text: string, nBits: number): FractionOutcome {
  const parsed = parseDecimal(text);
  if (!parsed.ok) return parsed;
  if (parsed.kind !== 'finite') return { ok: false, error: { kind: 'out-of-range' } };
  const x = parsed.magnitude;
  if ((parsed.negative && x.num !== 0n) || cmp(x, ONE) >= 0) {
    return { ok: false, error: { kind: 'out-of-range' } };
  }
  return { ok: true, ...convertFraction(x, nBits) };
}

export function convertFraction(x: Rational, nBits: number): FractionConversion {
  const rows: FracRow[] = [];
  let v = x;
  while (v.num !== 0n && rows.length < nBits) {
    const st = doubleStep(v);
    rows.push({ value: v, doubled: st.doubled, bit: st.bit });
    v = st.rest;
  }
  const bits = rows.map((r) => r.bit).join('');
  const approx = fractionValue(bits);

  // Separate pass for the repeat: remember the remainder seen before each bit.
  const seen = new Map<string, number>();
  let w = x;
  let terminatesAt: number | null = null;
  let repeat: Repeat | null = null;
  for (let k = 1; k <= REPEAT_SEARCH_LIMIT; k++) {
    if (w.num === 0n) {
      terminatesAt = k - 1;
      break;
    }
    const key = `${w.num}/${w.den}`;
    const prev = seen.get(key);
    if (prev !== undefined) {
      repeat = { start: prev, length: k - prev };
      break;
    }
    seen.set(key, k);
    w = doubleStep(w).rest;
  }

  return {
    input: x,
    nBits,
    rows,
    bits,
    approx,
    error: sub(x, approx),
    terminated: v.num === 0n,
    terminatesAt,
    repeat,
  };
}
