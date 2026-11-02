import { type Op, parseDecimal } from '@/lib/fp';

/** Playground state kept in the query string so instructors can share an exact example and step. */
export interface PlayState {
  op: Op;
  a: string;
  b: string;
  /** Step id to open first (e.g. "round"). */
  step: string | null;
}

const OP_NAMES: Record<string, Op> = { add: '+', sub: '-' };
const OP_SLUG: Record<Op, string> = { '+': 'add', '-': 'sub' };
const STEP_ID = /^[a-z][a-z0-9-]{0,23}$/;

type Query = { get(name: string): string | null };

/** Read the query; invalid values fall back to `defaults` and are listed in `invalid`. */
export function parsePlayQuery(
  q: Query,
  defaults: PlayState,
): { state: PlayState; invalid: string[]; present: boolean } {
  const s: PlayState = { ...defaults };
  const invalid: string[] = [];
  let present = false;
  const op = q.get('op');
  if (op !== null) {
    present = true;
    if (op in OP_NAMES) s.op = OP_NAMES[op];
    else invalid.push('op');
  }
  for (const k of ['a', 'b'] as const) {
    const v = q.get(k);
    if (v === null) continue;
    present = true;
    if (parseDecimal(v).ok) s[k] = v.trim();
    else invalid.push(k);
  }
  const step = q.get('step');
  if (step !== null) {
    present = true;
    if (STEP_ID.test(step)) s.step = step;
    else invalid.push('step');
  }
  return { state: s, invalid, present };
}

export function toPlayQuery(s: PlayState): string {
  const p = new URLSearchParams();
  p.set('a', s.a);
  p.set('b', s.b);
  p.set('op', OP_SLUG[s.op]);
  if (s.step) p.set('step', s.step);
  return p.toString();
}
