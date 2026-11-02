import {
  type Bit,
  type Width,
  addBits,
  fromSigned,
  signedRange,
  subBits,
  toBits,
  toSigned,
} from '@/lib/int/adder';
import type { CaptionKey, Params } from './keys';

/** Frames of Chapter 1 scenes 1.1 (add column by column), 1.2 (subtract on the ALU), 1.3 (wheel). */

export interface IntAddFrame {
  id: string;
  captionKey: CaptionKey;
  params: Params;
  /** Column being added (null before the first and after the last). */
  active: number | null;
  /** Sum bit of each column once known (index = column, 0 = rightmost). */
  sums: (Bit | null)[];
  /** Carry into each column once known; index `width` is the carry out of the leftmost column. */
  carries: (Bit | null)[];
}

export interface IntAddScene {
  width: Width;
  a: number;
  b: number;
  aBits: string;
  bBits: string;
  frames: IntAddFrame[];
}

export function buildIntAddFrames(width: Width, a: number, b: number): IntAddScene {
  const r = addBits(width, a, b);
  const sums: (Bit | null)[] = Array(width).fill(null);
  const carries: (Bit | null)[] = Array(width + 1).fill(null);
  const frames: IntAddFrame[] = [
    {
      id: 'start',
      captionKey: 'int.add.start',
      params: {},
      active: null,
      sums: [...sums],
      carries: [...carries],
    },
  ];
  for (let i = 0; i < width; i++) {
    const rest = r.columns.slice(i);
    if (i > 0 && rest.every((c) => c.a === 0 && c.b === 0 && c.cin === 0)) {
      for (let j = i; j < width; j++) {
        sums[j] = 0;
        carries[j + 1] = 0;
      }
      frames.push({
        id: 'rest',
        captionKey: 'int.add.rest',
        params: {},
        active: null,
        sums: [...sums],
        carries: [...carries],
      });
      break;
    }
    const c = r.columns[i];
    sums[i] = c.sum;
    carries[i] = c.cin;
    carries[i + 1] = c.cout;
    frames.push({
      id: `col-${i}`,
      captionKey: 'int.add.column',
      params: {
        i: String(i),
        a: String(c.a),
        b: String(c.b),
        cin: String(c.cin),
        sum: String(c.sum),
        cout: String(c.cout),
      },
      active: i,
      sums: [...sums],
      carries: [...carries],
    });
  }
  const bits = toBits(width, r.result);
  frames.push({
    id: 'end',
    captionKey: r.carryOut ? 'int.add.carryOut' : 'int.add.end',
    params: { bits, dec: String(r.result) },
    active: null,
    sums: [...sums],
    carries: [...carries],
  });
  return { width, a, b, aBits: toBits(width, a), bBits: toBits(width, b), frames };
}

export interface IntSubFrame {
  id: string;
  captionKey: CaptionKey;
  params: Params;
  /** Bits shown on the B input of the ALU in this frame. */
  bShown: string;
  binvert: Bit;
  carryIn: Bit;
  result: string | null;
  /** Carry leaving the leftmost column (shown fading in the last frame). */
  carryOut: Bit | null;
}

export interface IntSubScene {
  width: Width;
  aBits: string;
  bBits: string;
  frames: IntSubFrame[];
}

/** a - b on the same adder: Binvert = 1 flips B, CarryIn = 1 adds one (slide w03c pages 30-33). */
export function buildIntSubFrames(width: Width, a: number, b: number): IntSubScene {
  const s = subBits(width, a, b);
  const aBits = toBits(width, a);
  const bBits = toBits(width, b);
  const inv = toBits(width, s.inverted);
  const res = toBits(width, s.result);
  const sa = String(toSigned(width, a));
  const sb = String(toSigned(width, b));
  return {
    width,
    aBits,
    bBits,
    frames: [
      {
        id: 'rewrite',
        captionKey: 'int.sub.rewrite',
        params: { a: sa, b: sb },
        bShown: bBits,
        binvert: 0,
        carryIn: 0,
        result: null,
        carryOut: null,
      },
      {
        id: 'invert',
        captionKey: 'int.sub.invert',
        params: { b: bBits },
        bShown: inv,
        binvert: 1,
        carryIn: 0,
        result: null,
        carryOut: null,
      },
      {
        id: 'carry-in',
        captionKey: 'int.sub.carryIn',
        params: { b: sb },
        bShown: inv,
        binvert: 1,
        carryIn: 1,
        result: null,
        carryOut: null,
      },
      {
        id: 'add',
        captionKey: 'int.sub.add',
        params: {},
        bShown: inv,
        binvert: 1,
        carryIn: 1,
        result: res,
        carryOut: s.add.carryOut,
      },
      {
        id: 'end',
        captionKey: 'int.sub.end',
        params: { bits: res, dec: String(toSigned(width, s.result)) },
        bShown: inv,
        binvert: 1,
        carryIn: 1,
        result: res,
        carryOut: s.add.carryOut,
      },
    ],
  };
}

export interface WheelFrame {
  id: string;
  captionKey: CaptionKey;
  params: Params;
  /** Signed value the pin points at. */
  pin: number;
  /** Pin walk in this frame (signed number of positions, + = clockwise). */
  walk: number;
  overflow: boolean | null;
}

export interface WheelScene {
  width: 4;
  min: number;
  max: number;
  /** All 16 positions: signed value and its bits, clockwise from 0. */
  slots: { value: number; bits: string }[];
  frames: WheelFrame[];
}

/** 4-bit two's complement wheel (slide w03c pages 4-11). `b` is signed; op picks + or -. */
export function buildWheelFrames(a: number, b: number, op: '+' | '-'): WheelScene {
  const W: Width = 4;
  const { min, max } = signedRange(W);
  const pa = fromSigned(W, a);
  const pb = fromSigned(W, b);
  const r = op === '+' ? addBits(W, pa, pb).result : subBits(W, pa, pb).result;
  const value = toSigned(W, r);
  const truth = op === '+' ? a + b : a - b;
  const overflow = truth < min || truth > max;
  const walk = op === '+' ? b : -b;
  const slots = Array.from({ length: 16 }, (_, k) => ({
    value: toSigned(W, k),
    bits: toBits(W, k),
  }));
  return {
    width: 4,
    min,
    max,
    slots,
    frames: [
      {
        id: 'range',
        captionKey: 'int.wheel.range',
        params: { min: String(min), max: String(max) },
        pin: a,
        walk: 0,
        overflow: null,
      },
      {
        id: 'start',
        captionKey: 'int.wheel.start',
        params: { a: String(a) },
        pin: a,
        walk: 0,
        overflow: null,
      },
      {
        id: 'walk',
        captionKey: 'int.wheel.walk',
        params: { steps: String(Math.abs(walk)), dir: walk >= 0 ? 'cw' : 'ccw' },
        pin: value,
        walk,
        overflow: null,
      },
      overflow
        ? {
            id: 'end',
            captionKey: 'int.wheel.overflow',
            params: { max: String(max), min: String(min), r: String(value), truth: String(truth) },
            pin: value,
            walk,
            overflow: true,
          }
        : {
            id: 'end',
            captionKey: 'int.wheel.ok',
            params: { r: String(value) },
            pin: value,
            walk,
            overflow: false,
          },
    ],
  };
}
