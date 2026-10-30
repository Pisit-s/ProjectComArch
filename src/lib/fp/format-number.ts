import { decode } from './decode';
import { type Bit, type FloatFormat, precision } from './format';
import { roundRational } from './encode';
import { type Rational, absR, cmp, floor, floorLog10, mul, rat, sub } from './rational';

const pow10 = (k: number): bigint => 10n ** BigInt(k);

/** Decimal places needed for an exact expansion, or null when it does not terminate. */
function terminatingPlaces(den: bigint): number | null {
  let twos = 0;
  let fives = 0;
  while (den % 2n === 0n) {
    den /= 2n;
    twos++;
  }
  while (den % 5n === 0n) {
    den /= 5n;
    fives++;
  }
  return den === 1n ? Math.max(twos, fives) : null;
}

export interface FormatOptions {
  /** Maximum significant digits; the rest is cut and "…" appended. Default: all (40 if non-terminating). */
  maxSignificant?: number;
  /** Plain notation range: scientific below 1e-6 or from 1e21 (default true). */
  scientific?: boolean;
}

/**
 * Exact decimal text of a rational. Terminating values print every digit unless
 * maxSignificant cuts them; non-terminating values are cut and end with "…".
 */
export function formatRational(r: Rational, opts: FormatOptions = {}): string {
  if (r.num === 0n) return '0';
  const negative = r.num < 0n;
  const x = absR(r);
  const d = floorLog10(x);
  const places = terminatingPlaces(x.den);
  const needed = places === null ? Infinity : Math.max(1, d + 1 + places);
  const limit = opts.maxSignificant ?? (places === null ? 40 : Infinity);
  const s = Math.max(1, Math.min(needed, limit));

  // M = floor(x * 10^(s - 1 - d)) has exactly s digits
  const k = s - 1 - d;
  const scaled = k >= 0 ? rat(x.num * pow10(k), x.den) : rat(x.num, x.den * pow10(-k));
  const M = floor(scaled);
  const cutOff = M * scaled.den !== scaled.num;
  let digits = M.toString().replace(/0+$/, '');
  if (digits === '') digits = '0';

  const useSci = opts.scientific !== false && (d < -6 || d >= 21);
  let body: string;
  if (useSci) {
    body =
      digits[0] +
      (digits.length > 1 ? '.' + digits.slice(1) : '') +
      'e' +
      (d < 0 ? '-' : '+') +
      Math.abs(d);
    if (cutOff) body = body.replace(/e/, '…e');
  } else {
    if (d >= 0) {
      const intLen = d + 1;
      const intPart =
        digits.length >= intLen ? digits.slice(0, intLen) : digits.padEnd(intLen, '0');
      const fracPart = digits.length > intLen ? digits.slice(intLen) : '';
      body = intPart + (fracPart ? '.' + fracPart : '');
    } else {
      body = '0.' + '0'.repeat(-d - 1) + digits;
    }
    if (cutOff) body += '…';
  }
  return (negative ? '-' : '') + body;
}

/** Exact value of a mathematical result that may not terminate (e.g. 1/3), cut at maxDigits. */
export function rationalToDecimal(r: Rational, maxDigits = 40): string {
  return formatRational(r, { maxSignificant: maxDigits });
}

export function specialText(fmt: FloatFormat, bits: bigint): string | null {
  const d = decode(fmt, bits);
  if (d.cls === 'nan') return 'NaN';
  if (d.cls === 'infinity') return d.sign ? '-Infinity' : 'Infinity';
  if (d.cls === 'zero') return d.sign ? '-0' : '0';
  return null;
}

/** Every digit of the stored value (binary fractions always terminate in decimal). */
export function exactDecimal(fmt: FloatFormat, bits: bigint, opts: FormatOptions = {}): string {
  return specialText(fmt, bits) ?? formatRational(decode(fmt, bits).value as Rational, opts);
}

/** Maximum significant decimal digits that always round-trip for this format. */
export const maxRoundTripDigits = (fmt: FloatFormat): number =>
  Math.ceil(precision(fmt) * Math.log10(2)) + 1;

/** Shortest decimal that encodes back to exactly these bits. */
export function shortestDecimal(fmt: FloatFormat, bits: bigint): string {
  const sp = specialText(fmt, bits);
  if (sp !== null) return sp;
  const d = decode(fmt, bits);
  const x = absR(d.value as Rational);
  const sign: Bit = d.sign;
  const dexp = floorLog10(x);
  for (let k = 1; k <= maxRoundTripDigits(fmt); k++) {
    const e = dexp - k + 1;
    const unit: Rational = e >= 0 ? rat(pow10(e)) : rat(1n, pow10(-e));
    const q = rat(x.num * unit.den, x.den * unit.num);
    const lo = floor(q);
    const candidates = [lo];
    if (lo * q.den !== q.num) {
      const hi = lo + 1n;
      // nearest first
      const dLo = sub(q, rat(lo));
      const dHi = sub(rat(hi), q);
      if (cmp(dHi, dLo) < 0) candidates.unshift(hi);
      else candidates.push(hi);
    }
    for (const c of candidates) {
      if (c === 0n) continue;
      const y = mul(rat(c), unit);
      if (roundRational(fmt, sign, y).bits === bits) {
        return (sign ? '-' : '') + formatRational(y);
      }
    }
  }
  // unreachable for valid formats, kept as a safe fallback
  return exactDecimal(fmt, bits);
}
