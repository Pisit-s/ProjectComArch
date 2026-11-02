import {
  type Bit,
  type EncodeResult,
  type FloatFormat,
  R,
  type StepOf,
  convertFraction,
  decodeWithSteps,
  exactDecimal,
  formatRational,
  groupNibbles,
  shortestDecimal,
  splitFields,
  toBinaryString,
  toHex,
  width,
} from '@/lib/fp';
import type { CaptionKey, Params } from './keys';
import { sigText } from './fp-frames';

/** Frames of Chapter 4 (convert / decode) and the layout scene 3.1, from engine steps. */

export interface RegisterFill {
  sign: string | null;
  exp: string | null;
  sig: string | null;
}

export interface FracRowView {
  f: string;
  d: string;
  bit: Bit;
}

export type EncodeStage =
  | 'special'
  | 'split'
  | 'int'
  | 'times2'
  | 'loop'
  | 'join'
  | 'normalize'
  | 'sign'
  | 'exp'
  | 'sig'
  | 'hidden'
  | 'round'
  | 'hex';

export interface EncodeFrame {
  id: string;
  stage: EncodeStage;
  captionKey: CaptionKey;
  params: Params;
  /** Register fields filled so far. */
  register: RegisterFill;
  /** Doubling rows shown so far (times2 / loop frames). */
  rows: FracRowView[];
}

/** Place value chips of the integer part (only for short integer parts). */
export interface IntTerm {
  weight: string;
  bit: Bit;
}

/**
 * Point hop of the normalize frame: `digits` with the binary point after `from` digits moves to
 * after `to` digits. `lead` digits in front of the leading 1 fade out afterwards.
 */
export interface NormalizeView {
  digits: string;
  /** The digit string was cut (more bits follow). */
  more: boolean;
  from: number;
  to: number;
  lead: number;
  hops: number;
  e: number;
  /** Too many digits to animate: show before / after only. */
  compact: boolean;
  before: string;
  after: string;
}

export interface Nibble {
  bits: string;
  hex: string;
}

export interface EncodeScene {
  bits: bigint;
  hex: string;
  /** Every digit of the stored value (for the "not exact" warning). */
  storedExact: string;
  /** Place values of the integer part; empty when the integer part is longer than 8 bits. */
  intTerms: IntTerm[];
  normalize: NormalizeView | null;
  /** 32 bits in groups of 4 with their hex digit. */
  nibbles: Nibble[];
  /** Integer part and fraction bits (fraction cut at the bits the format needs). */
  intBin: string;
  fracBin: string;
  fracTerminated: boolean;
  /** Stored value differs from the input. */
  inexact: boolean;
  stored: string;
  frames: EncodeFrame[];
}

export const MAX_TIMES2_FRAMES = 8;
const MAX_INT_TERMS = 8;
/** Digits drawn in the normalize hop (more than this: before / after only). */
const MAX_HOP_DIGITS = 26;
/** Bits shown after the point of the normalized form. */
const AFTER_BITS = 10;

function intTermsOf(bin: string): IntTerm[] {
  if (bin.length > MAX_INT_TERMS) return [];
  return [...bin].map((c, i) => ({
    weight: (1n << BigInt(bin.length - 1 - i)).toString(),
    bit: c === '1' ? 1 : 0,
  }));
}

function normalizeView(pt: StepOf<'point'>): NormalizeView {
  const all = pt.intBinary + pt.fracBinary;
  const from = pt.intBinary.length;
  const to =
    pt.direction === 'left' ? from - pt.amount : pt.direction === 'right' ? from + pt.amount : from;
  const lead = Math.max(0, to - 1);
  const want = Math.max(from, to) + 6;
  const digits = all.slice(0, want).padEnd(Math.max(from, to), '0');
  const tail = all.slice(to, to + AFTER_BITS);
  return {
    digits,
    more: all.length > digits.length,
    from,
    to,
    lead,
    hops: pt.amount,
    e: pt.eUsed,
    compact: digits.length > MAX_HOP_DIGITS,
    before: `${pt.intBinary}.${pt.fracBinary.slice(0, AFTER_BITS) || '0'}${pt.fracBinary.length > AFTER_BITS ? '…' : ''}`,
    after: `${all[to - 1] ?? '0'}.${tail || '0'}${all.length > to + AFTER_BITS ? '…' : ''}`,
  };
}

