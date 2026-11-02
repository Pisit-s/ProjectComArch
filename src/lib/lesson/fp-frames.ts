import {
  type Bit,
  type FloatFormat,
  type Flags,
  type RoundDecision,
  type SimulationOutcome,
  type SpecialRule,
  type StepOf,
  bias,
  classify,
  fieldsOf,
  exactDecimal,
  formatRational,
  shortestDecimal,
  toHex,
  width,
} from '@/lib/fp';
import type { CaptionKey, DetailKey, Params } from './keys';

/**
 * Frames of the add / subtract scenes (Chapter 5 scenes 5.2-5.3, the circuit in Chapter 6
 * and the playground). Built only from engine steps: the UI draws a frame without computing.
 */

/** Extra low bits kept while aligning: guard, round, sticky. */
export const GRS = 3;

export type FpStage =
  | 'unpack'
  | 'negate'
  | 'swap'
  | 'compare'
  | 'align'
  | 'alignFast'
  | 'add'
  | 'sub'
  | 'normalize'
  | 'overflow'
  | 'underflow'
  | 'round'
  | 'roundCarry'
  | 'pack'
  | 'special';

/** One row of the bit track. `value` is fixed point with fracBits + 3 bits after the point. */
export interface TrackRow {
  key: 'A' | 'B' | 'R';
  sign: Bit;
  value: bigint;
  /** Unbiased exponent shown in the "x 2^e" tag. */
  exp: number;
  /**
   * Places the bits of this row have moved right since it appeared (align, normalize, the carry
   * of rounding; negative = left). Lets the UI keep one identity per bit while it slides.
   */
  shifted: number;
  /** Sticky bucket under the S column (1 once a 1 bit fell past it). */
  sticky: Bit;
}

export interface FpFrame {
  id: string;
  stage: FpStage;
  /** 1 align, 2 add/sub, 3 normalize, 4 round, 0 = not one of the four steps. */
  bigStep: 0 | 1 | 2 | 3 | 4;
  rows: TrackRow[];
  captionKey: CaptionKey;
  params: Params;
  detailKey?: DetailKey;
  grs?: { g: Bit; r: Bit; s: Bit; lsb: Bit };
  decision?: RoundDecision;
  normalize?: {
    direction: 'left' | 'right' | 'none';
    amount: number;
    before: bigint;
    after: bigint;
    expBefore: number;
    expAfter: number;
  };
  special?: SpecialRule;
}

export interface FpScene {
  fmt: FloatFormat;
  /** Bits after the point in every row value. */
  fracBits: number;
  op: '+' | '-';
  frames: FpFrame[];
  /** Exponent difference d (0 for special cases). */
  shift: number;
  result: {
    bits: bigint;
    hex: string;
    value: string;
    /** Every digit of the stored result (finite results only). */
    stored: string | null;
    /** Exact result of the values as typed. */
    typed: string | null;
    /** stored - typed. */
    error: string | null;
    inexact: boolean;
    flags: Flags;
  };
}

const ROUND_KEY: Record<RoundDecision, CaptionKey> = {
  exact: 'fp.roundExact',
  down: 'fp.roundDown',
  up: 'fp.roundUp',
  'tie-even-down': 'fp.tieDown',
  'tie-even-up': 'fp.tieUp',
};

const BIG_STEP: Record<FpStage, FpFrame['bigStep']> = {
  unpack: 0,
  negate: 0,
  swap: 0,
  compare: 1,
  align: 1,
  alignFast: 1,
  add: 2,
  sub: 2,
  normalize: 3,
  overflow: 3,
  underflow: 3,
  round: 4,
  roundCarry: 4,
  pack: 0,
  special: 0,
};

const MAX_ALIGN_FRAMES = 4;

/** Value as shown on the page: shortest decimal, or ∞ / −∞ / NaN for the special values. */
export function displayValue(fmt: FloatFormat, bits: bigint): string {
  const cls = classify(fmt, bits);
  if (cls === 'nan') return 'NaN';
  if (cls === 'infinity') return fieldsOf(fmt, bits).sign ? '−∞' : '∞';
  return shortestDecimal(fmt, bits);
}

