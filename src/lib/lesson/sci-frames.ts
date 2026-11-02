import { type FloatFormat, addSub, encodeBits, printfFixed } from '@/lib/fp';
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
}

export function buildPointFrames(text: string, exp: number, base: 10 | 2 = 10): PointFrame[] {
  const n = normalizeDecimal(text, exp);
  const frames: PointFrame[] = [
    {
      id: 'start',
      captionKey: n.already ? 'point.already' : 'point.not',
      params: {},
      state: n.states[0],
      normalized: n.already,
    },
  ];
  n.states.slice(1).forEach((s, k) =>
    frames.push({
      id: `hop-${k + 1}`,
      captionKey: n.direction === 'left' ? 'point.hopLeft' : 'point.hopRight',
      params: { e: String(s.exp) },
      state: s,
      normalized: k === n.states.length - 2,
    }),
  );
  if (!n.already) {
    frames.push({
      id: 'done',
      captionKey: base === 2 ? 'point.binary' : 'point.done',
      params: {},
      state: n.states.at(-1)!,
      normalized: true,
    });
  }
  return frames;
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