function nibblesOf(bits: bigint, w: number): Nibble[] {
  const hex = toHex(bits, w).slice(2);
  return groupNibbles(toBinaryString(bits, w))
    .split(' ')
    .map((b, i) => ({ bits: b, hex: hex[i] }));
}

export function buildEncodeFrames(fmt: FloatFormat, r: EncodeResult): EncodeScene {
  const W = width(fmt);
  const f = splitFields(fmt, r.bits);
  const hex = toHex(r.bits, W);
  const find = <T>(id: string) => r.steps.find((s) => s.id === id) as T | undefined;
  const frames: EncodeFrame[] = [];
  const empty: RegisterFill = { sign: null, exp: null, sig: null };
  const full: RegisterFill = { sign: f.sign, exp: f.exp, sig: f.frac };
  const base = {
    bits: r.bits,
    hex,
    inexact: !r.equal,
    stored: shortestDecimal(fmt, r.bits),
    storedExact: exactDecimal(fmt, r.bits),
    nibbles: nibblesOf(r.bits, W),
  };

  const special = find<StepOf<'special'>>('special');
  if (special) {
    frames.push({
      id: 'special',
      stage: 'special',
      captionKey: 'enc.special',
      params: { rule: special.rule },
      register: full,
      rows: [],
    });
    frames.push({
      id: 'hex',
      stage: 'hex',
      captionKey: 'enc.hex',
      params: { hex },
      register: full,
      rows: [],
    });
    return {
      ...base,
      intBin: '',
      fracBin: '',
      fracTerminated: true,
      intTerms: [],
      normalize: null,
      frames,
    };
  }

  const ib = find<StepOf<'int-binary'>>('int-binary')!;
  const fb = find<StepOf<'frac-binary'>>('frac-binary')!;
  const pt = find<StepOf<'point'>>('point')!;
  const ex = find<StepOf<'exponent'>>('exponent')!;
  const rd = find<StepOf<'round'>>('round')!;

  frames.push({
    id: 'split',
    stage: 'split',
    captionKey: 'enc.split',
    params: { int: ib.intPart.toString(), frac: formatRational(fb.fracPart) },
    register: empty,
    rows: [],
  });
  frames.push({
    id: 'int',
    stage: 'int',
    captionKey: 'enc.int',
    params: { int: ib.intPart.toString(), intBin: ib.binary },
    register: empty,
    rows: [],
  });

  const views: FracRowView[] = fb.rows.map((row) => ({
    f: formatRational(row.value),
    d: formatRational(row.doubled),
    bit: row.bit,
  }));
  const shown = Math.min(views.length, MAX_TIMES2_FRAMES);
  for (let k = 0; k < shown; k++) {
    frames.push({
      id: `times2-${k + 1}`,
      stage: 'times2',
      captionKey: 'enc.times2',
      params: { f: views[k].f, d: views[k].d, bit: String(views[k].bit) },
      register: empty,
      rows: views.slice(0, k + 1),
    });
  }
  if (!fb.terminated && fb.fracPart.num !== 0n) {
    const rep = convertFraction(fb.fracPart, MAX_TIMES2_FRAMES).repeat;
    if (rep && rep.start - 1 + rep.length <= Math.max(shown, rep.start)) {
      const at = convertFraction(fb.fracPart, rep.start).rows[rep.start - 1];
      frames.push({
        id: 'loop',
        stage: 'loop',
        captionKey: 'enc.loop',
        params: {
          f: formatRational(at.value),
          start: String(rep.start),
          length: String(rep.length),
        },
        register: empty,
        rows: views.slice(0, shown),
      });
    }
  }

  const fracShown = fb.binary.slice(0, Math.max(fb.binary.length, 1));
  const joined = `${ib.binary}.${fracShown || '0'}${fb.terminated ? '' : '…'}`;
  frames.push({
    id: 'join',
    stage: 'join',
    captionKey: 'enc.join',
    params: { bin: joined },
    register: empty,
    rows: views.slice(0, shown),
  });

  frames.push({
    id: 'normalize',
    stage: 'normalize',
    captionKey: 'enc.normalize',
    params: { dir: pt.direction, k: String(pt.amount), e: String(pt.eUsed) },
    register: empty,
    rows: [],
  });
  frames.push({
    id: 'sign',
    stage: 'sign',
    captionKey: 'enc.sign',
    params: { s: f.sign },
    register: { ...empty, sign: f.sign },
    rows: [],
  });
  frames.push({
    id: 'exp',
    stage: 'exp',
    captionKey: 'enc.exp',
    params: { e: String(pt.eUsed), E: String(ex.result), Ebits: f.exp },
    register: { ...empty, sign: f.sign, exp: f.exp },
    rows: [],
  });
  frames.push({
    id: 'sig',
    stage: 'sig',
    captionKey: 'enc.sig',
    params: { sig: f.frac },
    register: full,
    rows: [],
  });
  frames.push({
    id: 'hidden',
    stage: 'hidden',
    captionKey: 'enc.hidden',
    params: {},
    register: full,
    rows: [],
  });
  if (rd.decision !== 'exact') {
    frames.push({
      id: 'round',
      stage: 'round',
      captionKey: 'enc.round',
      params: {
        g: String(rd.guard),
        r: String(rd.round),
        s: String(rd.sticky),
        decision: rd.decision,
        stored: base.stored,
      },
      register: full,
      rows: [],
    });
  }
  frames.push({
    id: 'hex',
    stage: 'hex',
    captionKey: 'enc.hex',
    params: { hex },
    register: full,
    rows: [],
  });

  return {
    ...base,
    intTerms: intTermsOf(ib.binary),
    normalize: normalizeView(pt),
    intBin: ib.binary,
    fracBin: fb.binary,
    fracTerminated: fb.terminated,
    frames,
  };
}