/** "1.101" style significand text of a fixed-point value, trailing zeros dropped. */
export function sigText(value: bigint, fracBits: number, minFrac = 1): string {
  const s = value.toString(2).padStart(fracBits + 1, '0');
  const int = s.slice(0, s.length - fracBits);
  const frac = s.slice(s.length - fracBits).replace(/0+$/, '');
  return `${int}.${frac.padEnd(minFrac, '0')}`;
}

export function buildFpFrames(
  fmt: FloatFormat,
  sim: Extract<SimulationOutcome, { ok: true }>,
): FpScene {
  const op = sim.op;
  const F = fmt.fracBits;
  const FRAC = F + GRS;
  const b0 = bias(fmt);
  const steps = sim.result.steps;
  const find = <T>(id: string) => steps.find((s) => s.id === id) as T | undefined;

  const decA = find<StepOf<'decode'>>('decode-a')!;
  const decB = find<StepOf<'decode'>>('decode-b')!;
  const negate = find<StepOf<'negate'>>('negate');
  const special = find<StepOf<'special'>>('special');

  const row = (key: TrackRow['key'], sign: Bit, sig: bigint, biased: number): TrackRow => ({
    key,
    sign,
    value: sig << BigInt(GRS),
    exp: biased - b0,
    shifted: 0,
    sticky: 0,
  });
  const A = row('A', decA.fields.sign, decA.significand, decA.exponent);
  let B = row('B', decB.fields.sign, decB.significand, decB.exponent);

  const frames: FpFrame[] = [];
  const push = (f: Omit<FpFrame, 'bigStep'>) => frames.push({ ...f, bigStep: BIG_STEP[f.stage] });

  push({
    id: 'unpack',
    stage: 'unpack',
    rows: [A, B],
    captionKey: 'fp.unpack',
    params: {
      EA: String(decA.exponent),
      EB: String(decB.exponent),
      sigA: sigText(A.value, FRAC),
      sigB: sigText(B.value, FRAC),
    },
  });

  if (negate) {
    B = { ...B, sign: (B.sign ^ 1) as Bit };
    push({ id: 'negate', stage: 'negate', rows: [A, B], captionKey: 'fp.negate', params: {} });
  }

  const bits = sim.result.bits;
  const W = width(fmt);
  const resultInfo: FpScene['result'] = {
    bits,
    hex: toHex(bits, W),
    value: displayValue(fmt, bits),
    stored: sim.stored ? exactDecimal(fmt, bits) : null,
    typed: sim.typed ? formatRational(sim.typed) : null,
    error: sim.error ? formatRational(sim.error, { maxSignificant: 12 }) : null,
    inexact: sim.result.flags.inexact,
    flags: sim.result.flags,
  };
  const packFrame = (rows: TrackRow[]) =>
    push({
      id: 'pack',
      stage: 'pack',
      rows,
      captionKey: 'fp.pack',
      params: { hex: resultInfo.hex, value: resultInfo.value },
    });

  if (special) {
    push({
      id: 'special',
      stage: 'special',
      rows: [A, B],
      captionKey: 'fp.special',
      params: { rule: special.rule },
      special: special.rule,
    });
    packFrame([A, B]);
    return { fmt, fracBits: FRAC, op, frames, shift: 0, result: resultInfo };
  }

  const compare = find<StepOf<'exponent'>>('compare')!;
  const align = find<StepOf<'align'>>('align')!;
  const sigAdd = find<StepOf<'sig-add'>>('sig-add')!;
  const d = compare.diff;

  // order rows big first, as the engine does
  let big = A;
  let small = B;
  if (compare.swapped) {
    big = B;
    small = A;
    push({ id: 'swap', stage: 'swap', rows: [big, small], captionKey: 'fp.swap', params: {} });
  }
  push({
    id: 'compare',
    stage: 'compare',
    rows: [big, small],
    captionKey: d === 0 ? 'fp.compareZero' : 'fp.compare',
    params: { d: String(d), EA: String(compare.ea), EB: String(compare.eb) },
    detailKey: 'why.bigFirst',
  });

  for (let k = 1; k <= Math.min(d, MAX_ALIGN_FRAMES); k++) {
    const st = align.stages[k];
    const moved: TrackRow = {
      ...small,
      value: st.value,
      exp: small.exp + k,
      shifted: k,
      sticky: st.sticky,
    };
    push({
      id: `align-${k}`,
      stage: 'align',
      rows: [big, moved],
      captionKey: 'fp.alignStep',
      params: { k: String(k), d: String(d) },
      detailKey: 'why.align',
    });
  }
  if (d > MAX_ALIGN_FRAMES) {
    push({
      id: 'align-fast',
      stage: 'alignFast',
      rows: [
        big,
        { ...small, value: align.after, exp: small.exp + d, shifted: d, sticky: align.sticky },
      ],
      captionKey: 'fp.alignFast',
      params: { n: String(d - MAX_ALIGN_FRAMES), d: String(d) },
      detailKey: 'why.align',
    });
  }
  const aligned: TrackRow = {
    ...small,
    value: align.after,
    exp: big.exp,
    shifted: d,
    sticky: align.sticky,
  };

  const sum: TrackRow = {
    key: 'R',
    sign: sigAdd.sign,
    value: sigAdd.result,
    exp: big.exp,
    shifted: 0,
    sticky: 0,
  };
  push({
    id: 'add',
    stage: sigAdd.op === '+' ? 'add' : 'sub',
    rows: [big, aligned, sum],
    captionKey: sigAdd.op === '+' ? 'fp.add' : 'fp.sub',
    params: {
      a: sigText(big.value, FRAC),
      b: sigText(aligned.value, FRAC),
      sum: sigText(sum.value, FRAC),
    },
  });

  if (sigAdd.result === 0n) {
    packFrame([{ ...sum, sign: 0 }]);
    return { fmt, fracBits: FRAC, op, frames, shift: d, result: resultInfo };
  }

  const norm = find<StepOf<'normalize'>>('normalize')!;
  const moved =
    norm.direction === 'right' ? norm.amount : norm.direction === 'left' ? -norm.amount : 0;
  const normRow: TrackRow = { ...sum, value: norm.after, exp: norm.expAfter - b0, shifted: moved };
  push({
    id: 'normalize',
    stage: 'normalize',
    rows: [normRow],
    captionKey:
      norm.direction === 'right'
        ? 'fp.normRight'
        : norm.direction === 'left'
          ? 'fp.normLeft'
          : 'fp.normNone',
    params: { k: String(norm.amount), e: String(norm.expAfter - b0) },
    normalize: {
      direction: norm.direction,
      amount: norm.amount,
      before: norm.before,
      after: norm.after,
      expBefore: norm.expBefore - b0,
      expAfter: norm.expAfter - b0,
    },
  });

  const range = find<StepOf<'range'>>('range');
  if (range) {
    const over = range.outcome === 'overflow';
    push({
      id: 'range',
      stage: over ? 'overflow' : 'underflow',
      rows: [normRow],
      captionKey: over ? 'fp.overflow' : 'fp.underflow',
      params: {},
    });
  }

  const rd = find<StepOf<'round'>>('round')!;
  const lsb = (rd.kept & 1n) === 1n ? 1 : 0;
  const rounded: TrackRow = {
    ...normRow,
    value: rd.result << BigInt(GRS),
    shifted: moved + (rd.carryOut ? 1 : 0),
  };
  push({
    id: 'round',
    stage: 'round',
    rows: [normRow, rounded],
    captionKey: ROUND_KEY[rd.decision],
    params: { g: String(rd.guard), r: String(rd.round), s: String(rd.sticky) },
    detailKey: 'why.grs',
    grs: { g: rd.guard, r: rd.round, s: rd.sticky, lsb },
    decision: rd.decision,
  });
  if (rd.carryOut) {
    push({
      id: 'round-carry',
      stage: 'roundCarry',
      rows: [{ ...rounded, exp: normRow.exp + 1 }],
      captionKey: 'fp.roundCarry',
      params: {},
    });
  }

  const final: TrackRow = { ...rounded, exp: rd.carryOut ? normRow.exp + 1 : normRow.exp };
  packFrame([final]);
  return { fmt, fracBits: FRAC, op, frames, shift: d, result: resultInfo };
}
