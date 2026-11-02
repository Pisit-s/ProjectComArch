import {
  type FloatFormat,
  addSub,
  encodeBits,
  encodeDecimal,
  printfFixed,
  shortestDecimal,
  toBinaryString,
  toHex,
  width,
} from '@/lib/fp';
import { addBits } from '@/lib/int/adder';
import {
  type DecimalAddition,
  type SciState,
  decimalAdd,
  normalizeDecimal,
} from '@/lib/sci/decimal';
import type { CaptionKey, Params } from './keys';

/** Frames of Chapter 2 (C code, moving point) and the 4-digit warm-up of Chapter 5. */

export interface PointFrame {
  id: string;
  captionKey: CaptionKey;
  params: Params;
  state: SciState;
  normalized: boolean;
  /** Where the point sits in `PointScene.digits` (number of digits before it). */
  pointAt: number;
}

export interface PointScene {
  base: 10 | 2;
  /** Every digit as typed, without the point; the point hops between them. */
  digits: string;
  /** Index of the first non-zero digit (zeros before it carry no value once the point passes). */
  lead: number;
  frames: PointFrame[];
}

/** Scene 2.2: the point hops one digit at a time until the number is normalized. */
export function buildPointScene(text: string, exp: number, base: 10 | 2 = 10): PointScene {
  const [int, frac = ''] = text.trim().split('.');
  const digits = int + frac;
  const start = int.length;
  const n = normalizeDecimal(text, exp);
  const step = n.direction === 'left' ? -1 : 1;
  const frames: PointFrame[] = [
    {
      id: 'start',
      captionKey: n.already ? 'point.already' : 'point.not',
      params: {},
      state: n.states[0],
      normalized: n.already,
      pointAt: start,
    },
  ];
  n.states.slice(1).forEach((s, k) =>
    frames.push({
      id: `hop-${k + 1}`,
      captionKey: n.direction === 'left' ? 'point.hopLeft' : 'point.hopRight',
      params: { e: String(s.exp) },
      state: s,
      normalized: k === n.states.length - 2,
      pointAt: start + step * (k + 1),
    }),
  );
  if (!n.already) {
    frames.push({
      id: 'done',
      captionKey: base === 2 ? 'point.binary' : 'point.done',
      params: {},
      state: n.states.at(-1)!,
      normalized: true,
      pointAt: frames.at(-1)!.pointAt,
    });
  }
  return { base, digits, lead: digits.search(/[1-9]/), frames };
}

export function buildPointFrames(text: string, exp: number, base: 10 | 2 = 10): PointFrame[] {
  return buildPointScene(text, exp, base).frames;
}

/** The binary chip of scene 2.2: a decimal value written in base 2 by the engine (6.5 → 110.1). */
export function binaryOf(fmt: FloatFormat, text: string): SciState {
  const r = encodeDecimal(fmt, text);
  if (!r.ok) throw new RangeError('bad decimal');
  const p = r.steps.find((s) => s.kind === 'point');
  if (!p || p.kind !== 'point') throw new RangeError('no binary form');
  const frac = p.fracBinary.replace(/0+$/, '');
  return { text: frac ? `${p.intBinary}.${frac}` : p.intBinary, exp: 0 };
}

export interface CCode {
  intResult: string;
  floatResult: string;
  output: string;
}

/** int i = a + b; float f = x + y; printf(fmt, i, f) — every printed digit from the models. */
export function runCCode(
  fmt: FloatFormat,
  a: number,
  b: number,
  x: string,
  y: string,
  decimals = 6,
): CCode {
  const intResult = String(addBits(8, a, b).result);
  const fx = encodeBits(fmt, x);
  const fy = encodeBits(fmt, y);
  if (fx === null || fy === null) throw new RangeError('bad float literal');
  const floatResult = printfFixed(fmt, addSub(fmt, fx, fy, '+').bits, decimals);
  return { intResult, floatResult, output: `${intResult} ${floatResult}` };
}

export interface HeroRow {
  /** Decimal as the learner reads it (the sum is the engine's shortest round-trip decimal). */
  text: string;
  /** All bits, sign first. */
  bits: string;
  hex: string;
}

