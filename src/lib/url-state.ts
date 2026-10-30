import {
  BINARY16,
  BINARY32,
  BINARY64,
  type FloatFormat,
  type Op,
  encodeBits,
  parseDecimal,
  parseHex,
  width,
} from '@/lib/fp';

export type FormatId = 'b16' | 'b32' | 'b64';
export const FORMATS: Record<FormatId, FloatFormat> = {
  b16: BINARY16,
  b32: BINARY32,
  b64: BINARY64,
};

const hexOf = (f: FloatFormat, bits: bigint) =>
  bits
    .toString(16)
    .toUpperCase()
    .padStart(Math.ceil(width(f) / 4), '0');

/** Default decoder input for a format: the bits of 0.15625. */
export const defaultHex = (id: FormatId): string =>
  hexOf(FORMATS[id], encodeBits(FORMATS[id], '0.15625')!);

/** Lab state kept in the query string so instructors can share an exact example and step. */
export interface LabState {
  fmt: FormatId;
  tab: 'calc' | 'conv';
  op: Op;
  a: string;
  b: string;
  /** Step id to open first (e.g. "round"). */
  step: string | null;
  mode: 'encode' | 'decode';
  /** Encoder input. */
  x: string;
  /** Decoder input, 8 hex digits. */
  hex: string;
}

export const LAB_DEFAULT: LabState = {
  fmt: 'b32',
  tab: 'calc',
  op: '*',
  a: '6.5',
  b: '2.75',
  step: null,
  mode: 'encode',
  x: '5.75',
  hex: '3E200000',
};

const OP_NAMES: Record<string, Op> = { add: '+', sub: '-', mul: '*', div: '/' };
const OP_SLUG: Record<Op, string> = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div' };
const STEP_ID = /^[a-z][a-z0-9-]{0,23}$/;

type Query = { get(name: string): string | null };

/** Read the query; invalid values fall back to defaults and are listed in `invalid`. */
export function parseLabQuery(q: Query): { state: LabState; invalid: string[] } {
  const s: LabState = { ...LAB_DEFAULT };
  const invalid: string[] = [];
  const fmt = q.get('fmt');
  if (fmt !== null) {
    if (fmt === 'b16' || fmt === 'b32' || fmt === 'b64') {
      s.fmt = fmt;
      s.hex = defaultHex(fmt);
    } else invalid.push('fmt');
  }
  const tab = q.get('tab');
  if (tab !== null) {
    if (tab === 'calc' || tab === 'conv') s.tab = tab;
    else invalid.push('tab');
  }
  const op = q.get('op');
  if (op !== null) {
    if (op in OP_NAMES) s.op = OP_NAMES[op];
    else invalid.push('op');
  }
  for (const k of ['a', 'b', 'x'] as const) {
    const v = q.get(k);
    if (v === null) continue;
    if (parseDecimal(v).ok) s[k] = v.trim();
    else invalid.push(k);
  }
  const mode = q.get('mode');
  if (mode !== null) {
    if (mode === 'encode' || mode === 'decode') s.mode = mode;
    else invalid.push('mode');
  }
  const hex = q.get('hex');
  if (hex !== null) {
    const r = parseHex(FORMATS[s.fmt], hex);
    if (r.ok) s.hex = hexOf(FORMATS[s.fmt], r.bits);
    else invalid.push('hex');
  }
  const step = q.get('step');
  if (step !== null) {
    if (STEP_ID.test(step)) s.step = step;
    else invalid.push('step');
  }
  return { state: s, invalid };
}

export function toLabQuery(s: LabState): string {
  const p = new URLSearchParams();
  if (s.fmt !== 'b32') p.set('fmt', s.fmt);
  p.set('tab', s.tab);
  if (s.tab === 'calc') {
    p.set('op', OP_SLUG[s.op]);
    p.set('a', s.a);
    p.set('b', s.b);
    if (s.step) p.set('step', s.step);
  } else {
    p.set('mode', s.mode);
    if (s.mode === 'encode') p.set('x', s.x);
    else p.set('hex', s.hex);
  }
  return p.toString();
}