export interface DecodeFrame {
  id: string;
  captionKey: CaptionKey;
  params: Params;
  /** Part of the register / formula highlighted. */
  focus: 'fields' | 'exp' | 'sig' | 'value';
}

export interface DecodeScene {
  bits: bigint;
  hex: string;
  fields: { sign: string; exp: string; sig: string };
  value: string;
  frames: DecodeFrame[];
}

/** Scene 4.2: bits back to a value. */
export function buildDecodeFrames(fmt: FloatFormat, bits: bigint): DecodeScene {
  const d = decodeWithSteps(fmt, bits);
  const f = splitFields(fmt, bits);
  const value = exactDecimal(fmt, bits);
  const frames: DecodeFrame[] = [
    { id: 'fields', captionKey: 'dec.fields', params: {}, focus: 'fields' },
  ];
  const exp = d.steps.find((s) => s.kind === 'exponent') as StepOf<'exponent'> | undefined;
  const sig = d.steps.find((s) => s.kind === 'significand') as StepOf<'significand'> | undefined;
  if (exp && sig) {
    frames.push({
      id: 'exp',
      captionKey: 'dec.exp',
      params: { E: String(exp.ea), e: String(exp.result) },
      focus: 'exp',
    });
    frames.push({
      id: 'sig',
      captionKey: 'dec.sig',
      params: { sig: sigText(sig.significand, fmt.fracBits) },
      focus: 'sig',
    });
  }
  frames.push({ id: 'value', captionKey: 'dec.value', params: { value }, focus: 'value' });
  return {
    bits,
    hex: toHex(bits, width(fmt)),
    fields: { sign: f.sign, exp: f.exp, sig: f.frac },
    value,
    frames,
  };
}

