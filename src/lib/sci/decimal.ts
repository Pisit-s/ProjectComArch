/**
 * Decimal scientific notation for Chapter 2 (normalize, slide w03c_mult page 13) and the
 * 4-digit addition warm-up of Chapter 5 (P&H 3.5). Digits are strings and BigInt; no Number math.
 */

export interface SciState {
  /** Significand as written, e.g. "0.02", "9.8702". */
  text: string;
  /** Power of ten. */
  exp: number;
}

export interface Normalization {
  states: SciState[];
  /** Input was already normalized (one non-zero digit before the point). */
  already: boolean;
  /** Direction the point hops. */
  direction: 'left' | 'right' | 'none';
}

const DIGITS = /^(\d+)(?:\.(\d*))?$/;

function render(digits: string, point: number): string {
  const padded = point > digits.length ? digits.padEnd(point, '0') : digits;
  const int = padded.slice(0, point).replace(/^0+(?=\d)/, '') || '0';
  const frac = padded.slice(point);
  return frac ? `${int}.${frac}` : int;
}

/**
 * Hop the point one digit at a time until exactly one non-zero digit stays before it.
 * Works for any base written with digits (the binary chip "110.1" uses it too).
 */
export function normalizeDecimal(text: string, exp: number): Normalization {
  const m = DIGITS.exec(text.trim());
  if (!m) throw new RangeError(`not a plain decimal: ${text}`);
  const digits = m[1] + (m[2] ?? '');
  const first = digits.search(/[1-9]/);
  if (first < 0) throw new RangeError('zero cannot be normalized');
  let point = m[1].length;
  const target = first + 1;
  const states: SciState[] = [{ text: render(digits, point), exp }];
  let e = exp;
  while (point !== target) {
    if (point < target) {
      point += 1;
      e -= 1;
    } else {
      point -= 1;
      e += 1;
    }
    states.push({ text: render(digits, point), exp: e });
  }
  const direction = states.length === 1 ? 'none' : point > m[1].length ? 'right' : 'left';
  return { states, already: states.length === 1, direction };
}

export type DecimalDecision = 'exact' | 'down' | 'up' | 'tie-even-down' | 'tie-even-up';

export interface DecimalAddition {
  p: number;
  a: SciState;
  b: SciState;
  /** Which operand has the larger exponent (the other one is shifted). */
  big: 'a' | 'b';
  d: number;
  align: { before: string; after: string; lost: string; exp: number };
  add: { big: string; small: string; sum: string; exp: number };
  normalize: { before: string; after: string; exp: number; hops: number };
  round: { before: string; after: string; exp: number; decision: DecimalDecision };
  result: SciState;
}

const TEN = 10n;
const pow10 = (k: number): bigint => TEN ** BigInt(k);

/** Fixed-point text with exactly `scale` digits after the point. */
export function scaledText(n: bigint, scale: number): string {
  const s = n.toString().padStart(scale + 1, '0');
  return scale === 0 ? s : `${s.slice(0, s.length - scale)}.${s.slice(s.length - scale)}`;
}

function parseNormalized(x: SciState, p: number): bigint {
  const m = /^([1-9])(?:\.(\d*))?$/.exec(x.text);
  if (!m || (m[2] ?? '').length > p - 1) {
    throw new RangeError(`${x.text} is not a normalized ${p}-digit significand`);
  }
  return BigInt(m[1] + (m[2] ?? '').padEnd(p - 1, '0'));
}

/**
 * Add two positive normalized numbers that keep only p significant digits (P&H 3.5):
 * the smaller one is shifted right and digits past the p-th fall off, the sum is
 * normalized, then rounded back to p digits (round half to even).
 */
export function decimalAdd(a: SciState, b: SciState, p = 4): DecimalAddition {
  const scale = p - 1;
  const va = parseNormalized(a, p);
  const vb = parseNormalized(b, p);
  const big: 'a' | 'b' = a.exp >= b.exp ? 'a' : 'b';
  const [hi, lo, eHi, eLo] = big === 'a' ? [va, vb, a.exp, b.exp] : [vb, va, b.exp, a.exp];
  const d = eHi - eLo;

  const aligned = lo / pow10(d);
  const lostDigits =
    d === 0 ? '' : (lo % pow10(d)).toString().padStart(d, '0').slice(-Math.min(d, p));
  const sum = hi + aligned;

  // normalize: the sum of two values below 10 is below 20, so at most one hop left
  const hops = sum >= pow10(p) ? 1 : 0;
  const normScale = scale + hops;
  const eNorm = eHi + hops;

  // after the hop the value is below 2.000, so rounding up can never carry past 9.999
  let rounded = sum;
  let decision: DecimalDecision = 'exact';
  if (hops === 1) {
    const q = sum / TEN;
    const r = sum % TEN;
    if (r === 0n) decision = 'exact';
    else if (r < 5n) decision = 'down';
    else if (r > 5n) decision = 'up';
    else decision = q % 2n === 0n ? 'tie-even-down' : 'tie-even-up';
    rounded = decision === 'up' || decision === 'tie-even-up' ? q + 1n : q;
  }

  return {
    p,
    a,
    b,
    big,
    d,
    align: {
      before: scaledText(lo, scale),
      after: scaledText(aligned, scale),
      lost: lostDigits,
      exp: eHi,
    },
    add: {
      big: scaledText(hi, scale),
      small: scaledText(aligned, scale),
      sum: scaledText(sum, scale),
      exp: eHi,
    },
    normalize: {
      before: scaledText(sum, scale),
      after: scaledText(sum, normScale),
      exp: eNorm,
      hops,
    },
    round: {
      before: scaledText(sum, normScale),
      after: scaledText(rounded, scale),
      exp: eNorm,
      decision,
    },
    result: { text: scaledText(rounded, scale), exp: eNorm },
  };
}
