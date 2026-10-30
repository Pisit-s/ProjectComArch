import { type Op, parseDecimal, parseHex, BINARY32 } from '@/lib/fp';

/** Lab state kept in the query string so instructors can share an exact example and step. */
export interface LabState {
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
    const r = parseHex(BINARY32, hex);
    if (r.ok) s.hex = r.bits.toString(16).toUpperCase().padStart(8, '0');
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