export interface LayoutFrame {
  id: string;
  captionKey: CaptionKey;
  params: Params;
  /** Which parts are coloured / revealed so far. */
  reveal: { sign: boolean; exp: boolean; sig: boolean; formula: boolean };
  /** Formula pieces filled with values so far. */
  plug: { sign: boolean; exp: boolean; sig: boolean; value: boolean };
}

export interface LayoutScene {
  bits: bigint;
  hex: string;
  fields: { sign: string; exp: string; sig: string };
  /** Values plugged into the formula. */
  plug: {
    s: string;
    E: string;
    e: string;
    /** 2^e as a decimal (or "2^e" when long). */
    pow: string;
    /** 1.significand in binary, trailing zeros cut. */
    sigBin: string;
    sigDec: string;
    value: string;
  };
  frames: LayoutFrame[];
}

/** 2^k as a short decimal, or "2^k" when the decimal is long (e.g. 2^-10, 2^127). */
export function powLabel(k: number): string {
  const s = formatRational(R.pow2(k));
  return s.length <= 8 ? s : `2^${k}`;
}

/** Scene 3.1: split 32 bits into fields and plug them into the formula (normal numbers only). */
export function buildLayoutFrames(fmt: FloatFormat, bits: bigint): LayoutScene | null {
  const d = decodeWithSteps(fmt, bits);
  if (d.cls !== 'normal') return null;
  const f = splitFields(fmt, bits);
  const e = d.exponent;
  const sigDec = formatRational(R.rat(d.significand, 1n << BigInt(fmt.fracBits)));
  const value = shortestDecimal(fmt, bits);
  const none = { sign: false, exp: false, sig: false, formula: false };
  const all = { sign: true, exp: true, sig: true, formula: true };
  const plug0 = { sign: false, exp: false, sig: false, value: false };
  return {
    bits,
    hex: toHex(bits, width(fmt)),
    fields: { sign: f.sign, exp: f.exp, sig: f.frac },
    plug: {
      s: f.sign,
      E: String(d.expField),
      e: String(e),
      pow: powLabel(e),
      sigBin: sigText(d.significand, fmt.fracBits),
      sigDec,
      value,
    },
    frames: [
      { id: 'bits', captionKey: 'layout.bits', params: {}, reveal: none, plug: plug0 },
      {
        id: 'sign',
        captionKey: 'layout.sign',
        params: {},
        reveal: { ...none, sign: true },
        plug: plug0,
      },
      {
        id: 'exp',
        captionKey: 'layout.exp',
        params: {},
        reveal: { ...none, sign: true, exp: true },
        plug: plug0,
      },
      {
        id: 'sig',
        captionKey: 'layout.sig',
        params: {},
        reveal: { ...all, formula: false },
        plug: plug0,
      },
      { id: 'formula', captionKey: 'layout.formula', params: {}, reveal: all, plug: plug0 },
      {
        id: 'plug-sign',
        captionKey: 'layout.plugSign',
        params: { s: f.sign, sign: f.sign === '1' ? 'neg' : 'pos' },
        reveal: all,
        plug: { ...plug0, sign: true },
      },
      {
        id: 'plug-exp',
        captionKey: 'layout.plugExp',
        params: { E: String(d.expField), e: String(e) },
        reveal: all,
        plug: { ...plug0, sign: true, exp: true },
      },
      {
        id: 'plug-sig',
        captionKey: 'layout.plugSig',
        params: { sigDec },
        reveal: all,
        plug: { sign: true, exp: true, sig: true, value: false },
      },
      {
        id: 'value',
        captionKey: 'layout.value',
        params: { sigDec, e: String(e), value },
        reveal: all,
        plug: { sign: true, exp: true, sig: true, value: true },
      },
    ],
  };
}
