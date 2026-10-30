import { decode, encodeStep } from './decode';
import { type Bit, type FloatFormat, bias, emin, infBits, nanBits, zeroBits } from './format';
import { type ParseError, type ParsedNumber, parseDecimal } from './parse';
import {
  type Rational,
  ZERO,
  eq,
  floor,
  floorLog2,
  fromBigInt,
  neg,
  rat,
  scale2,
  sub,
} from './rational';
import { type RoundPackResult, rangeStep, roundPack, roundStep } from './round';
import { type FpResult, type FracRow, type IntRow, NO_FLAGS, type Step } from './steps';

const GRS = 3;
/** Long binary strings in steps are cut to this many characters. */
export const MAX_STEP_BITS = 256;
const MAX_INT_ROWS = 160;

/**
 * Round an exact positive rational to the format: P = floor(x * 2^(F+3-e')) keeps the
 * guard and round bits, and the rest of the tail becomes the sticky bit.
 */
export function roundRational(
  fmt: FloatFormat,
  sign: Bit,
  x: Rational,
): RoundPackResult & {
  e: number;
  eUsed: number;
  P: bigint;
} {
  const F = fmt.fracBits;
  const e = floorLog2(x);
  const eUsed = Math.max(e, emin(fmt));
  const scaled = scale2(x, F + GRS - eUsed);
  const P = floor(scaled);
  const extraSticky: Bit = P * scaled.den !== scaled.num ? 1 : 0;
  return { ...roundPack(fmt, sign, P, F + GRS, eUsed, extraSticky), e, eUsed, P };
}

export interface EncodeResult extends FpResult {
  input: ParsedNumber;
  /** Exact stored value (null for infinity / NaN). */
  stored: Rational | null;
  /** Stored value equals the input exactly (special inputs count as equal). */
  equal: boolean;
}

export type EncodeOutcome = ({ ok: true } & EncodeResult) | { ok: false; error: ParseError };

export function encodeDecimal(fmt: FloatFormat, text: string): EncodeOutcome {
  const parsed = parseDecimal(text);
  if (!parsed.ok) return parsed;
  return { ok: true, ...encodeParsed(fmt, parsed) };
}

/** Fast path without steps: decimal text -> bits (null when the text does not parse). */
export function encodeBits(fmt: FloatFormat, text: string): bigint | null {
  const parsed = parseDecimal(text);
  if (!parsed.ok) return null;
  return encodeValueBits(fmt, parsed);
}

export function encodeValueBits(fmt: FloatFormat, parsed: ParsedNumber): bigint {
  const sign: Bit = parsed.negative ? 1 : 0;
  if (parsed.kind === 'nan') return nanBits(fmt);
  if (parsed.kind === 'inf') return infBits(fmt, sign);
  if (parsed.magnitude.num === 0n) return zeroBits(fmt, sign);
  return roundRational(fmt, sign, parsed.magnitude).bits;
}

function intRows(n: bigint): { rows: IntRow[]; truncated: boolean } {
  const rows: IntRow[] = [];
  let v = n;
  while (v > 0n && rows.length < MAX_INT_ROWS) {
    rows.push({ value: v, quotient: v >> 1n, bit: (v & 1n) === 1n ? 1 : 0 });
    v >>= 1n;
  }
  return { rows, truncated: v > 0n };
}

function fracRows(x: Rational, max: number): { rows: FracRow[]; terminated: boolean } {
  const rows: FracRow[] = [];
  let v = x;
  while (v.num !== 0n && rows.length < max) {
    const doubled = rat(v.num * 2n, v.den);
    const bit: Bit = doubled.num >= doubled.den ? 1 : 0;
    rows.push({ value: v, doubled, bit });
    v = bit ? rat(doubled.num - doubled.den, doubled.den) : doubled;
  }
  return { rows, terminated: v.num === 0n };
}

const cut = (s: string): string => (s.length > MAX_STEP_BITS ? s.slice(0, MAX_STEP_BITS) : s);

export function encodeParsed(fmt: FloatFormat, parsed: ParsedNumber): EncodeResult {
  const sign: Bit = parsed.negative ? 1 : 0;
  const steps: Step[] = [];

  if (parsed.kind !== 'finite' || parsed.magnitude.num === 0n) {
    const bits = encodeValueBits(fmt, parsed);
    const rule =
      parsed.kind === 'nan' ? 'nan-input' : parsed.kind === 'inf' ? 'inf-input' : 'zero-input';
    steps.push(
      { id: 'sign', flow: 'sign', kind: 'sign', a: sign, b: null, result: sign, rule: 'input' },
      {
        id: 'special',
        flow: 'special',
        kind: 'special',
        rule,
        resultBits: bits,
        flags: { ...NO_FLAGS },
      },
      encodeStep(fmt, bits),
    );
    const stored = parsed.kind === 'finite' ? ZERO : null;
    return {
      bits,
      steps,
      flags: { ...NO_FLAGS },
      exact: stored,
      input: parsed,
      stored,
      equal: true,
    };
  }

  const F = fmt.fracBits;
  const x = parsed.magnitude;
  const intPart = floor(x);
  const fracPart = sub(x, fromBigInt(intPart));
  const rr = roundRational(fmt, sign, x);

  const ir = intRows(intPart);
  const intBinary = cut(intPart.toString(2));
  steps.push({
    id: 'int-binary',
    flow: 'to-binary',
    kind: 'int-binary',
    intPart,
    binary: intBinary,
    rows: ir.rows,
    rowsTruncated: ir.truncated,
  });

  const fr = fracRows(fracPart, Math.min(Math.max(0, F + GRS - rr.eUsed), MAX_STEP_BITS));
  const fracBinary = fr.rows.map((r) => r.bit).join('');
  steps.push({
    id: 'frac-binary',
    flow: 'to-binary',
    kind: 'frac-binary',
    fracPart,
    rows: fr.rows,
    binary: fracBinary,
    terminated: fr.terminated,
  });

  const subnormal = rr.e < emin(fmt);
  steps.push({
    id: 'point',
    flow: 'normalize',
    kind: 'point',
    intBinary,
    fracBinary,
    e: rr.e,
    eUsed: rr.eUsed,
    direction: rr.eUsed > 0 ? 'left' : rr.eUsed < 0 ? 'right' : 'none',
    amount: Math.abs(rr.eUsed),
    subnormal,
    normalized: rr.P,
    fracBits: F + GRS,
  });

  steps.push({
    id: 'sign',
    flow: 'sign',
    kind: 'sign',
    a: sign,
    b: null,
    result: sign,
    rule: 'input',
  });
  steps.push({
    id: 'exponent',
    flow: 'exponent',
    kind: 'exponent',
    mode: 'encode-bias',
    ea: rr.eUsed,
    eb: 0,
    bias: bias(fmt),
    result: subnormal ? 0 : rr.eUsed + bias(fmt),
    diff: 0,
    swapped: false,
  });

  if (rr.info.range !== 'ok') steps.push(rangeStep(fmt, rr.info));
  steps.push(roundStep(rr.info), encodeStep(fmt, rr.bits));

  const input = sign ? neg(x) : x;
  const stored = decode(fmt, rr.bits).value;
  return {
    bits: rr.bits,
    steps,
    flags: rr.flags,
    exact: input,
    input: parsed,
    stored,
    equal: stored !== null && eq(stored, input),
  };
}
