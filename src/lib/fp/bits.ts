import { type Fields, type FloatFormat, fieldsOf, width } from './format';

export function toBinaryString(bits: bigint, w: number): string {
  if (bits < 0n) throw new RangeError('bits must be non-negative');
  const s = bits.toString(2);
  if (s.length > w) throw new RangeError(`value needs ${s.length} bits, width is ${w}`);
  return s.padStart(w, '0');
}

export interface FieldStrings {
  sign: string;
  exp: string;
  frac: string;
}

export function splitFields(fmt: FloatFormat, bits: bigint): FieldStrings {
  const s = toBinaryString(bits, width(fmt));
  return {
    sign: s.slice(0, 1),
    exp: s.slice(1, 1 + fmt.expBits),
    frac: s.slice(1 + fmt.expBits),
  };
}

export function fields(fmt: FloatFormat, bits: bigint): Fields {
  return fieldsOf(fmt, bits);
}

/** "01000000101110000000000000000000" -> "0100 0000 1011 1000 ..." */
export function groupNibbles(binary: string, sep = ' '): string {
  const out: string[] = [];
  for (let i = 0; i < binary.length; i += 4) out.push(binary.slice(i, i + 4));
  return out.join(sep);
}

/** Hex with 0x prefix, upper case, zero padded to the format width. */
export function toHex(bits: bigint, w: number): string {
  return (
    '0x' +
    bits
      .toString(16)
      .toUpperCase()
      .padStart(Math.ceil(w / 4), '0')
  );
}

export type BitParseError =
  | { kind: 'empty' }
  | { kind: 'invalid-char'; char: string }
  | { kind: 'wrong-length'; expected: number; got: number };

export type BitParseResult = { ok: true; bits: bigint } | { ok: false; error: BitParseError };

/** Accepts 0/1 with optional spaces, underscores or dashes as separators. */
export function parseBitString(fmt: FloatFormat, text: string): BitParseResult {
  const cleaned = text.replace(/[\s_-]/g, '');
  if (cleaned === '') return { ok: false, error: { kind: 'empty' } };
  const bad = cleaned.match(/[^01]/);
  if (bad) return { ok: false, error: { kind: 'invalid-char', char: bad[0] } };
  const w = width(fmt);
  if (cleaned.length !== w) {
    return { ok: false, error: { kind: 'wrong-length', expected: w, got: cleaned.length } };
  }
  return { ok: true, bits: BigInt('0b' + cleaned) };
}

/** Accepts exactly width/4 hex digits with optional 0x prefix and spaces. */
export function parseHex(fmt: FloatFormat, text: string): BitParseResult {
  const cleaned = text.replace(/[\s_]/g, '').replace(/^0x/i, '');
  if (cleaned === '') return { ok: false, error: { kind: 'empty' } };
  const bad = cleaned.match(/[^0-9a-f]/i);
  if (bad) return { ok: false, error: { kind: 'invalid-char', char: bad[0] } };
  const digits = Math.ceil(width(fmt) / 4);
  if (cleaned.length !== digits) {
    return { ok: false, error: { kind: 'wrong-length', expected: digits, got: cleaned.length } };
  }
  return { ok: true, bits: BigInt('0x' + cleaned) };
}