/** Hero teaser: x + y = sum, each also as its stored bits and hex (PLAN.md 3.1). */
export function buildHeroTeaser(fmt: FloatFormat, x: string, y: string): HeroRow[] {
  const w = width(fmt);
  const a = encodeBits(fmt, x);
  const b = encodeBits(fmt, y);
  if (a === null || b === null) throw new RangeError('bad float literal');
  const s = addSub(fmt, a, b, '+').bits;
  const row = (text: string, v: bigint): HeroRow => ({
    text,
    bits: toBinaryString(v, w),
    hex: toHex(v, w),
  });
  return [row(x, a), row(y, b), row(shortestDecimal(fmt, s), s)];
}

export interface CFrame {
  id: string;
  captionKey: CaptionKey;
  /** Code line lit in this frame. */
  line: number;
  /** Unit the line goes through. */
  unit: 'alu' | 'fpu' | null;
  /** Value that unit gives back (null when no unit). */
  value: string | null;
  /** Text printed so far. */
  output: string;
}

/**
 * Scene 2.1. main: int i = a + b; float f = x + y; printf("%d %f\n", i, f).
 * teaser: float g = x + y; printf("%.Nf\n", g). Every printed digit comes from the models.
 */
export function buildCCodeFrames(
  fmt: FloatFormat,
  variant: 'main' | 'teaser',
  a: number,
  b: number,
  x: string,
  y: string,
  decimals: number,
): CFrame[] {
  const c = runCCode(fmt, a, b, x, y, decimals);
  if (variant === 'teaser') {
    return [
      {
        id: 'float',
        captionKey: 'c.float',
        line: 0,
        unit: 'fpu',
        value: c.floatResult,
        output: '',
      },
      {
        id: 'print',
        captionKey: 'c.teaser',
        line: 1,
        unit: null,
        value: null,
        output: c.floatResult,
      },
    ];
  }
  return [
    { id: 'int', captionKey: 'c.int', line: 0, unit: 'alu', value: c.intResult, output: '' },
    { id: 'float', captionKey: 'c.float', line: 1, unit: 'fpu', value: c.floatResult, output: '' },
    { id: 'print', captionKey: 'c.print', line: 2, unit: null, value: null, output: c.output },
  ];
}

export interface Dec4Frame {
  id: string;
  captionKey: CaptionKey;
  params: Params;
  bigStep: 0 | 1 | 2 | 3 | 4;
  /** Add frame: powers of ten that receive a carry (digit by digit, right to left). */
  carries?: number[];
}

/** Powers of ten that receive a carry when adding two decimals written digit by digit. */
export function decimalCarries(a: string, b: string): number[] {
  const [ai, af = ''] = a.split('.');
  const [bi, bf = ''] = b.split('.');
  const frac = Math.max(af.length, bf.length);
  const int = Math.max(ai.length, bi.length);
  const da = (ai.padStart(int, '0') + af.padEnd(frac, '0')).split('').map(Number);
  const db = (bi.padStart(int, '0') + bf.padEnd(frac, '0')).split('').map(Number);
  const out: number[] = [];
  let carry = 0;
  for (let i = da.length - 1; i >= 0; i--) {
    carry = da[i] + db[i] + carry >= 10 ? 1 : 0;
    // digit i has power (int - 1 - i); its carry goes one place to the left
    if (carry) out.push(int - i);
  }
  return out;
}

export interface Dec4Scene {
  add: DecimalAddition;
  frames: Dec4Frame[];
}

/** Scene 5.1: 9.999 x 10^1 + 1.610 x 10^-1 with 4 digits (P&H 3.5). */
export function buildDec4Frames(a: SciState, b: SciState, p = 4): Dec4Scene {
  const r = decimalAdd(a, b, p);
  return {
    add: r,
    frames: [
      { id: 'start', captionKey: 'dec4.start', params: { p: String(p) }, bigStep: 0 },
      { id: 'compare', captionKey: 'dec4.compare', params: { d: String(r.d) }, bigStep: 1 },
      {
        id: 'align',
        captionKey: 'dec4.align',
        params: { d: String(r.d), lost: r.align.lost },
        bigStep: 1,
      },
      {
        id: 'add',
        captionKey: 'dec4.add',
        params: { a: r.add.big, b: r.add.small, sum: r.add.sum },
        bigStep: 2,
        carries: decimalCarries(r.add.big, r.add.small),
      },
      {
        id: 'normalize',
        captionKey: 'dec4.normalize',
        params: { norm: r.normalize.after, e: String(r.normalize.exp) },
        bigStep: 3,
      },
      {
        id: 'round',
        captionKey: 'dec4.round',
        params: { rounded: r.round.after, e: String(r.round.exp) },
        bigStep: 4,
      },
    ],
  };
}
