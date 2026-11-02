import {
  BINARY32,
  BINARY64,
  type FloatClass,
  type FloatFormat,
  bias,
  classify,
  encodeDecimal,
  exactDecimal,
  expFieldMax,
  fieldsOf,
  fracMask,
  pack,
  parseHex,
  shortestDecimal,
  splitFields,
  toHex,
  width,
} from '@/lib/fp';
import type { CaptionKey } from './keys';

/** Scene 3.3: the three exponent zones of the slide table (w03c_mult page 15). */

export type ZoneId = 'zone0' | 'zoneNormal' | 'zone255';

export const ZONES: { id: ZoneId; captionKey: CaptionKey }[] = [
  { id: 'zone0', captionKey: 'special.zone0' },
  { id: 'zoneNormal', captionKey: 'special.zoneNormal' },
  { id: 'zone255', captionKey: 'special.zone255' },
];

export function zoneOf(fmt: FloatFormat, bits: bigint): ZoneId {
  const E = fieldsOf(fmt, bits).exp;
  return E === 0 ? 'zone0' : E === expFieldMax(fmt) ? 'zone255' : 'zoneNormal';
}

/** "0", "1–254", "255": the exponent values of each zone. */
export function zoneRange(fmt: FloatFormat, zone: ZoneId): string {
  const max = expFieldMax(fmt);
  if (zone === 'zone0') return '0';
  if (zone === 'zone255') return String(max);
  return `1–${max - 1}`;
}

/** Stored value (exact, cut at 9 significant digits with "…") with ∞ for infinities. */
export function valueText(fmt: FloatFormat, bits: bigint): string {
  const s = exactDecimal(fmt, bits, { maxSignificant: 9 });
  if (s === 'Infinity') return '+∞';
  if (s === '-Infinity') return '−∞';
  return s;
}

export interface SpecialView {
  bits: bigint;
  hex: string;
  zone: ZoneId;
  cls: FloatClass;
  E: string;
  fields: { sign: string; exp: string; sig: string };
  value: string;
}

export function buildSpecialView(fmt: FloatFormat, bits: bigint): SpecialView {
  const f = splitFields(fmt, bits);
  return {
    bits,
    hex: toHex(bits, width(fmt)),
    zone: zoneOf(fmt, bits),
    cls: classify(fmt, bits),
    E: String(fieldsOf(fmt, bits).exp),
    fields: { sign: f.sign, exp: f.exp, sig: f.frac },
    value: valueText(fmt, bits),
  };
}

/** Smallest and largest positive normalized numbers (params of `special.range`). */
export function specialRange(fmt: FloatFormat): { min: string; max: string } {
  return {
    min: shortestDecimal(fmt, pack(fmt, 0, 1, 0n)),
    max: shortestDecimal(fmt, pack(fmt, 0, expFieldMax(fmt) - 1, fracMask(fmt))),
  };
}

/** Field widths and bias of float against double (params of `double.compare`). */
export function doubleCompare(): {
  e32: string;
  f32: string;
  b32: string;
  e64: string;
  f64: string;
  b64: string;
} {
  return {
    e32: String(BINARY32.expBits),
    f32: String(BINARY32.fracBits),
    b32: String(bias(BINARY32)),
    e64: String(BINARY64.expBits),
    f64: String(BINARY64.fracBits),
    b64: String(bias(BINARY64)),
  };
}

export type BitsInput = { ok: true; bits: bigint } | { ok: false; error: string };

/** Input of scenes 3.1 / 4.2: a decimal number, or hex when it starts with 0x (or hexOnly). */
export function parseBitsInput(fmt: FloatFormat, text: string, hexOnly = false): BitsInput {
  const t = text.trim();
  if (hexOnly || /^0x/i.test(t)) {
    const h = parseHex(fmt, t);
    return h.ok ? h : { ok: false, error: h.error.kind === 'empty' ? 'empty' : 'hex' };
  }
  const r = encodeDecimal(fmt, t);
  return r.ok ? { ok: true, bits: r.bits } : { ok: false, error: r.error.kind };
}
